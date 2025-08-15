/**
 * Weighted Scoring Algorithms and Consensus Mechanisms for PrismForge AI
 * Implements sophisticated scoring systems for agent consensus and final decision-making
 * Challenge: 30%, Evidence: 40%, Risk: 30%, Judge: synthesis with weighted input
 */

import {
  AgentType,
  AgentResult,
  AgentAnalysis,
  Finding,
  Severity,
  EvidenceStrength,
  Impact,
  Likelihood,
  Priority,
  Recommendation,
  RecommendationType,
  OverallAssessment
} from '../types/core';

import { AGENT_PROFILES, AgentPersonality } from './agent-profiles';

export interface WeightingConfiguration {
  readonly challengeWeight: number;     // 30%
  readonly evidenceWeight: number;      // 40%
  readonly riskWeight: number;          // 30%
  readonly judgeWeight: number;         // Synthesis role
  readonly contextualAdjustments: ContextualAdjustment[];
  readonly qualityThresholds: QualityThreshold[];
}

export interface ContextualAdjustment {
  readonly condition: WeightingCondition;
  readonly adjustments: Record<AgentType, number>;
  readonly rationale: string;
}

export interface WeightingCondition {
  readonly type: ConditionType;
  readonly parameters: Record<string, any>;
  readonly threshold: number;
}

export type ConditionType = 
  | 'DEAL_SIZE'
  | 'INDUSTRY_TYPE'
  | 'DEAL_STAGE'
  | 'COMPLEXITY_LEVEL'
  | 'RISK_PROFILE'
  | 'TIME_CONSTRAINT'
  | 'REGULATORY_ENVIRONMENT';

export interface QualityThreshold {
  readonly agentType: AgentType;
  readonly minimumConfidence: number;
  readonly minimumEvidenceStrength: EvidenceStrength;
  readonly penaltyFactor: number;
}

export interface ScoringResult {
  readonly overallScore: number;
  readonly agentScores: Record<AgentType, AgentScore>;
  readonly consensusMetrics: ConsensusMetrics;
  readonly confidenceInterval: ConfidenceInterval;
  readonly qualityAssessment: QualityAssessment;
  readonly recommendation: WeightedRecommendation;
}

export interface AgentScore {
  readonly rawScore: number;
  readonly weightedScore: number;
  readonly qualityMultiplier: number;
  readonly confidenceLevel: number;
  readonly evidenceStrength: EvidenceStrength;
  readonly contributionWeight: number;
  readonly adjustmentFactors: AdjustmentFactor[];
}

export interface AdjustmentFactor {
  readonly type: AdjustmentType;
  readonly magnitude: number;
  readonly justification: string;
}

export type AdjustmentType = 
  | 'EXPERTISE_BONUS'
  | 'QUALITY_PENALTY'
  | 'BIAS_CORRECTION'
  | 'CONTEXT_ADJUSTMENT'
  | 'PERFORMANCE_HISTORY';

export interface ConsensusMetrics {
  readonly agreement: number;
  readonly variance: number;
  readonly convergence: number;
  readonly stability: number;
  readonly polarization: number;
}

export interface ConfidenceInterval {
  readonly lower: number;
  readonly upper: number;
  readonly width: number;
  readonly confidence: number;
}

export interface QualityAssessment {
  readonly dataQuality: number;
  readonly analysisDepth: number;
  readonly methodologicalRigor: number;
  readonly evidenceSupport: number;
  readonly overallQuality: number;
}

export interface WeightedRecommendation {
  readonly primaryRecommendation: RecommendationType;
  readonly confidence: number;
  readonly supportingEvidence: SupportingEvidence[];
  readonly alternativeScenarios: AlternativeScenario[];
  readonly riskFactors: WeightedRiskFactor[];
}

export interface SupportingEvidence {
  readonly source: AgentType;
  readonly strength: EvidenceStrength;
  readonly weight: number;
  readonly description: string;
}

