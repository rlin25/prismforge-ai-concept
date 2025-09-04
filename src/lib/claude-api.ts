// Claude Sonnet 4 API Integration for Phase 1
// PrismForge AI - Professional M&A Validation Platform

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabase';
import type {
  AnalysisContext,
  TokenBudget,
  ChatResponse,
  ChatMessage,
  APICallRecord,
  ProcessingError
} from '@/types/phase1.types';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export class Phase1ChatService {
  private readonly model = 'claude-3-5-sonnet-20241022';
  private readonly temperature = 0.1;
  private readonly maxTokensPerRequest = 4000;

  async processUserMessage(
    sessionId: string,
    userId: string,
    organizationId: string,
    message: string,
    context: AnalysisContext,
    budget: TokenBudget
  ): Promise<ChatResponse> {
    try {
      // Check if user can continue based on budget
      if (!budget.canContinue) {
        throw new Error('Token budget exceeded. Please start a new session or upgrade to Phase 2 professional validation.');
      }

      // Optimize context for token efficiency
      const optimizedContext = await this.optimizeContextForTokens(context, budget);

      // Build system prompt for M&A document analysis
      const systemPrompt = this.buildDocumentAnalysisPrompt(optimizedContext);

      // Prepare messages for API
      const messages = this.formatMessagesForAPI(context.chatHistory, message);

      // Calculate available tokens for response
      const availableTokens = Math.min(
        this.maxTokensPerRequest,
        budget.remainingTokens - 500 // Reserve 500 tokens for safety
      );

      if (availableTokens < 100) {
        throw new Error('Insufficient tokens remaining. Consider starting a new session or upgrading to Phase 2.');
      }

      // Record API call start
      const apiCallId = await this.recordAPICallStart(
        sessionId,
        userId,
        organizationId,
        this.model
      );

      const startTime = Date.now();

      // Execute Claude API call
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: availableTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: messages,
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Extract usage information
      const usage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      // Record successful API call
      await this.recordAPICallComplete(
        apiCallId,
        usage.inputTokens,
        usage.outputTokens,
        responseTime,
        'completed'
      );

      // Update session token usage
      await this.updateSessionTokenUsage(sessionId, usage.inputTokens, usage.outputTokens);

      // Extract response content
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      return {
        content,
        tokenUsage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        },
        responseTime,
        apiCallId,
        status: 'success',
      };

    } catch (error) {
      console.error('Claude API error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: `I apologize, but I encountered an issue processing your request: ${errorMessage}. Please try again or consider upgrading to Phase 2 professional validation for enhanced capabilities.`,
        tokenUsage: {
          inputTokens: 0,
          outputTokens: 0,
        },
        responseTime: 0,
        apiCallId: '',
        status: 'error',
        errorMessage,
      };
    }
  }

  private buildDocumentAnalysisPrompt(context: AnalysisContext): string {
    return `You are an expert M&A analyst helping explore and understand documents for potential deal validation.

DOCUMENT CONTEXT:
${context.documentSummaries.join('\n\n')}

ANALYSIS OBJECTIVES:
${context.userObjectives || 'General M&A analysis and validation preparation'}

KEY INSIGHTS DISCOVERED:
${context.keyInsights.join('\n- ')}

IDENTIFIED RISKS:
${context.identifiedRisks.join('\n- ')}

KEY ASSUMPTIONS FOUND:
${context.assumptionsFound.map(a => `${a.category}: ${a.description} (${a.confidence * 100}% confidence)`).join('\n- ')}

Your role in this FREE EXPLORATION PHASE:
- Help the user understand their documents and data in the context of M&A analysis
- Identify key insights, potential concerns, and areas requiring deeper validation
- Refine analysis questions and objectives to prepare for comprehensive validation
- Provide professional-quality preliminary insights while emphasizing this is exploratory analysis
- When appropriate, suggest that definitive investment decisions require professional multi-agent validation

IMPORTANT CONTEXT: 
- This is preliminary exploration using a 15,000 token budget (completely FREE)
- For definitive investment decisions, recommend the professional multi-agent validation service ($500 per professional validation)
- Professional validation includes adversarial analysis by Skeptic Agent and strategic validation by Validator Agent
- Professional Quality Score ≥85% standard ensures investment-grade analysis

Be conversational, insightful, and focus on helping the user understand what comprehensive validation might reveal. Maintain professional tone suitable for corporate development teams and investment professionals.

When the user's exploration appears comprehensive, guide them toward Phase 2 by highlighting:
- Areas where adversarial challenge could provide valuable insights
- Assumptions that would benefit from rigorous validation
- The risk-adjusted value of professional validation ($500 vs potential $50,000-150,000 consulting mistakes)`;
  }

  private formatMessagesForAPI(chatHistory: ChatMessage[], newMessage: string): any[] {
    const messages = chatHistory
      .filter(msg => msg.role !== 'system')
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

    messages.push({
      role: 'user',
      content: newMessage,
    });

    return messages;
  }

  private async optimizeContextForTokens(
    context: AnalysisContext,
    budget: TokenBudget
  ): Promise<AnalysisContext> {
    // Simple optimization - truncate context if needed
    const maxContextTokens = Math.floor(budget.remainingTokens * 0.7); // Use 70% of remaining budget for context
    
    // Estimate tokens (rough approximation: 4 characters per token)
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);
    
    let currentTokens = 0;
    const optimizedContext: AnalysisContext = {
      ...context,
      documentSummaries: [],
      keyInsights: [],
      chatHistory: [],
    };

    // Prioritize most recent and important content
    for (const summary of context.documentSummaries) {
      const tokens = estimateTokens(summary);
      if (currentTokens + tokens < maxContextTokens) {
        optimizedContext.documentSummaries.push(summary);
        currentTokens += tokens;
      }
    }

    for (const insight of context.keyInsights) {
      const tokens = estimateTokens(insight);
      if (currentTokens + tokens < maxContextTokens) {
        optimizedContext.keyInsights.push(insight);
        currentTokens += tokens;
      }
    }

    // Include recent chat history
    const recentHistory = context.chatHistory.slice(-6); // Last 6 messages
    for (const msg of recentHistory) {
      const tokens = estimateTokens(msg.content);
      if (currentTokens + tokens < maxContextTokens) {
        optimizedContext.chatHistory.push(msg);
        currentTokens += tokens;
      }
    }

    return optimizedContext;
  }

  private async recordAPICallStart(
    sessionId: string,
    userId: string,
    organizationId: string,
    model: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('api_calls')
      .insert({
        session_id: sessionId,
        user_id: userId,
        organization_id: organizationId,
        api_provider: 'anthropic',
        model_used: model,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error recording API call start:', error);
      throw new Error('Failed to track API call');
    }

    return data.id;
  }

  private async recordAPICallComplete(
    apiCallId: string,
    inputTokens: number,
    outputTokens: number,
    responseTimeMs: number,
    status: 'completed' | 'failed'
  ): Promise<void> {
    const { error } = await supabase
      .from('api_calls')
      .update({
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        response_time_ms: responseTimeMs,
        response_timestamp: new Date().toISOString(),
        status,
        cost_cents: 0, // Always $0 for Phase 1
      })
      .eq('id', apiCallId);

    if (error) {
      console.error('Error recording API call completion:', error);
    }
  }

  private async updateSessionTokenUsage(
    sessionId: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<void> {
    const totalTokens = inputTokens + outputTokens;

    const { error } = await supabase.rpc('update_session_token_usage', {
      p_session_id: sessionId,
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_total_tokens: totalTokens,
    });

    if (error) {
      console.error('Error updating session token usage:', error);
    }
  }

  async getCurrentTokenBudget(sessionId: string): Promise<TokenBudget> {
    const { data, error } = await supabase
      .from('session_token_usage')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching token budget:', error);
      throw new Error('Failed to fetch token budget');
    }

    const remainingTokens = data.token_budget - data.total_tokens_used;
    const percentageUsed = (data.total_tokens_used / data.token_budget) * 100;

    return {
      maxTokensPerSession: data.token_budget,
      remainingTokens: Math.max(0, remainingTokens),
      usedTokens: data.total_tokens_used,
      inputTokens: data.input_tokens,
      outputTokens: data.output_tokens,
      costSoFar: 0, // Always $0 for Phase 1
      warningThreshold: data.warning_threshold,
      hardStopThreshold: data.hard_stop_threshold,
      budgetStatus: data.budget_status,
      canContinue: data.can_continue && remainingTokens > 0,
    };
  }
}

