// Professional Token Budget Enforcement Service
// PrismForge AI - Professional M&A Validation Platform ($500 per professional validation)

import { supabase } from '@/lib/supabase';
import type {
  TokenBudgetEnforcement,
  ProfessionalBudgetEnforcementResult,
  ProfessionalBudgetExceededError
} from '@/types/phase2.types';

export class ProfessionalTokenBudgetEnforcer {
  private readonly TOTAL_BUDGET = 80000; // 80K tokens total
  private readonly AGENT_BUDGETS = {
    skeptic: 35000,    // 35K for Skeptic Agent
    validator: 35000,  // 35K for Validator Agent  
    synthesis: 10000   // 10K for Synthesis Agent
  };
  private readonly PROFESSIONAL_VALUE_CENTS = 50000; // $500 per professional validation
  private readonly PROFESSIONAL_STANDARD = 0.85; // ≥85% professional standard

  /**
   * Enforce professional token budget for agent execution
   * Ensures strict adherence to 80K total budget while delivering $500 professional value
   */
  async enforceProfessionalAgentBudget(
    executionId: string,
    agentType: 'skeptic' | 'validator' | 'synthesis',
    requestedTokens: number
  ): Promise<ProfessionalBudgetEnforcementResult> {
    
    // Get current professional budget usage
    const currentUsage = await this.getCurrentProfessionalUsage(executionId);
    const agentBudget = this.AGENT_BUDGETS[agentType];
    const totalRemaining = this.TOTAL_BUDGET - currentUsage.totalUsed;
    
    // Strict professional budget validation
    if (requestedTokens > agentBudget) {
      throw new ProfessionalBudgetExceededError(
        `Professional ${agentType} agent requesting ${requestedTokens.toLocaleString()} tokens exceeds allocated budget of ${agentBudget.toLocaleString()}. Professional Quality Score standards (≥85%) require strict budget adherence for $500 professional validation delivery.`
      );
    }
    
    if (requestedTokens > totalRemaining) {
      throw new ProfessionalBudgetExceededError(
        `Professional validation budget exhausted. Remaining: ${totalRemaining.toLocaleString()}, Requested: ${requestedTokens.toLocaleString()}. $500 professional service requires efficient token utilization within 80K limit.`
      );
    }
    
    // Calculate professional value delivery metrics
    const professionalValueDelivery = this.calculateProfessionalValueDelivery(
      requestedTokens,
      currentUsage.totalUsed,
      agentType
    );
    
    // Update budget tracking in database
    await this.updateProfessionalBudgetTracking(executionId, agentType, requestedTokens, currentUsage);
    
    return {
      approved: true,
      allocatedTokens: requestedTokens,
      remainingAgentBudget: agentBudget - requestedTokens,
      remainingTotalBudget: totalRemaining - requestedTokens,
      professionalValueDelivery,
      qualityAssurance: true
    };
  }

