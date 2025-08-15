/**
 * Fallback Strategies for PrismForge AI
 * Handles partial result aggregation and degraded mode operations
 */

import {
  AgentType,
  AgentResult,
  AgentStatus,
  ValidationResult,
  Finding,
  FinalAnalysis,
  OverallAssessment,
  Priority,
  Severity,
  AgentAnalysis,
  ConsensusResult,
  RiskProfile,
  RiskLevel,
  AgentError,
  ErrorCode
} from '../types/core.js';

export interface FallbackConfig {
  minimumAgentsForAnalysis: number;
  degradedModeThreshold: number;
  partialResultConfidenceReduction: number;
  emergencyModeThreshold: number;
  useHistoricalData: boolean;
  enableBasicAnalysis: boolean;
}

export interface PartialAnalysisContext {
  originalRequest: any;
  availableResults: AgentResult[];
  failedAgents: AgentType[];
  timeElapsed: number;
  retryAttempts: number;
}

export interface FallbackMetrics {
  totalFallbackActivations: number;
  partialResultUsage: number;
  degradedModeActivations: number;
  emergencyModeActivations: number;
  fallbackSuccessRate: number;
  averagePartialConfidence: number;
  agentFailureImpact: Record<AgentType, number>;
}

export type FallbackMode = 'NORMAL' | 'PARTIAL' | 'DEGRADED' | 'EMERGENCY' | 'FAILED';

export class FallbackStrategies {
  private config: FallbackConfig;
  private metrics: FallbackMetrics;
  private historicalResults: ValidationResult[] = [];

  constructor(config: Partial<FallbackConfig> = {}) {
    this.config = {
      minimumAgentsForAnalysis: 2,
      degradedModeThreshold: 0.5, // 50% of agents must succeed
      partialResultConfidenceReduction: 0.3,
      emergencyModeThreshold: 0.25, // 25% of agents must succeed
      useHistoricalData: true,
      enableBasicAnalysis: true,
      ...config
    };

    this.metrics = {
      totalFallbackActivations: 0,
      partialResultUsage: 0,
      degradedModeActivations: 0,
      emergencyModeActivations: 0,
      fallbackSuccessRate: 0,
      averagePartialConfidence: 0,
      agentFailureImpact: {
        'CHALLENGE': 0,
        'EVIDENCE': 0,
        'RISK': 0,
        'JUDGE': 0
      }
    };
  }

  /**
   * Determine the appropriate fallback mode based on available results
   */
  public determineFallbackMode(context: PartialAnalysisContext): FallbackMode {
    const totalAgents = context.availableResults.length + context.failedAgents.length;
    const successfulAgents = context.availableResults.filter(
      result => result.status === 'COMPLETED' && result.result
    ).length;

    const successRate = successfulAgents / totalAgents;

    if (successRate >= this.config.degradedModeThreshold) {
      return successfulAgents === totalAgents ? 'NORMAL' : 'PARTIAL';
    } else if (successRate >= this.config.emergencyModeThreshold) {
      return 'DEGRADED';
    } else if (successfulAgents >= this.config.minimumAgentsForAnalysis) {
      return 'EMERGENCY';
    } else {
      return 'FAILED';
    }
  }

  /**
   * Aggregate partial results into a cohesive analysis
   */
  public async aggregatePartialResults(context: PartialAnalysisContext): Promise<ValidationResult> {
    const mode = this.determineFallbackMode(context);
    this.metrics.totalFallbackActivations++;

    console.warn(`Activating fallback mode: ${mode}`, {
      availableAgents: context.availableResults.map(r => r.agentType),
      failedAgents: context.failedAgents,
      timeElapsed: context.timeElapsed
    });

    switch (mode) {
      case 'NORMAL':
        return this.processNormalResults(context);
      
      case 'PARTIAL':
        this.metrics.partialResultUsage++;
        return this.processPartialResults(context);
      
      case 'DEGRADED':
        this.metrics.degradedModeActivations++;
        return this.processDegradedResults(context);
      
      case 'EMERGENCY':
        this.metrics.emergencyModeActivations++;
        return this.processEmergencyResults(context);
      
      case 'FAILED':
        return this.processFailedAnalysis(context);
      
      default:
        throw new Error(`Unknown fallback mode: ${mode}`);
    }
  }

