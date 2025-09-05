// Phase 2 Multi-Agent Validation System Types
// PrismForge AI - Professional M&A Validation Platform

export interface ValidationRequest {
  sessionId: string;
  organizationId: string;
  userId: string;
  analysisObjectives: {
    primaryQuestion: string;
    strategicRationale?: string;
    focusAreas: string[];
    scope: string;
  };
  optimizedContext: {
    documentSummaries: string[];
    keyDataPoints: Record<string, any>;
    analysisScope: string;
    keyInsights: string[];
    identifiedRisks: string[];
    assumptions: string[];
  };
  contextMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ProfessionalValidationResult {
  executionId: string;
  sessionId: string;
  
  // Professional validation results
  executiveSummary: string;
  recommendation: 'proceed' | 'proceed_with_conditions' | 'do_not_proceed' | 'insufficient_information';
  confidenceScore: number; // 0-1
  professionalQualityScore: number; // Professional Quality Score ≥85%
  professionalStandardMet: boolean;
  
  // Agent results
  skepticAnalysis: SkepticAgentResult;
  validatorAnalysis: ValidatorAgentResult;
  synthesisAnalysis: SynthesisResult;
  
  // Professional deliverables
  professionalDeliverables: {
    executiveSummary: ProfessionalDeliverable;
    riskAnalysis: ProfessionalDeliverable;
    strategicAssessment: ProfessionalDeliverable;
    finalRecommendation: ProfessionalDeliverable;
    boardPresentation?: ProfessionalDeliverable;
  };
  
  // Execution metrics
  totalProcessingTime: number; // milliseconds
  tokenUsage: {
    skepticTokens: number;
    validatorTokens: number;
    synthesisTokens: number;
    totalTokens: number;
    budgetUtilization: number; // percentage of 80K budget used
  };
  
  // Professional value metrics
  costBreakdown: {
    professionalValidationValue: number; // $500 in cents
    tokenCosts: number;
    infrastructureCosts: number;
    totalCostCents: number;
  };
  
  // Quality assurance
  qualityValidation: ProfessionalQualityValidationResult;
  
  createdAt: string;
  completedAt: string;
}

export interface AgentExecutionResult {
  agentType: 'skeptic' | 'validator' | 'synthesis';
  executionOrder: number;
  
  // Professional analysis results
  findings: AgentFinding[];
  confidenceScore: number;
  professionalQualityScore: number;
  professionalStandardMet: boolean;
  
  // Token tracking
  tokenBudget: number;
  tokensUsed: number;
  tokensRemaining: number;
  
  // Execution metrics
  startTime: string;
  completionTime: string;
  processingTimeMs: number;
  
  // Context for next agent
  contextForNextAgent: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  
  // Error handling
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  retryCount: number;
}

export interface SkepticAgentResult extends AgentExecutionResult {
  agentType: 'skeptic';
  
  // Skeptical analysis specific results
  riskSummary: string;
  materialRisks: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impactAssessment: string;
    likelihood: 'low' | 'medium' | 'high';
    potentialDealBreaker: boolean;
    evidenceReferences: string[];
  }>;
  
  questionedAssumptions: Array<{
    assumption: string;
    concern: string;
    evidenceBasis: string;
    recommendedValidation: string;
    materialityLevel: 'low' | 'medium' | 'high';
  }>;
  
  blindSpots: Array<{
    area: string;
    concern: string;
    recommendedDueDiligence: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  
  // Professional skeptical methodology
  professionalFrameworksUsed: string[];
  riskQuantification: Array<{
    riskFactor: string;
    potentialImpactRange: string;
    probabilityAssessment: string;
  }>;
}

export interface ValidatorAgentResult extends AgentExecutionResult {
  agentType: 'validator';
  
  // Strategic validation results
  strategicRecommendation: string;
  valueCreationOpportunities: Array<{
    opportunity: string;
    description: string;
    quantifiedValue?: string;
    implementationComplexity: 'low' | 'medium' | 'high';
    timeframe: string;
    successFactors: string[];
  }>;
  