  /**
   * Get current professional budget usage for execution
   */
  async getCurrentProfessionalUsage(executionId: string): Promise<TokenBudgetEnforcement> {
    const { data: agentExecutions, error } = await supabase
      .from('agent_executions')
      .select('agent_type, tokens_used, tokens_allocated')
      .eq('execution_id', executionId);
      
    if (error) {
      throw new Error(`Failed to get professional budget usage: ${error.message}`);
    }
    
    // Calculate current usage by agent
    let skepticUsed = 0, validatorUsed = 0, synthesisUsed = 0;
    
    for (const execution of agentExecutions || []) {
      switch (execution.agent_type) {
        case 'skeptic':
          skepticUsed = execution.tokens_used || 0;
          break;
        case 'validator':
          validatorUsed = execution.tokens_used || 0;
          break;
        case 'synthesis':
          synthesisUsed = execution.tokens_used || 0;
          break;
      }
    }
    
    const totalUsed = skepticUsed + validatorUsed + synthesisUsed;
    const totalRemaining = this.TOTAL_BUDGET - totalUsed;
    
    // Determine professional budget status
    let budgetStatus: 'normal' | 'warning' | 'critical' | 'exceeded' = 'normal';
    const utilizationPercentage = (totalUsed / this.TOTAL_BUDGET) * 100;
    
    if (totalUsed >= this.TOTAL_BUDGET) {
      budgetStatus = 'exceeded';
    } else if (utilizationPercentage >= 90) {
      budgetStatus = 'critical';
    } else if (utilizationPercentage >= 75) {
      budgetStatus = 'warning';
    }
    
    return {
      totalBudget: this.TOTAL_BUDGET,
      agentBudgets: this.AGENT_BUDGETS,
      currentUsage: {
        skepticUsed,
        validatorUsed,
        synthesisUsed,
        totalUsed
      },
      remainingBudget: {
        skepticRemaining: this.AGENT_BUDGETS.skeptic - skepticUsed,
        validatorRemaining: this.AGENT_BUDGETS.validator - validatorUsed,
        synthesisRemaining: this.AGENT_BUDGETS.synthesis - synthesisUsed,
        totalRemaining
      },
      budgetStatus,
      professionalValueEfficiency: this.calculateProfessionalEfficiency(totalUsed)
    };
  }

  /**
   * Calculate professional value delivery metrics for $500 validation
   */
  private calculateProfessionalValueDelivery(
    requestedTokens: number,
    currentUsage: number,
    agentType: 'skeptic' | 'validator' | 'synthesis'
  ): ProfessionalBudgetEnforcementResult['professionalValueDelivery'] {
    
    const projectedTotalUsage = currentUsage + requestedTokens;
    const efficiency = Math.max(0, (this.TOTAL_BUDGET - projectedTotalUsage) / this.TOTAL_BUDGET);
    
    // Professional Quality Score calculation based on efficiency and agent performance
    let qualityScore = 0.75; // Professional baseline
    
    // Efficiency bonus (higher quality for efficient token usage)
    if (efficiency >= 0.20) qualityScore += 0.15; // 20%+ budget remaining
    else if (efficiency >= 0.10) qualityScore += 0.10; // 10%+ budget remaining
    else if (efficiency >= 0.05) qualityScore += 0.05; // 5%+ budget remaining
    
    // Agent-specific quality adjustments
    switch (agentType) {
      case 'skeptic':
        // Reward thorough risk analysis within budget
        if (requestedTokens <= this.AGENT_BUDGETS.skeptic * 0.9) qualityScore += 0.05;
        break;
      case 'validator':
        // Reward comprehensive strategic analysis within budget
        if (requestedTokens <= this.AGENT_BUDGETS.validator * 0.9) qualityScore += 0.05;
        break;
      case 'synthesis':
        // Reward concise, executive-ready synthesis
        if (requestedTokens <= this.AGENT_BUDGETS.synthesis * 0.8) qualityScore += 0.10;
        break;
    }
    
    const professionalQualityScore = Math.min(1.0, qualityScore);
    const professionalStandardMet = professionalQualityScore >= this.PROFESSIONAL_STANDARD;
    
    return {
      efficiency,
      professionalQualityScore,
      professionalStandardMet,
      valueDelivered: this.PROFESSIONAL_VALUE_CENTS,
      costPerToken: this.calculateCostPerToken(projectedTotalUsage)
    };
  }

  /**
   * Calculate professional efficiency for $500 validation service
   */
  private calculateProfessionalEfficiency(totalUsed: number): number {
    // Professional efficiency based on value delivery per dollar
    const utilizationRate = totalUsed / this.TOTAL_BUDGET;
    
    // Optimal utilization is 85-95% of budget (maximum professional value)
    if (utilizationRate >= 0.85 && utilizationRate <= 0.95) {
      return 1.0; // Peak professional efficiency
    } else if (utilizationRate >= 0.70 && utilizationRate < 0.85) {
      return 0.85 + ((utilizationRate - 0.70) / 0.15) * 0.15; // Scaling up to peak
    } else if (utilizationRate > 0.95) {
      return Math.max(0.60, 1.0 - ((utilizationRate - 0.95) / 0.05) * 0.40); // Declining after peak
    } else {
      return Math.max(0.50, utilizationRate / 0.70 * 0.85); // Below optimal range
    }
  }