export interface AlternativeScenario {
  readonly scenario: string;
  readonly probability: number;
  readonly recommendation: RecommendationType;
  readonly supportingAgents: AgentType[];
}

export interface WeightedRiskFactor {
  readonly factor: string;
  readonly severity: Severity;
  readonly probability: number;
  readonly impact: Impact;
  readonly weight: number;
  readonly mitigation: string;
}

// Core weighted scoring engine
export class WeightedScoringEngine {
  private readonly defaultWeights: WeightingConfiguration;
  
  constructor() {
    this.defaultWeights = {
      challengeWeight: 0.30,
      evidenceWeight: 0.40,
      riskWeight: 0.30,
      judgeWeight: 0.0, // Judge synthesizes, doesn't score directly
      contextualAdjustments: [
        {
          condition: {
            type: 'DEAL_SIZE',
            parameters: { threshold: 100000000 }, // $100M+
            threshold: 100000000
          },
          adjustments: {
            CHALLENGE: 0.25,
            EVIDENCE: 0.45,
            RISK: 0.30,
            JUDGE: 0.0
          },
          rationale: 'Large deals require more evidence validation'
        },
        {
          condition: {
            type: 'COMPLEXITY_LEVEL',
            parameters: { categories: 3 }, // 3+ finding categories
            threshold: 3
          },
          adjustments: {
            CHALLENGE: 0.35,
            EVIDENCE: 0.35,
            RISK: 0.30,
            JUDGE: 0.0
          },
          rationale: 'Complex deals need more strategic challenge'
        }
      ],
      qualityThresholds: [
        {
          agentType: 'CHALLENGE',
          minimumConfidence: 0.7,
          minimumEvidenceStrength: 'MODERATE',
          penaltyFactor: 0.8
        },
        {
          agentType: 'EVIDENCE',
          minimumConfidence: 0.8,
          minimumEvidenceStrength: 'STRONG',
          penaltyFactor: 0.7
        },
        {
          agentType: 'RISK',
          minimumConfidence: 0.75,
          minimumEvidenceStrength: 'MODERATE',
          penaltyFactor: 0.75
        },
        {
          agentType: 'JUDGE',
          minimumConfidence: 0.6,
          minimumEvidenceStrength: 'MODERATE',
          penaltyFactor: 0.9
        }
      ]
    };
  }

  calculateWeightedScore(
    agentResults: AgentResult[],
    contextParameters?: Record<string, any>
  ): ScoringResult {
    // Determine contextual weights
    const weights = this.determineContextualWeights(agentResults, contextParameters);
    
    // Calculate individual agent scores
    const agentScores = this.calculateAgentScores(agentResults, weights);
    
    // Calculate consensus metrics
    const consensusMetrics = this.calculateConsensusMetrics(agentResults);
    
    // Calculate overall weighted score
    const overallScore = this.calculateOverallScore(agentScores, weights);
    
    // Determine confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(agentScores, consensusMetrics);
    
    // Assess quality
    const qualityAssessment = this.assessQuality(agentResults, agentScores);
    
    // Generate weighted recommendation
    const recommendation = this.generateWeightedRecommendation(
      agentResults, 
      agentScores, 
      overallScore
    );

    return {
      overallScore,
      agentScores,
      consensusMetrics,
      confidenceInterval,
      qualityAssessment,
      recommendation
    };
  }

  private determineContextualWeights(
    agentResults: AgentResult[],
    contextParameters?: Record<string, any>
  ): WeightingConfiguration {
    let weights = { ...this.defaultWeights };

    // Apply contextual adjustments
    for (const adjustment of this.defaultWeights.contextualAdjustments) {
      if (this.evaluateCondition(adjustment.condition, agentResults, contextParameters)) {
        weights = {
          ...weights,
          challengeWeight: adjustment.adjustments.CHALLENGE,
          evidenceWeight: adjustment.adjustments.EVIDENCE,
          riskWeight: adjustment.adjustments.RISK,
          judgeWeight: adjustment.adjustments.JUDGE
        };
      }
    }

    return weights;
  }