  synergyAnalysis: {
    revenueSynergies: Array<{
      source: string;
      description: string;
      estimatedValue?: string;
      timeframe: string;
      riskFactors: string[];
    }>;
    costSynergies: Array<{
      source: string;
      description: string;
      estimatedValue?: string;
      timeframe: string;
      implementationRequirements: string[];
    }>;
  };
  
  // Response to skeptic concerns
  skepticResponseAnalysis: Array<{
    skepticConcern: string;
    response: string;
    mitigationStrategy?: string;
    residualRisk: 'low' | 'medium' | 'high';
    evidenceSupport: string;
  }>;
  
  implementationRoadmap: Array<{
    phase: string;
    timeline: string;
    keyActivities: string[];
    successMetrics: string[];
    riskMitigation: string[];
  }>;
  
  // Professional strategic methodology
  strategicFrameworksUsed: string[];
  competitiveAnalysis: string;
  marketPositioning: string;
}

export interface SynthesisResult extends AgentExecutionResult {
  agentType: 'synthesis';
  
  // Final synthesis
  balancedAssessment: string;
  finalRecommendation: 'proceed' | 'proceed_with_conditions' | 'do_not_proceed' | 'insufficient_information';
  overallConfidenceScore: number;
  
  // Risk-opportunity balance
  riskAdjustedRecommendation: {
    primaryRecommendation: string;
    keyConditions: string[];
    criticalSuccessFactors: string[];
    dealBreakers: string[];
    monitoringRequirements: string[];
  };
  
  // Confidence assessment
  confidenceFactors: {
    dataQuality: number;
    analysisCompleteness: number;
    assumptionStrength: number;
    evidenceSupport: number;
    overallConfidence: number;
  };
  
  // Next steps
  immediateNextSteps: Array<{
    action: string;
    timeline: string;
    responsibleParty: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  
  // Professional synthesis methodology
  synthesisMethodology: string;
  qualityAssuranceChecks: string[];
}

export interface AgentFinding {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  evidenceReferences: string[];
  professionalImpact: string;
  actionRequired: boolean;
  recommendedActions?: string[];
}

export interface ProfessionalQualityValidationResult {
  // Overall Professional Quality Score (≥85% standard)
  professionalQualityScore: number;
  professionalStandardMet: boolean;
  
  // Quality dimensions
  professionalMethodologyScore: number;
  internalConsistencyScore: number;
  evidenceQualityScore: number;
  recommendationLogicScore: number;
  deliverableQualityScore: number;
  
  // Professional framework validation
  frameworksAssessed: Array<{
    framework: string;
    consistencyScore: number;
    professionalCompliance: boolean;
  }>;
  
  // Quality assurance results
  boardReadyQuality: boolean;
  investmentCommitteeStandard: boolean;
  corporateDevelopmentQuality: boolean;
  consultingDeliverableStandard: boolean;
  
  // Value delivery assessment
  valueDeliveryScore: number;
  professionalValueJustified: boolean; // For $500 validation
  
  // Quality improvement recommendations
  qualityImprovements?: string[];
  professionalEnhancements?: string[];
}

export interface ProfessionalDeliverable {
  type: 'executive_summary' | 'risk_analysis' | 'strategic_assessment' | 'final_recommendation' | 'board_presentation';
  title: string;
  content: string;
  formattedContent?: string; // HTML or markdown formatted
  
  // Professional quality metrics
  professionalQualityScore: number;
  wordCount: number;
  confidenceLevel: number;
  
  // Metadata
  generatedBy: 'skeptic_agent' | 'validator_agent' | 'synthesis_agent';
  generationTimeMs: number;
  professionalValue: number; // Value attribution in cents
  
