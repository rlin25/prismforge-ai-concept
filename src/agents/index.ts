/**
 * PrismForge AI Agent System - Main Export Module
 * Provides unified access to all agent-related functionality including
 * personality profiles, conflict resolution, and weighted scoring systems
 */

// Agent Personality and Expertise Definitions
export {
  // Types and Interfaces
  type AgentPersonality,
  type CognitiveStyle,
  type CommunicationStyle,
  type DecisionMakingPattern,
  type ExpertiseProfile,
  type CognitiveBias,
  type StressResponse,
  type AgentDecisionTree,
  type DecisionScenario,
  type EscalationTrigger,
  type CollaborationRule,
  
  // Enums
  type ThinkingPattern,
  type InformationProcessing,
  type AttentionFocus,
  type RiskTolerance,
  type TimeOrientation,
  type ComplexityHandling,
  type CommunicationTone,
  type DirectnessLevel,
  type QuestioningStyle,
  type PersuasionMethod,
  type ConflictApproach,
  type DecisionFramework,
  type CriteriaWeighting,
  type UncertaintyHandling,
  type InformationRequirement,
  type TimePreference,
  type ExperienceLevel,
  type BiasImpact,
  type PerformanceImpact,
  type InformationSharingLevel,
  
  // Agent Profiles
  CHALLENGE_AGENT_PROFILE,
  EVIDENCE_AGENT_PROFILE,
  RISK_AGENT_PROFILE,
  JUDGE_AGENT_PROFILE,
  AGENT_PROFILES,
  AGENT_DECISION_TREES
} from './agent-profiles';

// Conflict Resolution System
export {
  // Types and Interfaces
  type ConflictAnalysis,
  type DetectedConflict,
  type ConflictEvidenceAssessment,
  type EvidenceQuality,
  type DataPointConflict,
  type StakeholderImpact,
  type ResolutionStrategy,
  type TimeAllocation,
  type SuccessCriteria,
  type RefinedPrompt,
  type CollaborationInstruction,
  
  // Enums
  type CriticalityLevel,
  type ResolutionComplexity,
  type DataResolutionMethod,
  type ImpactLevel,
  type PromptRefinementStrategy,
  type InteractionType,
  
  // Main Class
  ConflictDetector,
  conflictDetector
} from './conflict-resolution';

// Weighted Scoring and Consensus
export {
  // Types and Interfaces
  type WeightingConfiguration,
  type ContextualAdjustment,
  type WeightingCondition,
  type QualityThreshold,
  type ScoringResult,
  type AgentScore,
  type AdjustmentFactor,
  type ConsensusMetrics,
  type ConfidenceInterval,
  type QualityAssessment,
  type WeightedRecommendation,
  type SupportingEvidence,
  type AlternativeScenario,
  type WeightedRiskFactor,
  
  // Enums
  type ConditionType,
  type AdjustmentType,
  
  // Main Class and Configuration
  WeightedScoringEngine,
  defaultWeightingConfig,
  weightedScoringEngine
} from './scoring-weights';

// Agent System Constants
export const AGENT_SYSTEM_CONFIG = {
  // Core weighting scheme as specified
  WEIGHTS: {
    CHALLENGE: 0.30,  // 30% - McKinsey skeptic
    EVIDENCE: 0.40,   // 40% - Big 4 auditor  
    RISK: 0.30,       // 30% - Investment committee
    JUDGE: 0.0        // Synthesis role with weighted input
  },
  
  // Consensus thresholds
  CONSENSUS_THRESHOLD: 0.70,
  DISAGREEMENT_THRESHOLD: 0.50,
  
  // Quality requirements
  MIN_CONFIDENCE: 0.60,
  MIN_EVIDENCE_STRENGTH: 'MODERATE' as const,
  
  // Timing constraints
  MAX_ANALYSIS_TIME: 300000,      // 5 minutes per agent
  MAX_CONSENSUS_TIME: 600000,     // 10 minutes total
  SECOND_ROUND_TIME: 900000       // 15 minutes for conflict resolution
} as const;

// Agent Role Descriptions
export const AGENT_ROLE_DESCRIPTIONS = {
  CHALLENGE: {
    archetype: 'McKinsey Principal - The Devil\'s Advocate',
    primaryFunction: 'Questions assumptions and identifies strategic gaps',
    keyBehaviors: [
      'Challenges optimistic projections with market reality',
      'Demands rigorous validation of strategic rationale',
      'Identifies potential blind spots and weaknesses',
      'Applies red team thinking to stress-test proposals'
    ],
    expertise: ['Strategic analysis', 'Market dynamics', 'Competitive assessment', 'Assumption testing']
  },
  
  EVIDENCE: {
    archetype: 'Big 4 Senior Manager - The Forensic Auditor',
    primaryFunction: 'Validates claims against hard data and documentation',
    keyBehaviors: [
      'Demands supporting documentation for all claims',
      'Performs forensic analysis of financial statements',
      'Validates data quality and source reliability',
      'Ensures compliance with auditing standards'
    ],
    expertise: ['Financial analysis', 'Data validation', 'Forensic accounting', 'Risk assessment']
  },
  
  RISK: {
    archetype: 'Investment Committee Member - The Risk Manager',
    primaryFunction: 'Identifies implementation barriers and risk factors',
    keyBehaviors: [
      'Develops comprehensive risk mitigation strategies',
      'Performs scenario planning and stress testing',
      'Assesses operational and market risks',
      'Recommends protective provisions and safeguards'
    ],
    expertise: ['Risk management', 'Scenario planning', 'Implementation planning', 'Portfolio management']
  },
  
  JUDGE: {
    archetype: 'Senior Partner - The Synthesizer',
    primaryFunction: 'Synthesizes perspectives with weighted scoring framework',
    keyBehaviors: [
      'Weighs inputs according to agent expertise (Challenge: 30%, Evidence: 40%, Risk: 30%)',
      'Resolves conflicts through structured mediation',
      'Balances competing stakeholder interests',
      'Provides final synthesis and recommendations'
    ],
    expertise: ['Decision synthesis', 'Stakeholder management', 'Conflict resolution', 'Strategic judgment']
  }
} as const;

// System Behavior Patterns
export const SYSTEM_BEHAVIOR_PATTERNS = {
  // When agents disagree by >50%
  CONFLICT_TRIGGERS: [
    'Severity assessment disagreements',
    'Evidence interpretation conflicts', 
    'Recommendation contradictions',
    'Impact evaluation differences'
  ],
  
  // Second round refinement strategies
  REFINEMENT_APPROACHES: {
    CHALLENGE: 'Enhanced assumption testing with alternative scenarios',
    EVIDENCE: 'Additional data validation and source verification',
    RISK: 'Deeper risk modeling with expanded mitigation strategies',
    JUDGE: 'Structured mediation with stakeholder impact analysis'
  },
  
  // Escalation pathways
  ESCALATION_RULES: [
    'Critical conflicts require human oversight',
    'Deadlocks trigger external expert consultation',
    'Time constraints may override consensus requirements',
    'Quality thresholds must be maintained regardless of pressure'
  ]
} as const;