  private evaluateCondition(
    condition: WeightingCondition,
    agentResults: AgentResult[],
    contextParameters?: Record<string, any>
  ): boolean {
    switch (condition.type) {
      case 'DEAL_SIZE':
        const dealSize = contextParameters?.dealSize || 0;
        return dealSize >= condition.threshold;
      
      case 'COMPLEXITY_LEVEL':
        const categories = this.countUniqueCategories(agentResults);
        return categories >= condition.threshold;
      
      case 'RISK_PROFILE':
        const riskLevel = this.assessRiskLevel(agentResults);
        return riskLevel >= condition.threshold;
      
      default:
        return false;
    }
  }

  private calculateAgentScores(
    agentResults: AgentResult[],
    weights: WeightingConfiguration
  ): Record<AgentType, AgentScore> {
    const scores: Record<AgentType, AgentScore> = {} as Record<AgentType, AgentScore>;

    agentResults.forEach(result => {
      if (result.status === 'COMPLETED' && result.result) {
        scores[result.agentType] = this.calculateIndividualAgentScore(
          result,
          weights
        );
      }
    });

    return scores;
  }

  private calculateIndividualAgentScore(
    result: AgentResult,
    weights: WeightingConfiguration
  ): AgentScore {
    const analysis = result.result!;
    const profile = AGENT_PROFILES[result.agentType];
    
    // Base score calculation
    const rawScore = this.calculateRawScore(analysis, profile);
    
    // Quality multiplier
    const qualityMultiplier = this.calculateQualityMultiplier(
      analysis,
      result.agentType,
      weights
    );
    
    // Contribution weight
    const contributionWeight = this.getContributionWeight(result.agentType, weights);
    
    // Adjustment factors
    const adjustmentFactors = this.calculateAdjustmentFactors(
      analysis,
      profile,
      result
    );
    
    // Apply adjustments
    const adjustedScore = adjustmentFactors.reduce(
      (score, factor) => score * (1 + factor.magnitude),
      rawScore * qualityMultiplier
    );

    const weightedScore = adjustedScore * contributionWeight;

    return {
      rawScore,
      weightedScore,
      qualityMultiplier,
      confidenceLevel: analysis.confidence,
      evidenceStrength: analysis.evidenceStrength,
      contributionWeight,
      adjustmentFactors
    };
  }

  private calculateRawScore(analysis: AgentAnalysis, profile: AgentPersonality): number {
    // Multi-dimensional scoring based on agent output quality
    const dimensions = {
      confidence: analysis.confidence * 0.25,
      evidenceStrength: this.evidenceStrengthToNumber(analysis.evidenceStrength) * 0.25,
      findingQuality: this.assessFindingQuality(analysis.findings) * 0.25,
      recommendationQuality: this.assessRecommendationQuality(analysis.recommendations) * 0.25
    };

    return Object.values(dimensions).reduce((sum, score) => sum + score, 0);
  }

  private calculateQualityMultiplier(
    analysis: AgentAnalysis,
    agentType: AgentType,
    weights: WeightingConfiguration
  ): number {
    const threshold = weights.qualityThresholds.find(t => t.agentType === agentType);
    if (!threshold) return 1.0;

    let multiplier = 1.0;

    // Confidence penalty
    if (analysis.confidence < threshold.minimumConfidence) {
      const deficit = threshold.minimumConfidence - analysis.confidence;
      multiplier *= (1 - deficit * 0.5);
    }

    // Evidence strength penalty
    const evidenceNumber = this.evidenceStrengthToNumber(analysis.evidenceStrength);
    const thresholdNumber = this.evidenceStrengthToNumber(threshold.minimumEvidenceStrength);
    
    if (evidenceNumber < thresholdNumber) {
      multiplier *= threshold.penaltyFactor;
    }

    return Math.max(multiplier, 0.3); // Minimum 30% of score
  }