  // Quality validation
  professionalStandard: boolean;
  boardReadyFormatting: boolean;
  executiveSuitability: boolean;
}

export interface AgentPrompt {
  systemPrompt: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  tokenBudget: number;
  professionalStandards: boolean;
}

export interface ProfessionalAgentStatusUpdate {
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentTask: string;
  professionalContext: boolean;
  
  // Professional quality indicators
  professionalQualityScore?: number;
  professionalStandardMet?: boolean;
  valueMessage?: string; // E.g., "$500 professional validation in progress"
  
  // Results when completed
  findings?: AgentFinding[];
  confidence?: number;
  processingTime?: number;
  
  // Error details when failed
  errorMessage?: string;
  recoveryOptions?: string[];
}

export interface TokenBudgetEnforcement {
  totalBudget: number; // 80,000 tokens
  agentBudgets: {
    skeptic: number; // 35,000 tokens
    validator: number; // 35,000 tokens
    synthesis: number; // 10,000 tokens
  };
  
  currentUsage: {
    skepticUsed: number;
    validatorUsed: number;
    synthesisUsed: number;
    totalUsed: number;
  };
  
  remainingBudget: {
    skepticRemaining: number;
    validatorRemaining: number;
    synthesisRemaining: number;
    totalRemaining: number;
  };
  
  budgetStatus: 'normal' | 'warning' | 'critical' | 'exceeded';
  professionalValueEfficiency: number; // Cost per professional validation
}

export interface ProfessionalBudgetEnforcementResult {
  approved: boolean;
  allocatedTokens: number;
  remainingAgentBudget: number;
  remainingTotalBudget: number;
  
  // Professional value metrics
  professionalValueDelivery: {
    efficiency: number;
    professionalQualityScore: number;
    professionalStandardMet: boolean;
    valueDelivered: number; // $500 in cents
    costPerToken: number;
  };
  
  qualityAssurance: boolean;
}

export class ProfessionalBudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfessionalBudgetExceededError';
  }
}

// Real-time updates for Phase 2 UI
export interface RealTimeAgentUpdate {
  type: 'professional_agent_status_update' | 'professional_validation_complete';
  executionId: string;
  agentType?: 'skeptic' | 'validator' | 'synthesis';
  
  // Professional context
  professionalContext: boolean;
  costValue: string; // "$500 professional validation per analysis"
  professionalQualityScore?: number;
  professionalStandardMet?: boolean;
  
  // Status details
  status?: 'processing' | 'completed' | 'failed';
  progress?: number;
  currentTask?: string;
  valueMessage?: string;
  
  // Results (when complete)
  result?: Partial<ProfessionalValidationResult>;
  
  timestamp: number;
}

// Analysis session status for database persistence
export interface AnalysisSessionStatus {
  id: string;
  executionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Professional validation details
  validationType: 'professional_multi_agent';
  professionalValueCents: number; // $500 per professional validation
  
  // Execution progress
  currentAgent?: 'skeptic' | 'validator' | 'synthesis';
  overallProgress: number; // 0-100
  
  // Quality metrics
  professionalQualityScore?: number;
  professionalStandardMet: boolean;
  
  // Timing
  startedAt?: string;
  completedAt?: string;
  totalProcessingTimeMs?: number;
  
  // Token usage
  totalTokensUsed: number;
  tokensRemaining: number;
  tokenBudget: number; // 80,000
}

// Professional quality validation service interfaces
export interface ProfessionalQualityMetrics {
  internalStandardsCompliance: number;
  frameworkConsistency: number;
  evidenceStrength: number;
  recommendationLogic: number;
  professionalLanguage: number;
  executiveSuitability: number;
  overallProfessionalQuality: number;
}

export interface ProfessionalStandardScore {
  averageConsistency: number;
  frameworkAlignment: Array<{
    framework: string;
    consistencyScore: number;
    professionalCompliance: boolean;
  }>;
  professionalCompliance: boolean;
  qualityAssurance: {
    boardReadiness: boolean;
    investmentCommitteeQuality: boolean;
    consultingStandard: boolean;
  };
}