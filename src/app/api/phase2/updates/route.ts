// Real-time Server-Sent Events (SSE) for Phase 2 Professional Validation
// PrismForge AI - Professional M&A Validation Platform ($500 per professional validation)

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Global SSE connection management
const connections = new Map<string, {
  controller: ReadableStreamDefaultController<Uint8Array>;
  executionId: string;
  lastEventId?: string;
}>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get('executionId');
  
  if (!executionId) {
    return NextResponse.json(
      { error: 'Execution ID required for professional validation updates' },
      { status: 400 }
    );
  }

  // Check if Phase 2 tables exist (migration check)
  try {
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
  } catch (error) {
    return NextResponse.json({
      error: 'Phase 2 database migration required',
      message: 'Please run the Phase 2 migration (003_phase2_agents_fixed.sql) in Supabase SQL Editor first.',
      migrationRequired: true
    }, { status: 503 });
  }

  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection for broadcasting
      const connectionId = `${executionId}-${Date.now()}`;
      connections.set(connectionId, {
        controller,
        executionId,
      });

      // Send initial professional validation connection message
      const initialMessage = {
        type: 'connection_established',
        executionId,
        professionalContext: true,
        professionalValue: '$500 professional validation',
        message: 'Connected to professional multi-agent validation updates',
        timestamp: Date.now()
      };

      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
      );

      // Send current status if available
      sendCurrentStatus(executionId, controller);

      // Set up periodic status checks
      const statusInterval = setInterval(async () => {
        try {
          await sendCurrentStatus(executionId, controller);
        } catch (error) {
          console.error('Error sending status update:', error);
        }
      }, 2000); // Check every 2 seconds for professional real-time updates

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(statusInterval);
        connections.delete(connectionId);
        try {
          controller.close();
        } catch (e) {
          // Connection already closed
        }
      });

      // Keep-alive heartbeat for professional service reliability
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'heartbeat',
              professionalService: true,
              timestamp: Date.now()
            })}\n\n`)
          );
        } catch (error) {
          clearInterval(heartbeatInterval);
          connections.delete(connectionId);
        }
      }, 30000); // Heartbeat every 30 seconds

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Professional-Service': '$500 professional validation'
    },
  });
}

/**
 * Send current professional validation status
 */
async function sendCurrentStatus(
  executionId: string, 
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  try {
    // Get current analysis session status
    const { data: analysisSession, error } = await supabase
      .from('analysis_sessions')
      .select(`
        *,
        agent_executions (
          agent_type,
          status,
          progress,
          current_task,
          professional_quality_score,
          professional_standard_met,
          processing_time_ms,
          confidence_score
        )
      `)
      .eq('execution_id', executionId)
      .single();

    if (error || !analysisSession) {
      return;
    }

    const agentExecutions = analysisSession.agent_executions || [];
    
    // Calculate overall progress
    const overallProgress = agentExecutions.length > 0
      ? Math.round(agentExecutions.reduce((sum: number, agent: any) => sum + (agent.progress || 0), 0) / agentExecutions.length)
      : 0;

    // Find current active agent
    const activeAgent = agentExecutions.find((agent: any) => agent.status === 'processing');
    
    // Professional status update
    const statusUpdate = {
      type: 'professional_status_update',
      executionId,
      sessionId: analysisSession.session_id,
      
      // Professional context
      professionalValidation: true,
      professionalValue: '$500 per professional validation',
      professionalQualityScore: analysisSession.professional_quality_score,
      professionalStandardMet: analysisSession.professional_standard_met,
      
      // Overall status
      status: analysisSession.status,
      overallProgress,
      currentAgent: activeAgent?.agent_type || null,
      currentTask: activeAgent?.current_task || getStatusMessage(analysisSession.status),
      
      // Agent progress
      agents: {
        skeptic: getAgentStatus(agentExecutions.find((a: any) => a.agent_type === 'skeptic')),
        validator: getAgentStatus(agentExecutions.find((a: any) => a.agent_type === 'validator')),
        synthesis: getAgentStatus(agentExecutions.find((a: any) => a.agent_type === 'synthesis'))
      },
      
      // Token usage for professional efficiency tracking
      tokenUsage: {
        totalUsed: analysisSession.total_tokens_used || 0,
        totalBudget: analysisSession.token_budget || 80000,
        utilizationPercentage: Math.round(((analysisSession.total_tokens_used || 0) / (analysisSession.token_budget || 80000)) * 100)
      },
      
      // Timing
      processingTimeMs: analysisSession.total_processing_time_ms,
      
      // Professional value delivery
      valueDelivery: calculateValueDelivery(analysisSession),
      
      timestamp: Date.now()
    };

    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(statusUpdate)}\n\n`)
    );

    // If completed, send final professional validation result
    if (analysisSession.status === 'completed') {
      await sendCompletionUpdate(executionId, analysisSession, controller);
    }

  } catch (error) {
    console.error('Error sending current status:', error);
    
    // Send error update
    const errorUpdate = {
      type: 'professional_error',
      executionId,
      error: 'Failed to get professional validation status',
      professionalService: '$500 professional validation',
      message: 'Reconnecting to professional validation service...',
      timestamp: Date.now()
    };

    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(errorUpdate)}\n\n`)
    );
  }
}

/**
 * Send professional validation completion update
 */
async function sendCompletionUpdate(
  executionId: string,
  analysisSession: any,
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  try {
    // Get professional deliverables
    const { data: deliverables, error: deliverablesError } = await supabase
      .from('professional_deliverables')
      .select('*')
      .eq('analysis_session_id', analysisSession.id);

    if (deliverablesError) {
      console.error('Error fetching deliverables:', deliverablesError);
    }

    const completionUpdate = {
      type: 'professional_validation_complete',
      executionId,
      sessionId: analysisSession.session_id,
      
      // Professional completion context
      professionalValidation: true,
      professionalValue: '$500 professional validation delivered',
      professionalQualityScore: analysisSession.professional_quality_score,
      professionalStandardMet: analysisSession.professional_standard_met,
      
      // Final results
      recommendation: analysisSession.overall_recommendation,
      confidenceScore: analysisSession.confidence_score,
      
      // Professional deliverables
      deliverables: deliverables?.map(d => ({
        type: d.deliverable_type,
        title: d.title || `Professional ${d.deliverable_type.replace('_', ' ')}`,
        professionalQualityScore: d.professional_quality_score,
        wordCount: d.word_count
      })) || [],
      
      // Professional service metrics
      totalProcessingTime: analysisSession.total_processing_time_ms,
      tokenUtilization: {
        totalUsed: analysisSession.total_tokens_used,
        totalBudget: analysisSession.token_budget,
        efficiency: calculateTokenEfficiency(analysisSession)
      },
      
      // Cost breakdown
      costBreakdown: {
        professionalValidationValue: 50000, // $500 in cents
        tokenCosts: calculateTokenCosts(analysisSession.total_tokens_used || 0),
        totalValue: 50000
      },
      
      // Professional quality validation
      qualityAssurance: {
        boardReadyQuality: analysisSession.professional_quality_score >= 0.85,
        investmentCommitteeStandard: analysisSession.professional_standard_met,
        professionalDeliverableStandard: true
      },
      
      message: 'Professional multi-agent validation completed successfully',
      nextSteps: [
        'Review executive summary and recommendations',
        'Share with investment committee or board',
        'Implement recommended due diligence actions',
        'Proceed with strategic decision making'
      ],
      
      timestamp: Date.now()
    };

    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(completionUpdate)}\n\n`)
    );

  } catch (error) {
    console.error('Error sending completion update:', error);
  }
}