  private getContributionWeight(agentType: AgentType, weights: WeightingConfiguration): number {
    switch (agentType) {
      case 'CHALLENGE': return weights.challengeWeight;
      case 'EVIDENCE': return weights.evidenceWeight;
      case 'RISK': return weights.riskWeight;
      case 'JUDGE': return weights.judgeWeight;
      default: return 0;
    }
  }

  private calculateAdjustmentFactors(
    analysis: AgentAnalysis,
    profile: AgentPersonality,
    result: AgentResult
  ): AdjustmentFactor[] {
    const factors: AdjustmentFactor[] = [];

    // Expertise bonus
    if (this.isInExpertiseDomain(analysis.findings, profile)) {
      factors.push({
        type: 'EXPERTISE_BONUS',
        magnitude: 0.1,
        justification: 'Analysis in agent\'s primary expertise domain'
      });
    }

    // Bias correction
    const biasCorrection = this.calculateBiasCorrection(analysis, profile);
    if (biasCorrection !== 0) {
      factors.push({
        type: 'BIAS_CORRECTION',
        magnitude: biasCorrection,
        justification: 'Adjustment for known cognitive biases'
      });
    }

    // Performance adjustment based on execution time
    if (result.executionTime < 30000) { // Under 30 seconds
      factors.push({
        type: 'PERFORMANCE_HISTORY',
        magnitude: 0.05,
        justification: 'Efficient analysis completion'
      });
    }

    return factors;
  }

  private calculateConsensusMetrics(agentResults: AgentResult[]): ConsensusMetrics {
    const validResults = agentResults.filter(r => r.status === 'COMPLETED' && r.result);
    
    if (validResults.length < 2) {
      return {
        agreement: 1.0,
        variance: 0.0,
        convergence: 1.0,
        stability: 1.0,
        polarization: 0.0
      };
    }

    const scores = validResults.map(r => r.result!.confidence);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Calculate pairwise agreements
    let totalAgreement = 0;
    let pairCount = 0;
    
    for (let i = 0; i < validResults.length; i++) {
      for (let j = i + 1; j < validResults.length; j++) {
        const agreement = this.calculatePairwiseAgreement(
          validResults[i].result!,
          validResults[j].result!
        );
        totalAgreement += agreement;
        pairCount++;
      }
    }
    
    const agreement = pairCount > 0 ? totalAgreement / pairCount : 1.0;
    const convergence = 1 - Math.sqrt(variance);
    const stability = this.calculateStability(validResults);
    const polarization = this.calculatePolarization(scores);

    return {
      agreement,
      variance,
      convergence,
      stability,
      polarization
    };
  }

