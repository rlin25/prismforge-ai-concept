// API Route for Phase 1 Chat with Claude Integration
// PrismForge AI - Professional M&A Validation Platform

import { NextRequest, NextResponse } from 'next/server';
import { Phase1ChatService } from '@/lib/claude-api';
import { supabase } from '@/lib/supabase';
import type { 
  AnalysisContext,
  ChatMessage,
  TokenBudget,
  ProcessedDocument 
} from '@/types/phase1.types';

const chatService = new Phase1ChatService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and session ID are required' },
        { status: 400 }
      );
    }

    // Get session information
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 404 }
      );
    }

    // Get current token budget
    const tokenBudget = await chatService.getCurrentTokenBudget(sessionId);
    
    if (!tokenBudget.canContinue) {
      return NextResponse.json(
        { 
          error: 'Token budget exceeded',
          message: 'You have reached the 15,000 token limit for this FREE exploration session. Start a new session or upgrade to Phase 2 professional validation ($500 per professional validation) for comprehensive analysis.',
          tokenBudget 
        },
        { status: 429 }
      );
    }

    // Get chat history
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    // Get processed documents for context
    const { data: documents, error: docsError } = await supabase
      .from('document_processing')
      .select('*')
      .eq('session_id', sessionId)
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Error fetching processed documents:', docsError);
    }

    // Build analysis context
    const processedDocuments: ProcessedDocument[] = (documents || []).map(doc => ({
      id: doc.id,
      fileName: doc.file_name,
      fileType: doc.file_type,
      fileSizeBytes: doc.file_size_bytes,
      processingStatus: doc.processing_status,
      extractedData: doc.extracted_data || {},
      documentSummary: doc.document_summary,
      keyInsights: doc.key_insights || [],
      classification: doc.classification,
      tokenUsage: doc.token_usage || 0,
      processingCostCents: 0,
      organizationId: doc.organization_id,
      uploadedBy: doc.uploaded_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    }));

    const analysisContext: AnalysisContext = {
      documentSummaries: processedDocuments
        .filter(doc => doc.documentSummary)
        .map(doc => `${doc.fileName}: ${doc.documentSummary}`),
      userObjectives: session.refined_objectives?.primary || undefined,
      chatHistory: chatHistory.map(msg => ({
        id: msg.id,
        sessionId: msg.session_id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        metadata: msg.metadata || {},
      })),
      keyInsights: processedDocuments.flatMap(doc => doc.keyInsights),
      identifiedRisks: session.preliminary_insights?.risks || [],
      assumptionsFound: session.preliminary_insights?.assumptions || [],
      analysisScope: `Analysis of ${processedDocuments.length} document(s)`,
      focusAreas: session.preliminary_insights?.focus_areas || [],
    };

    // Save user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        metadata: {
          tokenCount: Math.ceil(message.length / 4), // Rough estimate
        },
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Process message with Claude
    const chatResponse = await chatService.processUserMessage(
      sessionId,
      session.user_id,
      session.organization_id,
      message,
      analysisContext,
      tokenBudget
    );

    if (chatResponse.status === 'error') {
      return NextResponse.json(
        { 
          error: 'Chat processing failed',
          message: chatResponse.errorMessage,
          tokenBudget: await chatService.getCurrentTokenBudget(sessionId)
        },
        { status: 500 }
      );
    }

    // Save assistant response
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: chatResponse.content,
        metadata: {
          tokenCount: chatResponse.tokenUsage.outputTokens,
          apiCallId: chatResponse.apiCallId,
          responseTime: chatResponse.responseTime,
        },
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
    }

    // Get updated token budget
    const updatedTokenBudget = await chatService.getCurrentTokenBudget(sessionId);

    // Check if session should transition to Phase 2 readiness
    await checkPhase2Readiness(sessionId, analysisContext, processedDocuments);

    return NextResponse.json({
      message: chatResponse.content,
      tokenUsage: chatResponse.tokenUsage,
      tokenBudget: updatedTokenBudget,
      responseTime: chatResponse.responseTime,
      messageId: assistantMessage?.id,
      canContinue: updatedTokenBudget.canContinue,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Chat processing failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get chat messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching chat messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Get token budget
    const tokenBudget = await chatService.getCurrentTokenBudget(sessionId);

    // Get Phase 2 readiness
    const { data: readiness } = await supabase
      .from('phase2_readiness')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    const chatMessages: ChatMessage[] = messages.map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      metadata: msg.metadata || {},
    }));

    return NextResponse.json({
      messages: chatMessages,
      tokenBudget,
      phase2Ready: readiness?.is_ready || false,
      readinessScore: readiness?.readiness_score || 0,
    });

  } catch (error) {
    console.error('Error fetching chat data:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch chat data' },
      { status: 500 }
    );
  }
}

async function checkPhase2Readiness(
  sessionId: string,
  context: AnalysisContext,
  documents: ProcessedDocument[]
): Promise<void> {
  try {
    // Calculate readiness score based on multiple factors
    let readinessScore = 0;
    let isReady = false;

    // Factor 1: Documents processed (0-0.3)
    const documentsScore = Math.min(documents.length / 3, 1) * 0.3;
    readinessScore += documentsScore;

    // Factor 2: Chat interaction depth (0-0.3)
    const chatScore = Math.min(context.chatHistory.length / 10, 1) * 0.3;
    readinessScore += chatScore;

    // Factor 3: Insights identified (0-0.2)
    const insightsScore = Math.min(context.keyInsights.length / 10, 1) * 0.2;
    readinessScore += insightsScore;

    // Factor 4: Context completeness (0-0.2)
    const contextScore = context.documentSummaries.length > 0 && 
                        context.keyInsights.length > 0 && 
                        context.chatHistory.length > 5 ? 0.2 : 0;
    readinessScore += contextScore;

    // Ready if score > 0.7 (70%)
    isReady = readinessScore > 0.7;

    // Prepare context summary for Phase 2
    const contextSummary = `Analyzed ${documents.length} document(s) with ${context.keyInsights.length} key insights through ${context.chatHistory.length} chat interactions.`;
    
    const analysisObjectives = {
      primary: context.userObjectives || 'General M&A validation',
      secondary: context.focusAreas,
      scope: context.analysisScope,
    };

    const preliminaryInsights = {
      keyFindings: context.keyInsights,
      identifiedRisks: context.identifiedRisks,
      assumptions: context.assumptionsFound,
      focusAreas: context.focusAreas,
    };

    // Upsert readiness record
    await supabase
      .from('phase2_readiness')
      .upsert({
        session_id: sessionId,
        is_ready: isReady,
        readiness_score: readinessScore,
        documents_processed: documents.length,
        key_insights_identified: context.keyInsights.length,
        questions_refined: context.chatHistory.filter(m => m.role === 'user').length,
        context_completeness_score: contextScore / 0.2, // Normalize to 0-1
        context_summary: contextSummary,
        analysis_objectives: analysisObjectives,
        preliminary_insights: preliminaryInsights,
        identified_risks: context.identifiedRisks,
        optimized_context_tokens: context.documentSummaries.join(' ').length / 4, // Rough estimate
        phase2_context: {
          documentSummaries: context.documentSummaries,
          keyInsights: context.keyInsights,
          analysisScope: context.analysisScope,
          focusAreas: context.focusAreas,
        },
      });

    // Update chat session with readiness status
    await supabase
      .from('chat_sessions')
      .update({
        transition_readiness: isReady,
        professional_quality_score: readinessScore,
        preliminary_insights: preliminaryInsights,
      })
      .eq('id', sessionId);

  } catch (error) {
    console.error('Error checking Phase 2 readiness:', error);
  }
}