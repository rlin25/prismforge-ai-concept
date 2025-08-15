/**
 * Core TypeScript types and interfaces for PrismForge AI
 * Multi-agent validation platform for M&A due diligence
 */

export interface Document {
  id: string;
  type: DocumentType;
  content: string;
  metadata: DocumentMetadata;
  uploadedAt: Date;
  processedAt?: Date;
}

export type DocumentType = 
  | 'CIM'           // Confidential Information Memorandum
  | 'FINANCIAL_MODEL'
  | 'LOI'           // Letter of Intent
  | 'SPA'           // Stock Purchase Agreement
  | 'DD_REPORT'     // Due Diligence Report
  | 'VALUATION'
  | 'PITCH_DECK'
  | 'MANAGEMENT_PRESENTATION';

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  pages?: number;
  language: string;
  industry?: IndustryType;
  dealValue?: number;
  dealStage?: DealStage;
}

export type IndustryType = 
  | 'SAAS'
  | 'MANUFACTURING' 
  | 'HEALTHCARE'
  | 'FINTECH'
  | 'RETAIL'
  | 'ENERGY'
  | 'REAL_ESTATE'
  | 'TECHNOLOGY'
  | 'OTHER';

export type DealStage = 
  | 'SOURCING'
  | 'INITIAL_REVIEW'
  | 'LOI_SIGNED'
  | 'DUE_DILIGENCE'
  | 'FINAL_NEGOTIATIONS'
  | 'CLOSING';

export interface AnalysisRequest {
  id: string;
  documentId: string;
  requestedBy: string;
  priority: Priority;
  configuration: AnalysisConfiguration;
  createdAt: Date;
  timeout: number;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface AnalysisConfiguration {
  agents: AgentConfiguration[];
  consensusThreshold: number;
  maxRetries: number;
  enableSecondRound: boolean;
  outputFormat: OutputFormat;
}

export type OutputFormat = 'MARKDOWN' | 'JSON' | 'PDF' | 'HTML';

export interface AgentConfiguration {
  type: AgentType;
  enabled: boolean;
  weight: number;
  timeout: number;
  customPrompts?: string[];
}

export type AgentType = 'CHALLENGE' | 'EVIDENCE' | 'RISK' | 'JUDGE';

export interface AgentResult {
  agentType: AgentType;
  documentId: string;
  status: AgentStatus;
  result?: AgentAnalysis;
  error?: AgentError;
  executionTime: number;
  retryCount: number;
  timestamp: Date;
}

export type AgentStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMEOUT'
  | 'CANCELLED';

export interface AgentAnalysis {
  summary: string;
  findings: Finding[];
  confidence: number;
  evidenceStrength: EvidenceStrength;
  recommendations: Recommendation[];
  metadata: AnalysisMetadata;
}

export type EvidenceStrength = 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  title: string;
  description: string;
  evidence: Evidence[];
  impact: Impact;
  likelihood: Likelihood;
  recommendation?: string;
}

export type FindingCategory = 
  | 'FINANCIAL'
  | 'OPERATIONAL' 
  | 'LEGAL'
  | 'REGULATORY'
  | 'MARKET'
  | 'TECHNOLOGY'
  | 'ESG'
  | 'STRATEGIC';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Impact = 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE';
export type Likelihood = 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'HIGHLY_LIKELY';

export interface Evidence {
  type: EvidenceType;
  source: string;
  content: string;
  reliability: Reliability;
  timestamp?: Date;
}

export type EvidenceType = 
  | 'FINANCIAL_DATA'
  | 'MARKET_DATA'
  | 'DOCUMENT_REFERENCE'
  | 'EXPERT_OPINION'
  | 'HISTORICAL_PRECEDENT'
  | 'REGULATORY_FILING';

export type Reliability = 'UNRELIABLE' | 'QUESTIONABLE' | 'RELIABLE' | 'HIGHLY_RELIABLE';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: Priority;
  title: string;
  description: string;
  actionItems: ActionItem[];
  estimatedEffort: EffortLevel;
  timeline: Timeline;
}

