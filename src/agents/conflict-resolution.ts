/**
 * Conflict Resolution Logic for PrismForge AI Agent System
 * Handles disagreements between agents when consensus threshold is not met
 * Triggers second round analysis with refined prompts and mediation protocols
 */

import { 
  AgentType, 
  AgentResult, 
  Conflict, 
  ConflictType, 
  ConflictResolution, 
  ResolutionMethod,
  Finding,
  Severity,
  EvidenceStrength,
  AgentAnalysis
} from '../types/core';

import { AGENT_PROFILES, AgentPersonality } from './agent-profiles';

export interface ConflictAnalysis {
  readonly conflicts: DetectedConflict[];
  readonly consensusLevel: number;
  readonly requiresSecondRound: boolean;
  readonly resolutionStrategy: ResolutionStrategy;
  readonly refinedPrompts: RefinedPrompt[];
}

export interface DetectedConflict {
  readonly id: string;
  readonly type: ConflictType;
  readonly participants: AgentType[];
  readonly disagreementScore: number;
  readonly criticalityLevel: CriticalityLevel;
  readonly resolutionComplexity: ResolutionComplexity;
  readonly evidenceQuality: ConflictEvidenceAssessment;
  readonly stakeholderImpact: StakeholderImpact;
}

export type CriticalityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ResolutionComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'HIGHLY_COMPLEX';

export interface ConflictEvidenceAssessment {
  readonly challengeEvidence: EvidenceQuality;
  readonly evidenceEvidence: EvidenceQuality;
  readonly riskEvidence: EvidenceQuality;
  readonly evidenceGaps: string[];
  readonly conflictingDataPoints: DataPointConflict[];
}

export interface EvidenceQuality {
  readonly strength: EvidenceStrength;
  readonly completeness: number;
  readonly reliability: number;
  readonly recency: number;
  readonly independence: number;
}

export interface DataPointConflict {
  readonly dataPoint: string;
  readonly agentInterpretations: Record<AgentType, string>;
  readonly resolutionMethod: DataResolutionMethod;
}

export type DataResolutionMethod = 
  | 'ADDITIONAL_VALIDATION'
  | 'EXPERT_CONSULTATION'
  | 'HISTORICAL_PRECEDENT'
  | 'THIRD_PARTY_VERIFICATION';

export interface StakeholderImpact {
  readonly dealValue: ImpactLevel;
  readonly timeline: ImpactLevel;
  readonly stakeholderConfidence: ImpactLevel;
  readonly regulatoryCompliance: ImpactLevel;
}

export type ImpactLevel = 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE';

export interface ResolutionStrategy {
  readonly primaryMethod: ResolutionMethod;
  readonly fallbackMethods: ResolutionMethod[];
  readonly mediationRequired: boolean;
  readonly mediator: AgentType | 'EXTERNAL';
  readonly timeAllocation: TimeAllocation;
  readonly successCriteria: SuccessCriteria;
}

export interface TimeAllocation {
  readonly analysisTime: number;
  readonly discussionTime: number;
  readonly synthesisTime: number;
  readonly totalTime: number;
}

export interface SuccessCriteria {
  readonly minimumConsensus: number;
  readonly evidenceThreshold: EvidenceStrength;
  readonly stakeholderAcceptance: number;
  readonly riskTolerance: number;
}

export interface RefinedPrompt {
  readonly agentType: AgentType;
  readonly originalIssue: string;
  readonly refinementStrategy: PromptRefinementStrategy;
  readonly additionalContext: string[];
  readonly focusAreas: string[];
  readonly constraintGuidance: string[];
  readonly collaborationInstructions: CollaborationInstruction[];
}

export type PromptRefinementStrategy = 
  | 'EVIDENCE_FOCUSED'
  | 'ASSUMPTION_CHALLENGING'
  | 'ALTERNATIVE_SCENARIO'
  | 'STAKEHOLDER_PERSPECTIVE'
  | 'RISK_MITIGATION'
  | 'COST_BENEFIT_REFRAME';

export interface CollaborationInstruction {
  readonly targetAgent: AgentType;
  readonly interactionType: InteractionType;
  readonly sharedFocus: string;
  readonly expectedOutcome: string;
}

export type InteractionType = 
  | 'INFORMATION_SHARING'
  | 'JOINT_ANALYSIS'
  | 'PERSPECTIVE_EXCHANGE'
  | 'EVIDENCE_VALIDATION'
  | 'ASSUMPTION_TESTING';

// Core conflict detection and analysis
export class ConflictDetector {
  private readonly consensusThreshold: number;
  private readonly disagreementThreshold: number;