  /**
   * Create a basic analysis when all agents fail
   */
  public createBasicAnalysis(documentId: string, error: AgentError): FinalAnalysis {
    if (!this.config.enableBasicAnalysis) {
      throw new Error('Basic analysis is disabled');
    }

    console.warn('Creating basic analysis due to complete agent failure');

    return {
      overallAssessment: 'HOLD' as OverallAssessment,
      keyFindings: [{
        id: 'basic-finding-1',
        category: 'OPERATIONAL',
        severity: 'HIGH' as Severity,
        title: 'Analysis System Failure',
        description: 'Unable to complete comprehensive analysis due to system failures. Manual review required.',
        evidence: [{
          type: 'EXPERT_OPINION',
          source: 'PrismForge AI System',
          content: `System error: ${error.message}`,
          reliability: 'RELIABLE'
        }],
        impact: 'SIGNIFICANT',
        likelihood: 'HIGHLY_LIKELY',
        recommendation: 'Perform manual due diligence review and retry analysis when system is stable.'
      }],
      dealBreakers: [],
      opportunities: [],
      riskProfile: {
        overall: 'HIGH' as RiskLevel,
        categories: [{
          category: 'OPERATIONAL',
          level: 'HIGH' as RiskLevel,
          keyRisks: []
        }],
        mitigationStrategies: [{
          risk: 'Incomplete analysis',
          strategy: 'Manual expert review',
          effectiveness: 'MODERATE',
          cost: 'HIGH'
        }]
      },
      recommendedActions: [{
        id: 'basic-action-1',
        type: 'INVESTIGATE_FURTHER',
        priority: 'URGENT' as Priority,
        title: 'Manual Due Diligence Required',
        description: 'System analysis failed. Require manual expert review of all documents.',
        actionItems: [{
          description: 'Engage external due diligence experts',
          status: 'PENDING'
        }],
        estimatedEffort: 'VERY_HIGH',
        timeline: 'IMMEDIATE'
      }],
      executiveSummary: 'Analysis could not be completed due to system failures. Manual review is required before proceeding with this transaction.',
      confidence: 0.1 // Very low confidence
    };
  }

  /**
   * Enhance partial results using historical data
   */
  public enhanceWithHistoricalData(
    partialAnalysis: FinalAnalysis,
    documentType: string,
    industry?: string
  ): FinalAnalysis {
    if (!this.config.useHistoricalData || this.historicalResults.length === 0) {
      return partialAnalysis;
    }

    console.info('Enhancing partial analysis with historical data');

    // Find similar historical analyses
    const similarAnalyses = this.historicalResults.filter(result => {
      // Simple similarity matching - in production, this would be more sophisticated
      return result.finalAnalysis.keyFindings.some(finding =>
        partialAnalysis.keyFindings.some(partial =>
          partial.category === finding.category
        )
      );
    });

    if (similarAnalyses.length === 0) {
      return partialAnalysis;
    }

    // Aggregate insights from historical data
    const historicalFindings = similarAnalyses.flatMap(analysis =>
      analysis.finalAnalysis.keyFindings
    );

    // Add low-confidence findings from historical data
    const supplementaryFindings: Finding[] = historicalFindings
      .filter(finding =>
        !partialAnalysis.keyFindings.some(existing =>
          existing.category === finding.category &&
          existing.title === finding.title
        )
      )
      .slice(0, 3) // Limit to top 3
      .map(finding => ({
        ...finding,
        id: `historical-${finding.id}`,
        title: `${finding.title} (Historical Pattern)`,
        description: `Based on historical data: ${finding.description}`,
        evidence: finding.evidence.map(evidence => ({
          ...evidence,
          source: `Historical Analysis - ${evidence.source}`,
          reliability: 'QUESTIONABLE' // Lower reliability for historical data
        }))
      }));

    return {
      ...partialAnalysis,
      keyFindings: [...partialAnalysis.keyFindings, ...supplementaryFindings],
      confidence: Math.max(0.3, partialAnalysis.confidence), // Boost confidence slightly
      executiveSummary: `${partialAnalysis.executiveSummary}\n\nNote: Analysis enhanced with historical patterns due to partial system availability.`
    };
  }

  /**
   * Calculate confidence reduction based on missing agents
   */
  public calculateConfidenceReduction(availableAgents: AgentType[], allAgents: AgentType[]): number {
    const missingAgents = allAgents.filter(agent => !availableAgents.includes(agent));
    const missingCriticalAgents = missingAgents.filter(agent =>
      ['RISK', 'JUDGE'].includes(agent)
    );

    let reduction = 0;
    
    // Base reduction per missing agent
    reduction += missingAgents.length * 0.1;
    
    // Additional reduction for critical agents
    reduction += missingCriticalAgents.length * 0.2;
    
    // Cap the reduction
    return Math.min(reduction, this.config.partialResultConfidenceReduction);
  }