export type RecommendationType = 
  | 'INVESTIGATE_FURTHER'
  | 'REQUEST_CLARIFICATION'
  | 'RENEGOTIATE_TERMS'
  | 'ADD_CONDITION'
  | 'REJECT_DEAL'
  | 'PROCEED_WITH_CAUTION'
  | 'APPROVE';

export interface ActionItem {
  description: string;
  assignee?: string;
  dueDate?: Date;
  status: ActionItemStatus;
}

export type ActionItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type EffortLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type Timeline = 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';

export interface AnalysisMetadata {
  processingTime: number;
  modelUsed: string;
  tokensUsed: number;
  cost: number;
  cacheHit: boolean;
  dataQuality: DataQuality;
}

export type DataQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface AgentError {
  code: ErrorCode;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
}

export type ErrorCode = 
  | 'TIMEOUT'
  | 'PARSING_ERROR'
  | 'INVALID_INPUT'
  | 'RATE_LIMIT'
  | 'MODEL_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'INSUFFICIENT_DATA';

export interface ValidationResult {
  id: string;
  documentId: string;
  agentResults: AgentResult[];
  consensus: ConsensusResult;
  finalAnalysis: FinalAnalysis;
  status: ValidationStatus;
  createdAt: Date;
  completedAt?: Date;
}

export type ValidationStatus = 
  | 'QUEUED'
  | 'PROCESSING'
  | 'CONSENSUS_CHECKING'
  | 'SECOND_ROUND'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ConsensusResult {
  level: number;
  agreement: AgentAgreement[];
  conflicts: Conflict[];
  requiresSecondRound: boolean;
}

export interface AgentAgreement {
  agents: AgentType[];
  finding: Finding;
  agreementLevel: number;
}

export interface Conflict {
  agents: AgentType[];
  finding: Finding;
  conflictType: ConflictType;
  resolution?: ConflictResolution;
}

export type ConflictType = 
  | 'SEVERITY_DISAGREEMENT'
  | 'EVIDENCE_INTERPRETATION'
  | 'RECOMMENDATION_DIFFERENCE'
  | 'IMPACT_ASSESSMENT';

export interface ConflictResolution {
  method: ResolutionMethod;
  winner: AgentType;
  justification: string;
}

export type ResolutionMethod = 
  | 'WEIGHTED_VOTING'
  | 'JUDGE_DECISION'
  | 'EVIDENCE_STRENGTH'
  | 'MAJORITY_RULE';

export interface FinalAnalysis {
  overallAssessment: OverallAssessment;
  keyFindings: Finding[];
  dealBreakers: Finding[];
  opportunities: Opportunity[];
  riskProfile: RiskProfile;
  recommendedActions: Recommendation[];
  executiveSummary: string;
  confidence: number;
}

export type OverallAssessment = 
  | 'STRONG_BUY'
  | 'BUY'
  | 'HOLD'
  | 'PASS'
  | 'STRONG_PASS';

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  description: string;
  potentialValue: number;
  realizationProbability: number;
  timeToRealization: Timeline;
}

export type OpportunityCategory = 
  | 'SYNERGIES'
  | 'MARKET_EXPANSION'
  | 'COST_REDUCTION'
  | 'REVENUE_ENHANCEMENT'
  | 'OPERATIONAL_IMPROVEMENT'
  | 'TECHNOLOGY_LEVERAGE';

export interface RiskProfile {
  overall: RiskLevel;
  categories: RiskCategoryAssessment[];
  mitigationStrategies: MitigationStrategy[];
}

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface RiskCategoryAssessment {
  category: FindingCategory;
  level: RiskLevel;
  keyRisks: Finding[];
}

export interface MitigationStrategy {
  risk: string;
  strategy: string;
  effectiveness: EffectivenessLevel;
  cost: CostLevel;
}

export type EffectivenessLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type CostLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface CacheEntry {
  key: string;
  documentHash: string;
  semanticVector?: number[];
  result: ValidationResult;
  ttl: number;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface SystemMetrics {
  totalAnalyses: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  agentSuccessRates: Record<AgentType, number>;
  errorRates: Record<ErrorCode, number>;
  consensusRate: number;
  secondRoundTriggerRate: number;
}