  private calculateOverallScore(
    agentScores: Record<AgentType, AgentScore>,
    weights: WeightingConfiguration
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(agentScores).forEach(([agentType, score]) => {
      const weight = this.getContributionWeight(agentType as AgentType, weights);
      totalScore += score.weightedScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private calculateConfidenceInterval(
    agentScores: Record<AgentType, AgentScore>,
    consensusMetrics: ConsensusMetrics
  ): ConfidenceInterval {
    const scores = Object.values(agentScores).map(s => s.weightedScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const stdDev = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length);
    
    // Adjust interval width based on consensus
    const consensusAdjustment = (1 - consensusMetrics.agreement) * 2;
    const marginOfError = (1.96 * stdDev) + consensusAdjustment; // 95% confidence
    
    return {
      lower: Math.max(0, mean - marginOfError),
      upper: Math.min(1, mean + marginOfError),
      width: marginOfError * 2,
      confidence: 0.95
    };
  }

  private assessQuality(
    agentResults: AgentResult[],
    agentScores: Record<AgentType, AgentScore>
  ): QualityAssessment {
    const dataQuality = this.assessDataQuality(agentResults);
    const analysisDepth = this.assessAnalysisDepth(agentResults);
    const methodologicalRigor = this.assessMethodologicalRigor(agentResults);
    const evidenceSupport = this.assessEvidenceSupport(agentResults);
    
    const overallQuality = (dataQuality + analysisDepth + methodologicalRigor + evidenceSupport) / 4;

    return {
      dataQuality,
      analysisDepth,
      methodologicalRigor,
      evidenceSupport,
      overallQuality
    };
  }

  private generateWeightedRecommendation(
    agentResults: AgentResult[],
    agentScores: Record<AgentType, AgentScore>,
    overallScore: number
  ): WeightedRecommendation {
    // Aggregate recommendations from all agents
    const allRecommendations = agentResults
      .filter(r => r.result?.recommendations)
      .flatMap(r => r.result!.recommendations.map(rec => ({
        recommendation: rec,
        agent: r.agentType,
        weight: agentScores[r.agentType]?.contributionWeight || 0
      })));

    // Find primary recommendation based on weighted voting
    const recommendationCounts = new Map<RecommendationType, number>();
    
    allRecommendations.forEach(({ recommendation, weight }) => {
      const current = recommendationCounts.get(recommendation.type) || 0;
      recommendationCounts.set(recommendation.type, current + weight);
    });

    const primaryRecommendation = Array.from(recommendationCounts.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'INVESTIGATE_FURTHER';

    // Calculate confidence based on consensus and scores
    const confidence = this.calculateRecommendationConfidence(
      recommendationCounts,
      agentScores,
      overallScore
    );

    // Generate supporting evidence
    const supportingEvidence = this.generateSupportingEvidence(agentResults, agentScores);

    // Generate alternative scenarios
    const alternativeScenarios = this.generateAlternativeScenarios(
      agentResults,
      recommendationCounts
    );

    // Extract weighted risk factors
    const riskFactors = this.extractWeightedRiskFactors(agentResults, agentScores);

    return {
      primaryRecommendation,
      confidence,
      supportingEvidence,
      alternativeScenarios,
      riskFactors
    };
  }

  // Helper methods
  private evidenceStrengthToNumber(strength: EvidenceStrength): number {
    const mapping = { WEAK: 0.25, MODERATE: 0.5, STRONG: 0.75, VERY_STRONG: 1.0 };
    return mapping[strength];
  }

  private assessFindingQuality(findings: Finding[]): number {
    if (findings.length === 0) return 0;
    
    const qualityScore = findings.reduce((sum, finding) => {
      let score = 0.5; // Base score
      
      // Evidence quality
      if (finding.evidence.length > 0) score += 0.2;
      if (finding.evidence.some(e => e.reliability === 'HIGHLY_RELIABLE')) score += 0.1;
      
      // Impact assessment
      if (finding.impact !== 'MINIMAL') score += 0.1;
      
      // Likelihood assessment
      if (finding.likelihood !== 'UNLIKELY') score += 0.1;
      
      return sum + score;
    }, 0);
    
    return qualityScore / findings.length;
  }

  private assessRecommendationQuality(recommendations: Recommendation[]): number {
    if (recommendations.length === 0) return 0.5;
    
    const qualityScore = recommendations.reduce((sum, rec) => {
      let score = 0.5; // Base score
      
      // Action items
      if (rec.actionItems.length > 0) score += 0.2;
      
      // Timeline specified
      if (rec.timeline !== 'IMMEDIATE') score += 0.1;
      
      // Effort estimation
      if (rec.estimatedEffort !== 'LOW') score += 0.1;
      
      // Priority
      if (rec.priority === 'HIGH' || rec.priority === 'URGENT') score += 0.1;
      
      return sum + score;
    }, 0);
    
    return qualityScore / recommendations.length;
  }

  private countUniqueCategories(agentResults: AgentResult[]): number {
    const categories = new Set();
    agentResults.forEach(result => {
      result.result?.findings.forEach(finding => {
        categories.add(finding.category);
      });
    });
    return categories.size;
  }

  private assessRiskLevel(agentResults: AgentResult[]): number {
    const riskResult = agentResults.find(r => r.agentType === 'RISK');
    if (!riskResult?.result) return 0.5;
    
    const highSeverityFindings = riskResult.result.findings.filter(
      f => f.severity === 'HIGH' || f.severity === 'CRITICAL'
    ).length;
    
    return highSeverityFindings / Math.max(1, riskResult.result.findings.length);
  }

  private isInExpertiseDomain(findings: Finding[], profile: AgentPersonality): boolean {
    return findings.some(finding => 
      profile.expertise.primaryDomains.includes(finding.category)
    );
  }

  private calculateBiasCorrection(analysis: AgentAnalysis, profile: AgentPersonality): number {
    // Apply bias corrections based on agent personality
    let correction = 0;
    
    profile.biases.forEach(bias => {
      switch (bias.name) {
        case 'Pessimism Bias':
          if (analysis.confidence < 0.5) correction -= 0.05;
          break;
        case 'Confirmation Bias (Inverted)':
          if (analysis.evidenceStrength === 'WEAK') correction -= 0.03;
          break;
        default:
          break;
      }
    });
    
    return correction;
  }

  private calculatePairwiseAgreement(analysis1: AgentAnalysis, analysis2: AgentAnalysis): number {
    const confidenceAgreement = 1 - Math.abs(analysis1.confidence - analysis2.confidence);
    const evidenceAgreement = this.compareEvidenceStrength(
      analysis1.evidenceStrength,
      analysis2.evidenceStrength
    );
    
    return (confidenceAgreement + evidenceAgreement) / 2;
  }

  private compareEvidenceStrength(strength1: EvidenceStrength, strength2: EvidenceStrength): number {
    const diff = Math.abs(
      this.evidenceStrengthToNumber(strength1) - this.evidenceStrengthToNumber(strength2)
    );
    return 1 - diff;
  }

  private calculateStability(results: AgentResult[]): number {
    // Simplified stability calculation based on execution consistency
    const executionTimes = results.map(r => r.executionTime);
    const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const variance = executionTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / executionTimes.length;
    
    return 1 - Math.min(1, Math.sqrt(variance) / avgTime);
  }

  private calculatePolarization(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const sorted = scores.sort((a, b) => a - b);
    const range = sorted[sorted.length - 1] - sorted[0];
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Measure how far scores are from median relative to range
    const deviations = scores.map(score => Math.abs(score - median));
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    
    return range > 0 ? avgDeviation / range : 0;
  }

  private assessDataQuality(results: AgentResult[]): number {
    // Assess based on metadata and analysis completeness
    const qualityScores = results.map(result => {
      if (!result.result) return 0;
      
      let score = 0.5; // Base score
      
      // Evidence quality
      const evidenceCount = result.result.findings.reduce((sum, f) => sum + f.evidence.length, 0);
      if (evidenceCount > 0) score += 0.3;
      
      // Processing metadata
      if (result.result.metadata.dataQuality === 'GOOD' || result.result.metadata.dataQuality === 'EXCELLENT') {
        score += 0.2;
      }
      
      return score;
    });
    
    return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  }

  private assessAnalysisDepth(results: AgentResult[]): number {
    const depthScores = results.map(result => {
      if (!result.result) return 0;
      
      const findingCount = result.result.findings.length;
      const recommendationCount = result.result.recommendations.length;
      
      // Normalize based on expected output volume
      return Math.min(1, (findingCount * 0.1 + recommendationCount * 0.2));
    });
    
    return depthScores.reduce((sum, score) => sum + score, 0) / depthScores.length;
  }

  private assessMethodologicalRigor(results: AgentResult[]): number {
    // Assess based on agent profiles and execution patterns
    return results.reduce((sum, result) => {
      const profile = AGENT_PROFILES[result.agentType];
      const methodologyCount = profile.expertise.methodologies.length;
      const rigorScore = Math.min(1, methodologyCount * 0.2 + 0.4);
      
      return sum + rigorScore;
    }, 0) / results.length;
  }

  private assessEvidenceSupport(results: AgentResult[]): number {
    const evidenceScores = results.map(result => {
      if (!result.result) return 0;
      
      const totalEvidence = result.result.findings.reduce((sum, f) => sum + f.evidence.length, 0);
      const highQualityEvidence = result.result.findings.reduce((sum, f) => {
        return sum + f.evidence.filter(e => e.reliability === 'HIGHLY_RELIABLE' || e.reliability === 'RELIABLE').length;
      }, 0);
      
      return totalEvidence > 0 ? highQualityEvidence / totalEvidence : 0;
    });
    
    return evidenceScores.reduce((sum, score) => sum + score, 0) / evidenceScores.length;
  }

  private calculateRecommendationConfidence(
    recommendationCounts: Map<RecommendationType, number>,
    agentScores: Record<AgentType, AgentScore>,
    overallScore: number
  ): number {
    const totalWeight = Array.from(recommendationCounts.values()).reduce((sum, weight) => sum + weight, 0);
    const maxWeight = Math.max(...Array.from(recommendationCounts.values()));
    
    const consensus = totalWeight > 0 ? maxWeight / totalWeight : 0;
    const qualityFactor = Object.values(agentScores).reduce((sum, score) => sum + score.qualityMultiplier, 0) / Object.keys(agentScores).length;
    
    return (consensus * 0.5 + overallScore * 0.3 + qualityFactor * 0.2);
  }

  private generateSupportingEvidence(
    results: AgentResult[],
    agentScores: Record<AgentType, AgentScore>
  ): SupportingEvidence[] {
    return results
      .filter(r => r.result)
      .map(r => ({
        source: r.agentType,
        strength: r.result!.evidenceStrength,
        weight: agentScores[r.agentType]?.contributionWeight || 0,
        description: r.result!.summary
      }));
  }

  private generateAlternativeScenarios(
    results: AgentResult[],
    recommendationCounts: Map<RecommendationType, number>
  ): AlternativeScenario[] {
    const scenarios: AlternativeScenario[] = [];
    
    Array.from(recommendationCounts.entries()).forEach(([recommendation, weight]) => {
      const supportingAgents = results
        .filter(r => r.result?.recommendations.some(rec => rec.type === recommendation))
        .map(r => r.agentType);
      
      if (supportingAgents.length > 0) {
        scenarios.push({
          scenario: `${recommendation} pathway`,
          probability: weight / Array.from(recommendationCounts.values()).reduce((sum, w) => sum + w, 0),
          recommendation,
          supportingAgents
        });
      }
    });
    
    return scenarios.sort((a, b) => b.probability - a.probability);
  }

  private extractWeightedRiskFactors(
    results: AgentResult[],
    agentScores: Record<AgentType, AgentScore>
  ): WeightedRiskFactor[] {
    const riskResult = results.find(r => r.agentType === 'RISK');
    if (!riskResult?.result) return [];
    
    return riskResult.result.findings.map(finding => ({
      factor: finding.title,
      severity: finding.severity,
      probability: this.likelihoodToNumber(finding.likelihood),
      impact: finding.impact,
      weight: agentScores.RISK?.contributionWeight || 0.3,
      mitigation: finding.recommendation || 'No specific mitigation provided'
    }));
  }

  private likelihoodToNumber(likelihood: Likelihood): number {
    const mapping = { UNLIKELY: 0.2, POSSIBLE: 0.4, LIKELY: 0.7, HIGHLY_LIKELY: 0.9 };
    return mapping[likelihood];
  }
}

// Export default weighting configuration and singleton engine
export const defaultWeightingConfig: WeightingConfiguration = {
  challengeWeight: 0.30,
  evidenceWeight: 0.40,
  riskWeight: 0.30,
  judgeWeight: 0.0,
  contextualAdjustments: [],
  qualityThresholds: []
};

export const weightedScoringEngine = new WeightedScoringEngine();