  constructor(consensusThreshold: number = 0.7, disagreementThreshold: number = 0.5) {
    this.consensusThreshold = consensusThreshold;
    this.disagreementThreshold = disagreementThreshold;
  }

  analyzeConflicts(agentResults: AgentResult[]): ConflictAnalysis {
    const conflicts = this.detectConflicts(agentResults);
    const consensusLevel = this.calculateConsensusLevel(agentResults);
    const requiresSecondRound = consensusLevel < this.consensusThreshold;
    
    const resolutionStrategy = this.determineResolutionStrategy(conflicts, consensusLevel);
    const refinedPrompts = this.generateRefinedPrompts(conflicts, agentResults);

    return {
      conflicts,
      consensusLevel,
      requiresSecondRound,
      resolutionStrategy,
      refinedPrompts
    };
  }

  private detectConflicts(agentResults: AgentResult[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    const validResults = agentResults.filter(r => r.status === 'COMPLETED' && r.result);

    // Check for severity disagreements
    conflicts.push(...this.detectSeverityDisagreements(validResults));
    
    // Check for evidence interpretation conflicts
    conflicts.push(...this.detectEvidenceConflicts(validResults));
    
    // Check for recommendation differences
    conflicts.push(...this.detectRecommendationConflicts(validResults));
    
    // Check for impact assessment disagreements
    conflicts.push(...this.detectImpactConflicts(validResults));

    return conflicts;
  }

  private detectSeverityDisagreements(results: AgentResult[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    const findings = this.extractFindings(results);
    
    findings.forEach(findingGroup => {
      const severities = findingGroup.map(f => this.severityToNumber(f.severity));
      const maxSeverity = Math.max(...severities);
      const minSeverity = Math.min(...severities);
      const disagreementScore = (maxSeverity - minSeverity) / 3; // Normalize to 0-1
      
      if (disagreementScore > this.disagreementThreshold) {
        conflicts.push({
          id: `severity_${findingGroup[0].id}`,
          type: 'SEVERITY_DISAGREEMENT',
          participants: findingGroup.map(f => this.getAgentForFinding(f, results)),
          disagreementScore,
          criticalityLevel: this.assessCriticality(disagreementScore, maxSeverity),
          resolutionComplexity: this.assessComplexity(findingGroup),
          evidenceQuality: this.assessEvidenceQuality(findingGroup, results),
          stakeholderImpact: this.assessStakeholderImpact(findingGroup)
        });
      }
    });

    return conflicts;
  }

  private detectEvidenceConflicts(results: AgentResult[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    
    // Compare evidence interpretations between agents
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const agent1 = results[i];
        const agent2 = results[j];
        
        if (!agent1.result || !agent2.result) continue;
        
        const evidenceConflict = this.compareEvidenceInterpretations(
          agent1.result, 
          agent2.result, 
          agent1.agentType, 
          agent2.agentType
        );
        
        if (evidenceConflict) {
          conflicts.push(evidenceConflict);
        }
      }
    }

    return conflicts;
  }

  private detectRecommendationConflicts(results: AgentResult[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    
    // Analyze recommendation alignment
    const recommendations = results
      .filter(r => r.result?.recommendations)
      .flatMap(r => r.result!.recommendations.map(rec => ({
        recommendation: rec,
        agent: r.agentType
      })));

    const conflictingRecommendations = this.identifyConflictingRecommendations(recommendations);
    
    conflictingRecommendations.forEach(conflict => {
      conflicts.push({
        id: `recommendation_${conflict.id}`,
        type: 'RECOMMENDATION_DIFFERENCE',
        participants: conflict.agents,
        disagreementScore: conflict.conflictScore,
        criticalityLevel: this.assessRecommendationCriticality(conflict),
        resolutionComplexity: 'MODERATE',
        evidenceQuality: this.assessRecommendationEvidence(conflict, results),
        stakeholderImpact: this.assessRecommendationStakeholderImpact(conflict)
      });
    });

    return conflicts;
  }

  private detectImpactConflicts(results: AgentResult[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    
    // Compare impact assessments
    const impactAssessments = results
      .filter(r => r.result?.findings)
      .map(r => ({
        agent: r.agentType,
        impacts: r.result!.findings.map(f => f.impact)
      }));

    // Implementation would analyze impact assessment differences
    
    return conflicts;
  }

  private calculateConsensusLevel(agentResults: AgentResult[]): number {
    const validResults = agentResults.filter(r => r.status === 'COMPLETED' && r.result);
    if (validResults.length < 2) return 1.0;

    let totalAgreement = 0;
    let comparisons = 0;

    for (let i = 0; i < validResults.length; i++) {
      for (let j = i + 1; j < validResults.length; j++) {
        const agreement = this.calculatePairwiseAgreement(
          validResults[i].result!,
          validResults[j].result!
        );
        totalAgreement += agreement;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalAgreement / comparisons : 1.0;
  }

  private calculatePairwiseAgreement(analysis1: AgentAnalysis, analysis2: AgentAnalysis): number {
    // Weighted agreement calculation
    const confidenceAgreement = 1 - Math.abs(analysis1.confidence - analysis2.confidence);
    const evidenceAgreement = this.compareEvidenceStrength(
      analysis1.evidenceStrength, 
      analysis2.evidenceStrength
    );
    const findingAgreement = this.compareFindingsSimilarity(
      analysis1.findings, 
      analysis2.findings
    );

    return (confidenceAgreement * 0.3 + evidenceAgreement * 0.4 + findingAgreement * 0.3);
  }

  private determineResolutionStrategy(
    conflicts: DetectedConflict[], 
    consensusLevel: number
  ): ResolutionStrategy {
    const highCriticalityConflicts = conflicts.filter(c => 
      c.criticalityLevel === 'HIGH' || c.criticalityLevel === 'CRITICAL'
    );

    const complexConflicts = conflicts.filter(c => 
      c.resolutionComplexity === 'COMPLEX' || c.resolutionComplexity === 'HIGHLY_COMPLEX'
    );

    let primaryMethod: ResolutionMethod = 'WEIGHTED_VOTING';
    let mediationRequired = false;
    let mediator: AgentType | 'EXTERNAL' = 'JUDGE';

    if (highCriticalityConflicts.length > 0) {
      primaryMethod = 'JUDGE_DECISION';
      mediationRequired = true;
    } else if (complexConflicts.length > 0) {
      primaryMethod = 'EVIDENCE_STRENGTH';
      mediationRequired = true;
    } else if (consensusLevel < 0.5) {
      primaryMethod = 'MAJORITY_RULE';
    }

    return {
      primaryMethod,
      fallbackMethods: this.determineFallbackMethods(primaryMethod),
      mediationRequired,
      mediator,
      timeAllocation: this.calculateTimeAllocation(conflicts),
      successCriteria: this.defineSuccessCriteria(conflicts, consensusLevel)
    };
  }

  private generateRefinedPrompts(
    conflicts: DetectedConflict[], 
    agentResults: AgentResult[]
  ): RefinedPrompt[] {
    const prompts: RefinedPrompt[] = [];

    conflicts.forEach(conflict => {
      conflict.participants.forEach(agentType => {
        const agentProfile = AGENT_PROFILES[agentType];
        const originalResult = agentResults.find(r => r.agentType === agentType)?.result;
        
        if (originalResult) {
          prompts.push(this.createRefinedPrompt(
            agentType, 
            agentProfile, 
            conflict, 
            originalResult
          ));
        }
      });
    });

    return prompts;
  }

  private createRefinedPrompt(
    agentType: AgentType,
    profile: AgentPersonality,
    conflict: DetectedConflict,
    originalResult: AgentAnalysis
  ): RefinedPrompt {
    const refinementStrategy = this.selectRefinementStrategy(agentType, conflict);
    
    return {
      agentType,
      originalIssue: this.describeConflict(conflict),
      refinementStrategy,
      additionalContext: this.generateAdditionalContext(conflict, profile),
      focusAreas: this.identifyFocusAreas(conflict, agentType),
      constraintGuidance: this.createConstraintGuidance(conflict, profile),
      collaborationInstructions: this.defineCollaborationInstructions(
        agentType, 
        conflict, 
        originalResult
      )
    };
  }

  private selectRefinementStrategy(
    agentType: AgentType, 
    conflict: DetectedConflict
  ): PromptRefinementStrategy {
    switch (agentType) {
      case 'CHALLENGE':
        return conflict.type === 'SEVERITY_DISAGREEMENT' 
          ? 'ASSUMPTION_CHALLENGING' 
          : 'ALTERNATIVE_SCENARIO';
      
      case 'EVIDENCE':
        return 'EVIDENCE_FOCUSED';
      
      case 'RISK':
        return conflict.type === 'IMPACT_ASSESSMENT' 
          ? 'RISK_MITIGATION' 
          : 'STAKEHOLDER_PERSPECTIVE';
      
      case 'JUDGE':
        return 'COST_BENEFIT_REFRAME';
      
      default:
        return 'EVIDENCE_FOCUSED';
    }
  }

  // Helper methods for complexity assessment and data processing
  private severityToNumber(severity: Severity): number {
    const mapping = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    return mapping[severity];
  }

  private extractFindings(results: AgentResult[]): Finding[][] {
    // Group similar findings across agents
    const allFindings = results
      .filter(r => r.result?.findings)
      .flatMap(r => r.result!.findings);

    // Implementation would use semantic similarity to group findings
    return [allFindings]; // Simplified for now
  }

  private getAgentForFinding(finding: Finding, results: AgentResult[]): AgentType {
    const result = results.find(r => 
      r.result?.findings.some(f => f.id === finding.id)
    );
    return result?.agentType || 'EVIDENCE';
  }

  private assessCriticality(disagreementScore: number, maxSeverity: number): CriticalityLevel {
    if (disagreementScore > 0.8 && maxSeverity >= 2) return 'CRITICAL';
    if (disagreementScore > 0.6 || maxSeverity >= 2) return 'HIGH';
    if (disagreementScore > 0.4) return 'MODERATE';
    return 'LOW';
  }

  private assessComplexity(findings: Finding[]): ResolutionComplexity {
    const hasMultipleCategories = new Set(findings.map(f => f.category)).size > 1;
    const hasHighImpact = findings.some(f => f.impact === 'SEVERE' || f.impact === 'SIGNIFICANT');
    
    if (hasMultipleCategories && hasHighImpact) return 'HIGHLY_COMPLEX';
    if (hasMultipleCategories || hasHighImpact) return 'COMPLEX';
    return 'MODERATE';
  }

  private assessEvidenceQuality(
    findings: Finding[], 
    results: AgentResult[]
  ): ConflictEvidenceAssessment {
    // Implementation would assess evidence quality across different agents
    return {
      challengeEvidence: { strength: 'MODERATE', completeness: 0.7, reliability: 0.8, recency: 0.9, independence: 0.6 },
      evidenceEvidence: { strength: 'STRONG', completeness: 0.9, reliability: 0.9, recency: 0.8, independence: 0.8 },
      riskEvidence: { strength: 'MODERATE', completeness: 0.8, reliability: 0.7, recency: 0.7, independence: 0.7 },
      evidenceGaps: ['Market validation data', 'Historical precedent analysis'],
      conflictingDataPoints: []
    };
  }

  private assessStakeholderImpact(findings: Finding[]): StakeholderImpact {
    // Assess potential impact on various stakeholders
    return {
      dealValue: 'MODERATE',
      timeline: 'MODERATE',
      stakeholderConfidence: 'SIGNIFICANT',
      regulatoryCompliance: 'MINIMAL'
    };
  }

  private compareEvidenceInterpretations(
    analysis1: AgentAnalysis,
    analysis2: AgentAnalysis,
    agent1: AgentType,
    agent2: AgentType
  ): DetectedConflict | null {
    // Implementation would compare evidence interpretations
    return null; // Simplified for now
  }

  private identifyConflictingRecommendations(
    recommendations: Array<{ recommendation: any; agent: AgentType }>
  ): Array<{ id: string; agents: AgentType[]; conflictScore: number }> {
    // Implementation would identify conflicting recommendations
    return [];
  }

  private compareEvidenceStrength(strength1: EvidenceStrength, strength2: EvidenceStrength): number {
    const strengthValues = { WEAK: 0, MODERATE: 1, STRONG: 2, VERY_STRONG: 3 };
    const diff = Math.abs(strengthValues[strength1] - strengthValues[strength2]);
    return 1 - (diff / 3);
  }

  private compareFindingsSimilarity(findings1: Finding[], findings2: Finding[]): number {
    // Implementation would compare findings similarity
    return 0.7; // Placeholder
  }

  private determineFallbackMethods(primaryMethod: ResolutionMethod): ResolutionMethod[] {
    const fallbackMap: Record<ResolutionMethod, ResolutionMethod[]> = {
      WEIGHTED_VOTING: ['EVIDENCE_STRENGTH', 'MAJORITY_RULE'],
      JUDGE_DECISION: ['WEIGHTED_VOTING', 'EVIDENCE_STRENGTH'],
      EVIDENCE_STRENGTH: ['WEIGHTED_VOTING', 'JUDGE_DECISION'],
      MAJORITY_RULE: ['WEIGHTED_VOTING', 'EVIDENCE_STRENGTH']
    };

    return fallbackMap[primaryMethod] || ['WEIGHTED_VOTING'];
  }

  private calculateTimeAllocation(conflicts: DetectedConflict[]): TimeAllocation {
    const baseTime = 30; // minutes
    const complexityMultiplier = conflicts.reduce((acc, c) => {
      const multipliers = { SIMPLE: 1, MODERATE: 1.5, COMPLEX: 2, HIGHLY_COMPLEX: 3 };
      return acc + multipliers[c.resolutionComplexity];
    }, 0) / conflicts.length;

    const analysisTime = baseTime * complexityMultiplier;
    const discussionTime = analysisTime * 0.6;
    const synthesisTime = analysisTime * 0.4;

    return {
      analysisTime,
      discussionTime,
      synthesisTime,
      totalTime: analysisTime + discussionTime + synthesisTime
    };
  }

  private defineSuccessCriteria(
    conflicts: DetectedConflict[], 
    currentConsensus: number
  ): SuccessCriteria {
    const hasCriticalConflicts = conflicts.some(c => c.criticalityLevel === 'CRITICAL');
    
    return {
      minimumConsensus: hasCriticalConflicts ? 0.8 : 0.7,
      evidenceThreshold: hasCriticalConflicts ? 'STRONG' : 'MODERATE',
      stakeholderAcceptance: 0.75,
      riskTolerance: hasCriticalConflicts ? 0.2 : 0.3
    };
  }

  private describeConflict(conflict: DetectedConflict): string {
    const typeDescriptions = {
      SEVERITY_DISAGREEMENT: 'Agents disagree on the severity of identified issues',
      EVIDENCE_INTERPRETATION: 'Agents interpret the same evidence differently',
      RECOMMENDATION_DIFFERENCE: 'Agents propose conflicting recommendations',
      IMPACT_ASSESSMENT: 'Agents assess impact levels differently'
    };

    return typeDescriptions[conflict.type];
  }

  private generateAdditionalContext(
    conflict: DetectedConflict, 
    profile: AgentPersonality
  ): string[] {
    return [
      `Consider your cognitive bias towards ${profile.biases[0]?.name}`,
      `Focus on your strength in ${profile.expertise.primaryDomains.join(', ')}`,
      `Apply your ${profile.expertise.methodologies[0]?.name} methodology`
    ];
  }

  private identifyFocusAreas(conflict: DetectedConflict, agentType: AgentType): string[] {
    const focusMap: Record<AgentType, string[]> = {
      CHALLENGE: ['Assumption validation', 'Alternative scenarios', 'Strategic risks'],
      EVIDENCE: ['Data validation', 'Source verification', 'Quality assessment'],
      RISK: ['Implementation barriers', 'Mitigation strategies', 'Scenario planning'],
      JUDGE: ['Stakeholder impact', 'Trade-off analysis', 'Synthesis framework']
    };

    return focusMap[agentType];
  }

  private createConstraintGuidance(
    conflict: DetectedConflict, 
    profile: AgentPersonality
  ): string[] {
    return [
      `Maintain your ${profile.communication.tone} communication style`,
      `Apply ${profile.decisionMaking.framework} decision framework`,
      `Consider time constraint: ${profile.decisionMaking.timePreference}`
    ];
  }

  private defineCollaborationInstructions(
    agentType: AgentType,
    conflict: DetectedConflict,
    originalResult: AgentAnalysis
  ): CollaborationInstruction[] {
    const instructions: CollaborationInstruction[] = [];

    conflict.participants
      .filter(participant => participant !== agentType)
      .forEach(participant => {
        instructions.push({
          targetAgent: participant,
          interactionType: 'EVIDENCE_VALIDATION',
          sharedFocus: 'Resolve evidence interpretation differences',
          expectedOutcome: 'Aligned understanding of evidence quality and implications'
        });
      });

    return instructions;
  }

  // Additional helper methods would be implemented for remaining assessments
  private assessRecommendationCriticality(conflict: any): CriticalityLevel {
    return 'MODERATE';
  }

  private assessRecommendationEvidence(conflict: any, results: AgentResult[]): ConflictEvidenceAssessment {
    return {
      challengeEvidence: { strength: 'MODERATE', completeness: 0.7, reliability: 0.8, recency: 0.9, independence: 0.6 },
      evidenceEvidence: { strength: 'STRONG', completeness: 0.9, reliability: 0.9, recency: 0.8, independence: 0.8 },
      riskEvidence: { strength: 'MODERATE', completeness: 0.8, reliability: 0.7, recency: 0.7, independence: 0.7 },
      evidenceGaps: [],
      conflictingDataPoints: []
    };
  }

  private assessRecommendationStakeholderImpact(conflict: any): StakeholderImpact {
    return {
      dealValue: 'MODERATE',
      timeline: 'MODERATE',
      stakeholderConfidence: 'SIGNIFICANT',
      regulatoryCompliance: 'MINIMAL'
    };
  }
}

// Export singleton instance
export const conflictDetector = new ConflictDetector();