  /**
   * Get fallback metrics
   */
  public getMetrics(): FallbackMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Add historical result for future enhancement
   */
  public addHistoricalResult(result: ValidationResult): void {
    this.historicalResults.push(result);
    
    // Keep only recent results (last 1000)
    if (this.historicalResults.length > 1000) {
      this.historicalResults = this.historicalResults.slice(-1000);
    }
  }

  private async processNormalResults(context: PartialAnalysisContext): Promise<ValidationResult> {
    // All agents succeeded - no fallback needed
    const successfulResults = context.availableResults.filter(
      result => result.status === 'COMPLETED' && result.result
    );

    return this.createValidationResult(context, successfulResults, 'NORMAL');
  }

  private async processPartialResults(context: PartialAnalysisContext): Promise<ValidationResult> {
    const successfulResults = context.availableResults.filter(
      result => result.status === 'COMPLETED' && result.result
    );

    console.info(`Processing partial results with ${successfulResults.length} successful agents`);

    const result = this.createValidationResult(context, successfulResults, 'PARTIAL');
    
    // Reduce confidence
    const allAgents: AgentType[] = ['CHALLENGE', 'EVIDENCE', 'RISK', 'JUDGE'];
    const availableAgents = successfulResults.map(r => r.agentType);
    const confidenceReduction = this.calculateConfidenceReduction(availableAgents, allAgents);
    
    result.finalAnalysis.confidence = Math.max(
      0.1,
      result.finalAnalysis.confidence - confidenceReduction
    );

    // Enhance with historical data
    result.finalAnalysis = this.enhanceWithHistoricalData(
      result.finalAnalysis,
      'unknown' // Would need document type from context
    );

    return result;
  }

  private async processDegradedResults(context: PartialAnalysisContext): Promise<ValidationResult> {
    const successfulResults = context.availableResults.filter(
      result => result.status === 'COMPLETED' && result.result
    );

    console.warn(`Processing degraded results with only ${successfulResults.length} successful agents`);

    const result = this.createValidationResult(context, successfulResults, 'DEGRADED');
    
    // Significant confidence reduction
    result.finalAnalysis.confidence = Math.max(0.2, result.finalAnalysis.confidence * 0.6);
    
    // Add warning to executive summary
    result.finalAnalysis.executiveSummary = 
      'WARNING: This analysis is based on limited agent responses due to system issues. ' +
      'Consider re-running the analysis or seeking additional expert review.\n\n' +
      result.finalAnalysis.executiveSummary;

    // Enhance with historical data
    result.finalAnalysis = this.enhanceWithHistoricalData(
      result.finalAnalysis,
      'unknown'
    );

    return result;
  }

  private async processEmergencyResults(context: PartialAnalysisContext): Promise<ValidationResult> {
    const successfulResults = context.availableResults.filter(
      result => result.status === 'COMPLETED' && result.result
    );

    console.error(`Processing emergency results with minimal agents: ${successfulResults.length}`);

    const result = this.createValidationResult(context, successfulResults, 'EMERGENCY');
    
    // Maximum confidence reduction
    result.finalAnalysis.confidence = Math.max(0.1, result.finalAnalysis.confidence * 0.3);
    
    // Force conservative assessment
    if (['STRONG_BUY', 'BUY'].includes(result.finalAnalysis.overallAssessment)) {
      result.finalAnalysis.overallAssessment = 'HOLD';
    }

    // Add strong warning
    result.finalAnalysis.executiveSummary = 
      'CRITICAL WARNING: This analysis is based on severely limited data due to extensive system failures. ' +
      'This assessment should NOT be used for investment decisions without comprehensive manual review.\n\n' +
      result.finalAnalysis.executiveSummary;

    return result;
  }

  private async processFailedAnalysis(context: PartialAnalysisContext): Promise<ValidationResult> {
    console.error('All agents failed - creating minimal error response');

    const errorResult: ValidationResult = {
      id: `failed-${Date.now()}`,
      documentId: context.originalRequest?.documentId || 'unknown',
      agentResults: context.availableResults,
      consensus: {
        level: 0,
        agreement: [],
        conflicts: [],
        requiresSecondRound: false
      },
      finalAnalysis: this.createBasicAnalysis(
        context.originalRequest?.documentId || 'unknown',
        {
          code: 'MODEL_ERROR',
          message: 'All analysis agents failed',
          retryable: true,
          timestamp: new Date()
        }
      ),
      status: 'FAILED',
      createdAt: new Date(),
      completedAt: new Date()
    };

    return errorResult;
  }

