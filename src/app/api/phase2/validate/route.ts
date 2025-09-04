// Phase 2 Professional Multi-Agent Validation API
// PrismForge AI - Professional M&A Validation Platform ($500 per professional validation)

import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator } from '@/lib/multi-agent-orchestrator';
import { supabase } from '@/lib/supabase';
import type { ValidationRequest, ProfessionalValidationResult } from '@/types/phase2.types';

const orchestrator = new MultiAgentOrchestrator();

export async function POST(request: NextRequest) {
  try {
    // Check if Phase 2 tables exist (migration check)
    const { data: tableCheck, error: tableError } = await supabase
      .from('analysis_sessions')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      return NextResponse.json({
        error: 'Phase 2 database migration required',
        message: 'Please run the Phase 2 migration (003_phase2_agents_fixed.sql) in Supabase SQL Editor first.',
        migrationRequired: true
      }, { status: 503 });
    }
    
    const body = await request.json();
    const { 
      sessionId,
      analysisObjectives,
      optimizedContext,
      professionalValidationRequested = true 
    } = body;

    if (!sessionId || !analysisObjectives || !optimizedContext) {
      return NextResponse.json(
        { error: 'Session ID, analysis objectives, and optimized context are required for professional validation' },
        { status: 400 }
      );
    }

    if (!professionalValidationRequested) {
      return NextResponse.json(
        { error: 'Professional validation must be explicitly requested for $500 professional service' },
        { status: 400 }
      );
    }

    // Get session information for professional validation
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session for professional validation' },
        { status: 404 }
      );
    }

    // Verify Phase 2 readiness
    const { data: readiness, error: readinessError } = await supabase
      .from('phase2_readiness')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (readinessError || !readiness || !readiness.is_ready) {
      return NextResponse.json(
        { 
          error: 'Session not ready for professional validation',
          message: 'Complete Phase 1 exploration first to establish readiness for $500 professional multi-agent analysis',
          readinessScore: readiness?.readiness_score || 0,
          requiredScore: 0.70
        },
        { status: 400 }
      );
    }

    // Get chat history for context
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch context for professional validation' },
        { status: 500 }
      );
    }

    // Get processed documents for professional context
    const { data: documents, error: docsError } = await supabase
      .from('document_processing')
      .select('*')
      .eq('session_id', sessionId)
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Error fetching processed documents:', docsError);
    }

    // Build professional validation request
    const validationRequest: ValidationRequest = {
      sessionId,
      organizationId: session.organization_id,
      userId: session.user_id,
      analysisObjectives: {
        primaryQuestion: analysisObjectives.primaryQuestion || readiness.analysis_objectives?.primary || 'M&A Validation Analysis',
        strategicRationale: analysisObjectives.strategicRationale || 'Strategic acquisition evaluation',
        focusAreas: analysisObjectives.focusAreas || readiness.preliminary_insights?.focus_areas || [],
        scope: analysisObjectives.scope || `Analysis of ${documents?.length || 0} document(s) for professional M&A validation`
      },
      optimizedContext: {
        documentSummaries: optimizedContext.documentSummaries || documents?.map(doc => 
          `${doc.file_name}: ${doc.document_summary || 'Professional document analysis'}`
        ) || [],
        keyDataPoints: optimizedContext.keyDataPoints || {},
        analysisScope: optimizedContext.analysisScope || readiness.context_summary || 'Professional M&A validation',
        keyInsights: optimizedContext.keyInsights || readiness.preliminary_insights?.keyFindings || [],
        identifiedRisks: optimizedContext.identifiedRisks || readiness.identified_risks || [],
        assumptions: optimizedContext.assumptions || readiness.preliminary_insights?.assumptions || []
      },
      contextMessages: chatHistory?.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })) || []
    };

    // Execute professional multi-agent validation ($500 per professional validation)
    console.log(`Starting professional multi-agent validation for session ${sessionId}`);
    console.log(`Professional validation value: $500 per analysis`);
    
    const validationResult = await orchestrator.executeValidation(validationRequest);
    
    // Update session with professional validation completion
    await supabase
      .from('chat_sessions')
      .update({
        phase: '2',
        transition_readiness: true,
        professional_quality_score: validationResult.professionalQualityScore,
        professional_validation_completed: true,
        professional_validation_value_cents: 50000, // $500
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      professionalValidation: true,
      validationValue: '$500 professional multi-agent analysis',
      professionalQualityScore: validationResult.professionalQualityScore,
      professionalStandardMet: validationResult.professionalStandardMet,
      result: validationResult,
      message: 'Professional multi-agent validation completed successfully',
      costBreakdown: validationResult.costBreakdown,
      processingTime: validationResult.totalProcessingTime,
      executiveSummary: validationResult.executiveSummary,
      recommendation: validationResult.recommendation,
      confidenceScore: validationResult.confidenceScore
    });

  } catch (error) {
    console.error('Professional validation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during professional validation';
    
    return NextResponse.json(
      { 
        error: 'Professional multi-agent validation failed',
        message: errorMessage,
        professionalService: '$500 professional validation service',
        support: 'Contact support for professional validation assistance'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Phase 2 tables exist (migration check)
    const { data: tableCheck, error: tableError } = await supabase
      .from('analysis_sessions')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      return NextResponse.json({
        error: 'Phase 2 database migration required',
        message: 'Please run the Phase 2 migration (003_phase2_agents_fixed.sql) in Supabase SQL Editor first.',
        migrationRequired: true
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');
    const sessionId = searchParams.get('sessionId');

    if (!executionId && !sessionId) {
      return NextResponse.json(
        { error: 'Execution ID or Session ID is required' },
        { status: 400 }
      );
    }

    // Get professional validation status
    let query = supabase.from('analysis_sessions').select(`
      *,
      agent_executions (
        agent_type,
        status,
        progress,
        current_task,
        professional_quality_score,
        professional_standard_met,
        processing_time_ms,
        findings,
        confidence_score,
        tokens_used,
        tokens_remaining
      )
    `);

    if (executionId) {
      query = query.eq('execution_id', executionId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: analysisSession, error } = await query.single();

    if (error || !analysisSession) {
      return NextResponse.json(
        { error: 'Professional validation session not found' },
        { status: 404 }
      );
    }

    // Get latest status updates
    const { data: statusUpdates, error: statusError } = await supabase
      .from('agent_status_updates')
      .select('*')
      .eq('execution_id', analysisSession.execution_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (statusError) {
      console.error('Error fetching status updates:', statusError);
    }

    // Calculate overall progress
    const agentExecutions = analysisSession.agent_executions || [];
    const overallProgress = agentExecutions.length > 0
      ? Math.round(agentExecutions.reduce((sum: number, agent: any) => sum + (agent.progress || 0), 0) / agentExecutions.length)
      : 0;

    // Get current agent
    const currentAgent = agentExecutions.find((agent: any) => agent.status === 'processing');
    
    // Professional validation status
    const professionalStatus = {
      executionId: analysisSession.execution_id,
      sessionId: analysisSession.session_id,
      status: analysisSession.status,
      overallProgress,
      currentAgent: currentAgent?.agent_type || null,
      
      // Professional context
      professionalValidation: true,
      professionalValue: '$500 per professional validation',
      professionalQualityScore: analysisSession.professional_quality_score,
      professionalStandardMet: analysisSession.professional_standard_met,
      
      // Agent details
      agents: {
        skeptic: agentExecutions.find((a: any) => a.agent_type === 'skeptic'),
        validator: agentExecutions.find((a: any) => a.agent_type === 'validator'),
        synthesis: agentExecutions.find((a: any) => a.agent_type === 'synthesis')
      },
      
      // Token usage
      tokenUsage: {
        totalUsed: analysisSession.total_tokens_used || 0,
        totalBudget: analysisSession.token_budget || 80000,
        remaining: analysisSession.tokens_remaining || 80000,
        utilizationPercentage: Math.round(((analysisSession.total_tokens_used || 0) / (analysisSession.token_budget || 80000)) * 100)
      },
      
      // Timing
      startedAt: analysisSession.started_at,
      completedAt: analysisSession.completed_at,
      processingTimeMs: analysisSession.total_processing_time_ms,
      
      // Latest updates
      recentUpdates: statusUpdates || [],
      
      // Results (when complete)
      recommendation: analysisSession.overall_recommendation,
      confidenceScore: analysisSession.confidence_score
    };

    return NextResponse.json(professionalStatus);

  } catch (error) {
    console.error('Error fetching professional validation status:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch professional validation status' },
      { status: 500 }
    );
  }
}