/**
 * Consensus System for PrismForge AI
 * Implements threshold-based consensus and conflict resolution mechanisms
 */

import {
  AgentType,
  AgentResult,
  Finding,
  ConsensusResult,
  Conflict,
  ConflictType,
  ConflictResolution,
  ResolutionMethod,
  AgentAgreement,
  Severity,
  EvidenceStrength,
  Priority,
  AgentAnalysis
} from '../types/core.js';

export interface ConsensusConfig {
  minimumAgreementThreshold: number;
  strongConsensusThreshold: number;
  evidenceWeightThreshold: number;
  conflictResolutionStrategy: ResolutionMethod;
  enableJudgeOverride: boolean;
  severityEscalationThreshold: number;
  confidenceBoostFactor: number;
  requireUnanimousForCritical: boolean;
  maxConflictResolutionRounds: number;
}

export interface ConsensusMetrics {
  totalConsensusAttempts: number;
  successfulConsensus: number;
  conflictsResolved: number;
  judgeOverrides: number;
  averageAgreementLevel: number;
  conflictTypes: Record<ConflictType, number>;
  resolutionMethods: Record<ResolutionMethod, number>;
  agentAgreementRates: Record<AgentType, number>;
}

export interface WeightedVote {
  agent: AgentType;
  weight: number;
  confidence: number;
  vote: any;
  reasoning?: string;
}

export interface ConsensusContext {
  originalFindings: Finding[];
  agentResults: AgentResult[];
  consensusRound: number;
  previousConflicts: Conflict[];
  resolutionHistory: ConflictResolution[];
}

export class ConsensusSystem {
  private config: ConsensusConfig;
  private metrics: ConsensusMetrics;
  private agentWeights: Record<AgentType, number>;

  constructor(config: Partial<ConsensusConfig> = {}) {
    this.config = {
      minimumAgreementThreshold: 0.5, // 50% agreement required
      strongConsensusThreshold: 0.8,  // 80% for strong consensus
      evidenceWeightThreshold: 0.7,   // 70% evidence strength required
      conflictResolutionStrategy: 'WEIGHTED_VOTING',
      enableJudgeOverride: true,
      severityEscalationThreshold: 0.6,
      confidenceBoostFactor: 1.2,
      requireUnanimousForCritical: true,
      maxConflictResolutionRounds: 3,
      ...config
    };

    this.agentWeights = {
      'CHALLENGE': 1.0,
      'EVIDENCE': 1.2,  // Evidence agent has slightly higher weight
      'RISK': 1.1,
      'JUDGE': 1.5      // Judge has highest weight
    };

    this.metrics = {
      totalConsensusAttempts: 0,
      successfulConsensus: 0,
      conflictsResolved: 0,
      judgeOverrides: 0,
      averageAgreementLevel: 0,
      conflictTypes: {
        'SEVERITY_DISAGREEMENT': 0,
        'EVIDENCE_INTERPRETATION': 0,
        'RECOMMENDATION_DIFFERENCE': 0,
        'IMPACT_ASSESSMENT': 0
      },
      resolutionMethods: {
        'WEIGHTED_VOTING': 0,
        'JUDGE_DECISION': 0,
        'EVIDENCE_STRENGTH': 0,
        'MAJORITY_RULE': 0
      },
      agentAgreementRates: {
        'CHALLENGE': 0,
        'EVIDENCE': 0,
        'RISK': 0,
        'JUDGE': 0
      }
    };
  }

  /**
   * Build consensus from agent results
   */
  public async buildConsensus(agentResults: AgentResult[]): Promise<ConsensusResult> {
    this.metrics.totalConsensusAttempts++;

    const context: ConsensusContext = {
      originalFindings: this.extractAllFindings(agentResults),
      agentResults,
      consensusRound: 1,
      previousConflicts: [],
      resolutionHistory: []
    };

    console.info(`Building consensus from ${agentResults.length} agent results`);

    // Identify agreements and conflicts
    const agreements = this.identifyAgreements(context);
    const conflicts = this.identifyConflicts(context);

    console.info(`Found ${agreements.length} agreements and ${conflicts.length} conflicts`);

    // Resolve conflicts
    const resolvedConflicts = await this.resolveConflicts(conflicts, context);

    // Calculate consensus level
    const consensusLevel = this.calculateConsensusLevel(agreements, resolvedConflicts, context);

    // Determine if second round is needed
    const requiresSecondRound = this.shouldTriggerSecondRound(
      consensusLevel,
      resolvedConflicts,
      context
    );

    const result: ConsensusResult = {
      level: consensusLevel,
      agreement: agreements,
      conflicts: resolvedConflicts,
      requiresSecondRound
    };

    if (consensusLevel >= this.config.minimumAgreementThreshold) {
      this.metrics.successfulConsensus++;
    }

    this.updateMetrics(result);

    console.info(
      `Consensus built: level=${consensusLevel.toFixed(2)}, ` +
      `agreements=${agreements.length}, conflicts=${resolvedConflicts.length}, ` +
      `secondRound=${requiresSecondRound}`
    );

    return result;
  }