// Database function for updating session token usage
export const createUpdateSessionTokenUsageFunction = `
CREATE OR REPLACE FUNCTION update_session_token_usage(
  p_session_id UUID,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_total_tokens INTEGER
)
RETURNS void AS $$
DECLARE
  v_new_total INTEGER;
  v_budget INTEGER;
  v_warning INTEGER;
  v_hard_stop INTEGER;
  v_new_status TEXT;
  v_can_continue BOOLEAN;
BEGIN
  -- Get current values
  SELECT 
    total_tokens_used + p_total_tokens,
    token_budget,
    warning_threshold,
    hard_stop_threshold
  INTO v_new_total, v_budget, v_warning, v_hard_stop
  FROM session_token_usage
  WHERE session_id = p_session_id;

  -- Determine new status
  IF v_new_total >= v_hard_stop THEN
    v_new_status := 'exceeded';
    v_can_continue := FALSE;
  ELSIF v_new_total >= v_budget THEN
    v_new_status := 'near_limit';
    v_can_continue := FALSE;
  ELSIF v_new_total >= v_warning THEN
    v_new_status := 'warning';
    v_can_continue := TRUE;
  ELSE
    v_new_status := 'normal';
    v_can_continue := TRUE;
  END IF;

  -- Update the record
  UPDATE session_token_usage SET
    total_tokens_used = v_new_total,
    input_tokens = input_tokens + p_input_tokens,
    output_tokens = output_tokens + p_output_tokens,
    budget_status = v_new_status,
    can_continue = v_can_continue,
    updated_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;
`;

export default Phase1ChatService;