  /**
   * Calculate cost per token for professional value assessment
   */
  private calculateCostPerToken(totalTokensUsed: number): number {
    if (totalTokensUsed === 0) return 0;
    
    // Professional value of $500 divided by actual token usage
    return this.PROFESSIONAL_VALUE_CENTS / totalTokensUsed;
  }

  /**
   * Update professional budget tracking in database
   */
  private async updateProfessionalBudgetTracking(
    executionId: string,
    agentType: 'skeptic' | 'validator' | 'synthesis',
    allocatedTokens: number,
    currentUsage: TokenBudgetEnforcement
  ): Promise<void> {
    
    // Update agent execution with allocated tokens
    const { error: agentError } = await supabase
      .from('agent_executions')
      .update({
        tokens_allocated: allocatedTokens,
        tokens_remaining: allocatedTokens, // Will be decremented as tokens are used
        updated_at: new Date().toISOString()
      })
      .eq('execution_id', executionId)
      .eq('agent_type', agentType);
      
    if (agentError) {
      throw new Error(`Failed to update agent budget tracking: ${agentError.message}`);
    }
    
    // Update analysis session with total budget status
    const newTotalUsed = currentUsage.currentUsage.totalUsed + allocatedTokens;
    const { error: sessionError } = await supabase
      .from('analysis_sessions')
      .update({
        total_tokens_used: newTotalUsed,
        tokens_remaining: this.TOTAL_BUDGET - newTotalUsed,
        updated_at: new Date().toISOString()
      })
      .eq('execution_id', executionId);
      
    if (sessionError) {
      throw new Error(`Failed to update session budget tracking: ${sessionError.message}`);
    }
  }

  /**
   * Record actual token usage after agent execution
   */
  async recordProfessionalTokenUsage(
    executionId: string,
    agentType: 'skeptic' | 'validator' | 'synthesis',
    actualTokensUsed: number,
    professionalQualityScore: number
  ): Promise<void> {
    
    // Validate actual usage doesn't exceed allocation
    const { data: execution, error: fetchError } = await supabase
      .from('agent_executions')
      .select('tokens_allocated, tokens_used')
      .eq('execution_id', executionId)
      .eq('agent_type', agentType)
      .single();
      
    if (fetchError || !execution) {
      throw new Error(`Failed to fetch agent execution for token usage recording: ${fetchError?.message}`);
    }
    
    if (actualTokensUsed > execution.tokens_allocated) {
      throw new ProfessionalBudgetExceededError(
        `Actual token usage (${actualTokensUsed.toLocaleString()}) exceeds allocated budget (${execution.tokens_allocated.toLocaleString()}) for ${agentType} agent. Professional budget enforcement requires strict adherence.`
      );
    }
    
    // Update actual token usage
    const { error: updateError } = await supabase
      .from('agent_executions')
      .update({
        tokens_used: actualTokensUsed,
        tokens_remaining: execution.tokens_allocated - actualTokensUsed,
        professional_quality_score: professionalQualityScore,
        professional_standard_met: professionalQualityScore >= this.PROFESSIONAL_STANDARD,
        updated_at: new Date().toISOString()
      })
      .eq('execution_id', executionId)
      .eq('agent_type', agentType);
      
    if (updateError) {
      throw new Error(`Failed to record professional token usage: ${updateError.message}`);
    }
    
    // Update analysis session totals
    await this.updateAnalysisSessionTotals(executionId);
  }