/**
 * Get agent status for professional updates
 */
function getAgentStatus(agent: any) {
  if (!agent) {
    return {
      status: 'pending',
      progress: 0,
      professionalQualityScore: null,
      professionalStandardMet: false
    };
  }

  return {
    status: agent.status,
    progress: agent.progress || 0,
    currentTask: agent.current_task,
    professionalQualityScore: agent.professional_quality_score,
    professionalStandardMet: agent.professional_standard_met,
    processingTimeMs: agent.processing_time_ms,
    confidenceScore: agent.confidence_score
  };
}

/**
 * Get professional status message
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Preparing professional multi-agent validation...';
    case 'processing':
      return 'Executing professional adversarial analysis...';
    case 'completed':
      return 'Professional validation completed - $500 value delivered';
    case 'failed':
      return 'Professional validation error - support will assist';
    case 'cancelled':
      return 'Professional validation cancelled';
    default:
      return 'Professional validation status unknown';
  }
}

/**
 * Calculate professional value delivery metrics
 */
function calculateValueDelivery(analysisSession: any): {
  professionalStandardMet: boolean;
  valueJustification: string;
  qualityScore: number;
} {
  const qualityScore = analysisSession.professional_quality_score || 0;
  const standardMet = qualityScore >= 0.85;
  
  return {
    professionalStandardMet: standardMet,
    valueJustification: standardMet 
      ? 'Professional Quality Score ≥85% achieved - $500 value justified'
      : 'Working toward Professional Quality Score ≥85% standard',
    qualityScore
  };
}

/**
 * Calculate token efficiency for professional service
 */
function calculateTokenEfficiency(analysisSession: any): number {
  const totalUsed = analysisSession.total_tokens_used || 0;
  const totalBudget = analysisSession.token_budget || 80000;
  
  if (totalUsed === 0) return 0;
  
  const utilization = totalUsed / totalBudget;
  
  // Optimal efficiency is 85-95% utilization
  if (utilization >= 0.85 && utilization <= 0.95) {
    return 1.0; // Peak efficiency
  } else if (utilization < 0.85) {
    return utilization / 0.85; // Scaling efficiency
  } else {
    return Math.max(0.6, 1.0 - ((utilization - 0.95) / 0.05) * 0.4); // Declining efficiency
  }
}

/**
 * Calculate token costs for professional service
 */
function calculateTokenCosts(totalTokens: number): number {
  // Professional token cost calculation (placeholder)
  // Actual costs would be based on Claude API pricing
  const costPerToken = 0.000015; // Example cost in dollars
  return Math.round(totalTokens * costPerToken * 100); // Convert to cents
}

// Broadcast update to all connected clients for an execution
// Helper function to broadcast updates to SSE connections
function broadcastUpdate(executionId: string, update: any) {
  for (const [connectionId, connection] of Array.from(connections.entries())) {
    if (connection.executionId === executionId) {
      try {
        connection.controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(update)}\n\n`)
        );
      } catch (error) {
        console.error('Error broadcasting update:', error);
        connections.delete(connectionId);
      }
    }
  }
}