  /**
   * Resolve conflicts between agents
   */
  public async resolveConflicts(
    conflicts: Conflict[],
    context: ConsensusContext
  ): Promise<Conflict[]> {
    const resolvedConflicts: Conflict[] = [];

    for (const conflict of conflicts) {
      console.info(`Resolving ${conflict.conflictType} conflict between agents: ${conflict.agents.join(', ')}`);

      const resolution = await this.resolveIndividualConflict(conflict, context);
      
      const resolvedConflict: Conflict = {
        ...conflict,
        resolution
      };

      resolvedConflicts.push(resolvedConflict);
      this.metrics.conflictsResolved++;
      this.metrics.conflictTypes[conflict.conflictType]++;

      if (resolution) {
        this.metrics.resolutionMethods[resolution.method]++;
        context.resolutionHistory.push(resolution);
      }
    }

    return resolvedConflicts;
  }

  /**
   * Perform weighted voting on a specific issue
   */
  public performWeightedVoting<T>(
    votes: WeightedVote[],
    tieBreaker?: (votes: WeightedVote[]) => WeightedVote
  ): WeightedVote | null {
    if (votes.length === 0) {
      return null;
    }

    // Group votes by their actual vote value
    const voteGroups = new Map<string, WeightedVote[]>();
    
    votes.forEach(vote => {
      const key = JSON.stringify(vote.vote);
      if (!voteGroups.has(key)) {
        voteGroups.set(key, []);
      }
      voteGroups.get(key)!.push(vote);
    });

    // Calculate weighted scores for each vote group
    const groupScores = new Map<string, number>();
    
    voteGroups.forEach((groupVotes, key) => {
      const totalWeight = groupVotes.reduce((sum, vote) => {
        const agentWeight = this.agentWeights[vote.agent] || 1.0;
        return sum + (agentWeight * vote.confidence * vote.weight);
      }, 0);
      
      groupScores.set(key, totalWeight);
    });

    // Find the group with the highest score
    let maxScore = -1;
    let winningKey: string | null = null;
    
    groupScores.forEach((score, key) => {
      if (score > maxScore) {
        maxScore = score;
        winningKey = key;
      }
    });

    if (!winningKey || maxScore === 0) {
      return null;
    }

    // Check for ties
    const tiedGroups = Array.from(groupScores.entries())
      .filter(([_, score]) => score === maxScore);

    if (tiedGroups.length > 1 && tieBreaker) {
      // Use tie breaker
      const tiedVotes = tiedGroups.flatMap(([key]) => voteGroups.get(key) || []);
      return tieBreaker(tiedVotes);
    }

    // Return a representative vote from the winning group
    const winningVotes = voteGroups.get(winningKey)!;
    return winningVotes.reduce((best, current) => {
      const currentScore = this.agentWeights[current.agent] * current.confidence;
      const bestScore = this.agentWeights[best.agent] * best.confidence;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Check if findings are substantially similar
   */
  public findingsAreSimilar(finding1: Finding, finding2: Finding): boolean {
    // Same category is required
    if (finding1.category !== finding2.category) {
      return false;
    }

    // Similar severity (within 1 level)
    const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const severity1Index = severityLevels.indexOf(finding1.severity);
    const severity2Index = severityLevels.indexOf(finding2.severity);
    
    if (Math.abs(severity1Index - severity2Index) > 1) {
      return false;
    }

    // Check title similarity (simple keyword matching)
    const keywords1 = this.extractKeywords(finding1.title);
    const keywords2 = this.extractKeywords(finding2.title);
    const commonKeywords = keywords1.filter(kw => keywords2.includes(kw));
    
    return commonKeywords.length >= Math.min(keywords1.length, keywords2.length) * 0.5;
  }

  /**
   * Get consensus metrics
   */
  public getMetrics(): ConsensusMetrics {
    return { ...this.metrics };
  }

  /**
   * Update agent weights based on historical performance
   */
  public updateAgentWeights(performanceData: Record<AgentType, number>): void {
    Object.entries(performanceData).forEach(([agent, performance]) => {
      const agentType = agent as AgentType;
      // Adjust weight based on performance (0.5 to 2.0 range)
      this.agentWeights[agentType] = Math.max(0.5, Math.min(2.0, performance));
    });

    console.info('Updated agent weights:', this.agentWeights);
  }

  /**
   * Reset consensus metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      totalConsensusAttempts: 0,
      successfulConsensus: 0,
      conflictsResolved: 0,
      judgeOverrides: 0,
      averageAgreementLevel: 0,
      conflictTypes: {
        'SEVERITY_DISAGREEMENT': 0,
        'EVIDENCE_INTERPRETATION': 0,
        'RECOMMENDATION_DIFFERENCE': 0,
        'IMPACT_ASSESSMENT': 0
      },
      resolutionMethods: {
        'WEIGHTED_VOTING': 0,
        'JUDGE_DECISION': 0,
        'EVIDENCE_STRENGTH': 0,
        'MAJORITY_RULE': 0
      },
      agentAgreementRates: {
        'CHALLENGE': 0,
        'EVIDENCE': 0,
        'RISK': 0,
        'JUDGE': 0
      }
    };
  }

  private extractAllFindings(agentResults: AgentResult[]): Finding[] {
    return agentResults
      .filter(result => result.result?.findings)
      .flatMap(result => result.result!.findings);
  }

  private identifyAgreements(context: ConsensusContext): AgentAgreement[] {
    const agreements: AgentAgreement[] = [];
    const findings = context.originalFindings;

    // Group similar findings
    const findingGroups = this.groupSimilarFindings(findings, context.agentResults);

    findingGroups.forEach(group => {
      if (group.findings.length >= 2) {
        // Calculate agreement level
        const totalAgents = context.agentResults.length;
        const agreeingAgents = group.findings.length;
        const agreementLevel = agreeingAgents / totalAgents;

        if (agreementLevel >= this.config.minimumAgreementThreshold) {
          // Create consensus finding from the group
          const consensusFinding = this.createConsensusFinding(group.findings);
          
          agreements.push({
            agents: group.agents,
            finding: consensusFinding,
            agreementLevel
          });
        }
      }
    });

    return agreements;
  }

  private identifyConflicts(context: ConsensusContext): Conflict[] {
    const conflicts: Conflict[] = [];
    const findings = context.originalFindings;

    // Group findings by category for conflict detection
    const categoryGroups = new Map<string, Finding[]>();
    
    findings.forEach(finding => {
      const key = finding.category;
      if (!categoryGroups.has(key)) {
        categoryGroups.set(key, []);
      }
      categoryGroups.get(key)!.push(finding);
    });

    // Look for conflicts within each category
    categoryGroups.forEach((categoryFindings, category) => {
      if (categoryFindings.length < 2) {
        return; // No conflict possible with single finding
      }

      // Check for severity disagreements
      const severityConflicts = this.findSeverityConflicts(categoryFindings, context);
      conflicts.push(...severityConflicts);

      // Check for evidence interpretation conflicts
      const evidenceConflicts = this.findEvidenceConflicts(categoryFindings, context);
      conflicts.push(...evidenceConflicts);

      // Check for recommendation differences
      const recommendationConflicts = this.findRecommendationConflicts(categoryFindings, context);
      conflicts.push(...recommendationConflicts);

      // Check for impact assessment conflicts
      const impactConflicts = this.findImpactConflicts(categoryFindings, context);
      conflicts.push(...impactConflicts);
    });

    return conflicts;
  }

  private async resolveIndividualConflict(
    conflict: Conflict,
    context: ConsensusContext
  ): Promise<ConflictResolution | undefined> {
    const strategy = this.config.conflictResolutionStrategy;

    console.debug(`Resolving conflict using ${strategy} strategy`);

    switch (strategy) {
      case 'WEIGHTED_VOTING':
        return this.resolveByWeightedVoting(conflict, context);
      
      case 'JUDGE_DECISION':
        return this.resolveByJudgeDecision(conflict, context);
      
      case 'EVIDENCE_STRENGTH':
        return this.resolveByEvidenceStrength(conflict, context);
      
      case 'MAJORITY_RULE':
        return this.resolveByMajorityRule(conflict, context);
      
      default:
        console.error(`Unknown resolution strategy: ${strategy}`);
        return undefined;
    }
  }

  private resolveByWeightedVoting(
    conflict: Conflict,
    context: ConsensusContext
  ): ConflictResolution {
    // Create weighted votes for each agent's position
    const votes: WeightedVote[] = conflict.agents.map(agent => {
      const agentResult = context.agentResults.find(r => r.agentType === agent);
      const confidence = agentResult?.result?.confidence || 0.5;
      
      return {
        agent,
        weight: this.agentWeights[agent],
        confidence,
        vote: conflict.finding, // Simplified - would need more sophisticated vote extraction
        reasoning: `Agent ${agent} analysis`
      };
    });

    const winner = this.performWeightedVoting(votes);
    
    return {
      method: 'WEIGHTED_VOTING',
      winner: winner?.agent || conflict.agents[0],
      justification: `Weighted voting based on agent expertise and confidence levels`
    };
  }

  private resolveByJudgeDecision(
    conflict: Conflict,
    context: ConsensusContext
  ): ConflictResolution {
    // If judge is involved in the conflict, use judge's decision
    if (conflict.agents.includes('JUDGE')) {
      this.metrics.judgeOverrides++;
      return {
        method: 'JUDGE_DECISION',
        winner: 'JUDGE',
        justification: 'Judge agent override due to expertise in synthesis and decision-making'
      };
    }

    // Otherwise, fallback to weighted voting
    return this.resolveByWeightedVoting(conflict, context);
  }

  private resolveByEvidenceStrength(
    conflict: Conflict,
    context: ConsensusContext
  ): ConflictResolution {
    // Find the agent with the strongest evidence
    let strongestAgent: AgentType | null = null;
    let strongestEvidence: EvidenceStrength = 'WEAK';

    conflict.agents.forEach(agent => {
      const agentResult = context.agentResults.find(r => r.agentType === agent);
      const evidenceStrength = agentResult?.result?.evidenceStrength;

      if (evidenceStrength && this.isStrongerEvidence(evidenceStrength, strongestEvidence)) {
        strongestEvidence = evidenceStrength;
        strongestAgent = agent;
      }
    });

    return {
      method: 'EVIDENCE_STRENGTH',
      winner: strongestAgent || conflict.agents[0],
      justification: `Resolution based on strongest evidence quality: ${strongestEvidence}`
    };
  }

  private resolveByMajorityRule(
    conflict: Conflict,
    context: ConsensusContext
  ): ConflictResolution {
    // Group agents by their position (simplified)
    const positions = new Map<string, AgentType[]>();
    
    conflict.agents.forEach(agent => {
      // Simplified position grouping - would need more sophisticated logic
      const key = agent; // For now, each agent is its own position
      if (!positions.has(key)) {
        positions.set(key, []);
      }
      positions.get(key)!.push(agent);
    });

    // Find the position with the most agents
    let majorityPosition: string | null = null;
    let maxAgents = 0;

    positions.forEach((agents, position) => {
      if (agents.length > maxAgents) {
        maxAgents = agents.length;
        majorityPosition = position;
      }
    });

    const winner = majorityPosition ? 
      positions.get(majorityPosition)![0] : 
      conflict.agents[0];

    return {
      method: 'MAJORITY_RULE',
      winner,
      justification: `Majority rule: ${maxAgents} out of ${conflict.agents.length} agents`
    };
  }

  private calculateConsensusLevel(
    agreements: AgentAgreement[],
    conflicts: Conflict[],
    context: ConsensusContext
  ): number {
    const totalFindings = context.originalFindings.length;
    const agreedFindings = agreements.reduce((sum, agreement) => 
      sum + (agreement.agreementLevel * 1), 0
    );
    const resolvedConflicts = conflicts.filter(c => c.resolution).length;
    const unresolvedConflicts = conflicts.length - resolvedConflicts;

    if (totalFindings === 0) {
      return 1.0; // No findings = full consensus
    }

    // Base consensus from agreements
    let consensus = agreedFindings / totalFindings;

    // Boost for resolved conflicts
    consensus += (resolvedConflicts * 0.1);

    // Penalty for unresolved conflicts
    consensus -= (unresolvedConflicts * 0.2);

    // Ensure consensus is between 0 and 1
    return Math.max(0, Math.min(1, consensus));
  }

  private shouldTriggerSecondRound(
    consensusLevel: number,
    conflicts: Conflict[],
    context: ConsensusContext
  ): boolean {
    // Don't trigger if we already have strong consensus
    if (consensusLevel >= this.config.strongConsensusThreshold) {
      return false;
    }

    // Don't trigger if we've already done too many rounds
    if (context.consensusRound >= this.config.maxConflictResolutionRounds) {
      return false;
    }

    // Trigger if consensus is below minimum and we have unresolved conflicts
    const unresolvedConflicts = conflicts.filter(c => !c.resolution).length;
    
    return consensusLevel < this.config.minimumAgreementThreshold && 
           unresolvedConflicts > 0;
  }

  private groupSimilarFindings(
    findings: Finding[],
    agentResults: AgentResult[]
  ): Array<{ findings: Finding[]; agents: AgentType[] }> {
    const groups: Array<{ findings: Finding[]; agents: AgentType[] }> = [];
    const used = new Set<string>();

    findings.forEach(finding => {
      if (used.has(finding.id)) {
        return;
      }

      const similar = findings.filter(other => 
        !used.has(other.id) && this.findingsAreSimilar(finding, other)
      );

      if (similar.length > 0) {
        const agents = similar.map(f => {
          const agentResult = agentResults.find(r => 
            r.result?.findings?.some(af => af.id === f.id)
          );
          return agentResult?.agentType || 'CHALLENGE';
        });

        groups.push({ findings: similar, agents });
        similar.forEach(f => used.add(f.id));
      }
    });

    return groups;
  }

  private createConsensusFinding(findings: Finding[]): Finding {
    // Take the most severe finding as base
    const baseFinding = findings.reduce((most, current) => {
      const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const mostIndex = severityLevels.indexOf(most.severity);
      const currentIndex = severityLevels.indexOf(current.severity);
      return currentIndex > mostIndex ? current : most;
    });

    // Combine evidence from all findings
    const allEvidence = findings.flatMap(f => f.evidence);

    return {
      ...baseFinding,
      id: `consensus-${baseFinding.id}`,
      title: `${baseFinding.title} (Consensus)`,
      description: `Consensus finding based on ${findings.length} agent analyses: ${baseFinding.description}`,
      evidence: allEvidence
    };
  }

  private findSeverityConflicts(findings: Finding[], context: ConsensusContext): Conflict[] {
    const conflicts: Conflict[] = [];
    const severityGroups = new Map<Severity, Finding[]>();

    findings.forEach(finding => {
      if (!severityGroups.has(finding.severity)) {
        severityGroups.set(finding.severity, []);
      }
      severityGroups.get(finding.severity)!.push(finding);
    });

    if (severityGroups.size > 1) {
      const agents = findings.map(f => {
        const agentResult = context.agentResults.find(r =>
          r.result?.findings?.some(af => af.id === f.id)
        );
        return agentResult?.agentType || 'CHALLENGE';
      });

      conflicts.push({
        agents,
        finding: findings[0], // Representative finding
        conflictType: 'SEVERITY_DISAGREEMENT'
      });
    }

    return conflicts;
  }

  private findEvidenceConflicts(findings: Finding[], context: ConsensusContext): Conflict[] {
    // Implementation for evidence interpretation conflicts
    return [];
  }

  private findRecommendationConflicts(findings: Finding[], context: ConsensusContext): Conflict[] {
    // Implementation for recommendation conflicts
    return [];
  }

  private findImpactConflicts(findings: Finding[], context: ConsensusContext): Conflict[] {
    // Implementation for impact assessment conflicts
    return [];
  }

  private isStrongerEvidence(evidence1: EvidenceStrength, evidence2: EvidenceStrength): boolean {
    const strengths = ['WEAK', 'MODERATE', 'STRONG', 'VERY_STRONG'];
    return strengths.indexOf(evidence1) > strengths.indexOf(evidence2);
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5); // Take first 5 significant words
  }

  private updateMetrics(result: ConsensusResult): void {
    const currentAvg = this.metrics.averageAgreementLevel;
    const count = this.metrics.totalConsensusAttempts;
    
    this.metrics.averageAgreementLevel = 
      (currentAvg * (count - 1) + result.level) / count;
  }
}

/**
 * Default consensus system instance
 */
export const defaultConsensusSystem = new ConsensusSystem();

/**
 * Utility function to check if consensus is sufficient
 */
export function isConsensusSufficient(
  consensus: ConsensusResult,
  threshold: number = 0.5
): boolean {
  return consensus.level >= threshold;
}

/**
 * Utility function to get the strongest agreement
 */
export function getStrongestAgreement(agreements: AgentAgreement[]): AgentAgreement | null {
  if (agreements.length === 0) return null;
  
  return agreements.reduce((strongest, current) =>
    current.agreementLevel > strongest.agreementLevel ? current : strongest
  );
}

/**
 * Utility function to prioritize conflicts by type
 */
export function prioritizeConflicts(conflicts: Conflict[]): Conflict[] {
  const priority: Record<ConflictType, number> = {
    'SEVERITY_DISAGREEMENT': 4,
    'IMPACT_ASSESSMENT': 3,
    'EVIDENCE_INTERPRETATION': 2,
    'RECOMMENDATION_DIFFERENCE': 1
  };

  return conflicts.sort((a, b) => 
    priority[b.conflictType] - priority[a.conflictType]
  );
}