  /**
   * Update analysis session token totals and professional value metrics
   */
  private async updateAnalysisSessionTotals(executionId: string): Promise<void> {
    // Get all agent executions for this analysis session
    const { data: executions, error } = await supabase
      .from('agent_executions')
      .select('tokens_used, professional_quality_score, professional_standard_met')
      .eq('execution_id', executionId);
      
    if (error) {
      throw new Error(`Failed to fetch executions for session totals: ${error.message}`);
    }
    
    // Calculate totals
    const totalTokensUsed = executions?.reduce((sum, exec) => sum + (exec.tokens_used || 0), 0) || 0;
    const avgProfessionalQuality = executions && executions.length > 0
      ? executions.reduce((sum, exec) => sum + (exec.professional_quality_score || 0), 0) / executions.length
      : 0;
    const allMeetProfessionalStandard = executions?.every(exec => exec.professional_standard_met) || false;
    
    // Update analysis session
    const { error: sessionError } = await supabase
      .from('analysis_sessions')
      .update({
        total_tokens_used: totalTokensUsed,
        tokens_remaining: this.TOTAL_BUDGET - totalTokensUsed,
        professional_quality_score: avgProfessionalQuality,
        professional_standard_met: allMeetProfessionalStandard,
        updated_at: new Date().toISOString()
      })
      .eq('execution_id', executionId);
      
    if (sessionError) {
      throw new Error(`Failed to update analysis session totals: ${sessionError.message}`);
    }
  }

  /**
   * Generate professional budget status report
   */
  async generateProfessionalBudgetReport(executionId: string): Promise<{
    budgetUtilization: TokenBudgetEnforcement;
    professionalValueMetrics: {
      totalValueDelivered: number; // $500 in cents
      costPerToken: number;
      efficiencyScore: number;
      professionalQualityScore: number;
      budgetOptimization: string;
    };
    recommendations: string[];
  }> {
    
    const budgetUtilization = await this.getCurrentProfessionalUsage(executionId);
    const totalTokensUsed = budgetUtilization.currentUsage.totalUsed;
    
    const professionalValueMetrics = {
      totalValueDelivered: this.PROFESSIONAL_VALUE_CENTS,
      costPerToken: this.calculateCostPerToken(totalTokensUsed),
      efficiencyScore: budgetUtilization.professionalValueEfficiency,
      professionalQualityScore: 0.85, // Will be calculated from actual executions
      budgetOptimization: this.getBudgetOptimizationMessage(budgetUtilization)
    };
    
    const recommendations = this.generateBudgetRecommendations(budgetUtilization);
    
    return {
      budgetUtilization,
      professionalValueMetrics,
      recommendations
    };
  }

  /**
   * Get budget optimization message
   */
  private getBudgetOptimizationMessage(budget: TokenBudgetEnforcement): string {
    const utilizationPercentage = (budget.currentUsage.totalUsed / budget.totalBudget) * 100;
    
    if (utilizationPercentage <= 70) {
      return 'Excellent budget efficiency - high professional value delivery';
    } else if (utilizationPercentage <= 85) {
      return 'Good budget utilization - optimal professional value range';
    } else if (utilizationPercentage <= 95) {
      return 'High budget utilization - monitor remaining capacity';
    } else {
      return 'Critical budget utilization - immediate attention required';
    }
  }

  /**
   * Generate budget optimization recommendations
   */
  private generateBudgetRecommendations(budget: TokenBudgetEnforcement): string[] {
    const recommendations: string[] = [];
    const utilizationPercentage = (budget.currentUsage.totalUsed / budget.totalBudget) * 100;
    
    if (budget.budgetStatus === 'critical') {
      recommendations.push('Consider context optimization for remaining agents');
      recommendations.push('Prioritize highest-impact analysis areas');
    } else if (budget.budgetStatus === 'warning') {
      recommendations.push('Monitor token usage closely for remaining executions');
      recommendations.push('Focus on material findings with strong evidence');
    } else if (utilizationPercentage < 50) {
      recommendations.push('Consider enhanced analysis depth within budget');
      recommendations.push('Explore additional strategic dimensions');
    }
    
    recommendations.push('Maintain ≥85% Professional Quality Score standard');
    recommendations.push('Ensure $500 professional value delivery');
    
    return recommendations;
  }
}