  private createValidationResult(
    context: PartialAnalysisContext,
    successfulResults: AgentResult[],
    mode: string
  ): ValidationResult {
    // Aggregate findings from successful agents
    const allFindings: Finding[] = successfulResults
      .filter(result => result.result?.findings)
      .flatMap(result => result.result!.findings);

    // Create consensus (simplified)
    const consensus: ConsensusResult = {
      level: successfulResults.length / 4, // Assume 4 total agents
      agreement: [],
      conflicts: [],
      requiresSecondRound: false
    };

    // Create final analysis
    const finalAnalysis: FinalAnalysis = {
      overallAssessment: this.determineOverallAssessment(allFindings),
      keyFindings: this.prioritizeFindings(allFindings).slice(0, 10),
      dealBreakers: allFindings.filter(f => f.severity === 'CRITICAL'),
      opportunities: [],
      riskProfile: this.createRiskProfile(allFindings),
      recommendedActions: [],
      executiveSummary: this.createExecutiveSummary(allFindings, mode),
      confidence: this.calculateOverallConfidence(successfulResults)
    };

    return {
      id: `validation-${Date.now()}`,
      documentId: context.originalRequest?.documentId || 'unknown',
      agentResults: context.availableResults,
      consensus,
      finalAnalysis,
      status: 'COMPLETED',
      createdAt: new Date(),
      completedAt: new Date()
    };
  }

  private determineOverallAssessment(findings: Finding[]): OverallAssessment {
    const criticalFindings = findings.filter(f => f.severity === 'CRITICAL');
    const highFindings = findings.filter(f => f.severity === 'HIGH');

    if (criticalFindings.length > 0) {
      return 'STRONG_PASS';
    } else if (highFindings.length > 2) {
      return 'PASS';
    } else if (highFindings.length > 0) {
      return 'HOLD';
    } else {
      return 'BUY';
    }
  }

  private prioritizeFindings(findings: Finding[]): Finding[] {
    const severityWeight = {
      'CRITICAL': 4,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    };

    return findings.sort((a, b) => {
      return severityWeight[b.severity] - severityWeight[a.severity];
    });
  }

  private createRiskProfile(findings: Finding[]): RiskProfile {
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;

    let overallRisk: RiskLevel;
    if (criticalCount > 0) {
      overallRisk = 'VERY_HIGH';
    } else if (highCount > 2) {
      overallRisk = 'HIGH';
    } else if (highCount > 0) {
      overallRisk = 'MODERATE';
    } else {
      overallRisk = 'LOW';
    }

    return {
      overall: overallRisk,
      categories: [],
      mitigationStrategies: []
    };
  }

  private createExecutiveSummary(findings: Finding[], mode: string): string {
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;

    let summary = `Analysis completed in ${mode} mode. `;
    
    if (criticalCount > 0) {
      summary += `${criticalCount} critical issues identified. `;
    }
    
    if (highCount > 0) {
      summary += `${highCount} high-severity issues found. `;
    }

    if (mode !== 'NORMAL') {
      summary += `Note: Analysis completed with limited agent availability (${mode} mode). `;
    }

    return summary + 'Detailed review recommended before proceeding.';
  }

  private calculateOverallConfidence(results: AgentResult[]): number {
    if (results.length === 0) return 0.1;

    const avgConfidence = results
      .filter(r => r.result?.confidence !== undefined)
      .reduce((sum, r) => sum + (r.result!.confidence || 0), 0) / results.length;

    return Math.max(0.1, Math.min(1.0, avgConfidence || 0.5));
  }

  private updateMetrics(): void {
    if (this.metrics.totalFallbackActivations > 0) {
      this.metrics.fallbackSuccessRate = 
        (this.metrics.partialResultUsage + this.metrics.degradedModeActivations + this.metrics.emergencyModeActivations) /
        this.metrics.totalFallbackActivations;
    }
  }
}

/**
 * Default fallback strategies instance
 */
export const defaultFallbackStrategies = new FallbackStrategies();

/**
 * Utility function to check if a result set requires fallback
 */
export function requiresFallback(results: AgentResult[]): boolean {
  const successfulResults = results.filter(r => r.status === 'COMPLETED' && r.result);
  return successfulResults.length < results.length;
}

/**
 * Utility function to assess the severity of partial results
 */
export function assessPartialSeverity(
  available: AgentResult[],
  total: number
): 'MINIMAL' | 'MODERATE' | 'SEVERE' | 'CRITICAL' {
  const successRate = available.filter(r => r.status === 'COMPLETED').length / total;
  
  if (successRate >= 0.75) return 'MINIMAL';
  if (successRate >= 0.5) return 'MODERATE';
  if (successRate >= 0.25) return 'SEVERE';
  return 'CRITICAL';
}