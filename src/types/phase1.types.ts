// Phase 1 Document Processing and Chat Types
// PrismForge AI - Professional M&A Validation Platform

// Document Processing Types
export interface DocumentProcessor {
  processExcel(file: File): Promise<ExcelProcessingResult>;
  processPDF(file: File): Promise<PDFProcessingResult>;
  buildAnalysisContext(documents: ProcessedDocument[]): AnalysisContext;
  generateDocumentSummary(content: string, maxTokens: number): Promise<string>;
}

export interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'xlsx' | 'xls' | 'csv';
  fileSizeBytes: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData: Record<string, unknown>;
  documentSummary?: string;
  keyInsights: string[];
  classification?: string;
  tokenUsage: number;
  processingCostCents: number; // Always 0 for Phase 1
  organizationId: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExcelProcessingResult {
  sheets: ExcelSheet[];
  financialMetrics: ExtractedMetrics;
  dataStructure: DataStructureAnalysis;
  keyInsights: string[];
  tokenUsage: number;
  processingStatus: 'completed' | 'failed';
  errorMessage?: string;
}

export interface ExcelSheet {
  name: string;
  rowCount: number;
  columnCount: number;
  dataRanges: DataRange[];
  formulas: FormulaReference[];
  summary: string;
}

export interface DataRange {
  startCell: string;
  endCell: string;
  dataType: 'financial' | 'assumptions' | 'calculations' | 'other';
  description: string;
  keyMetrics: string[];
}

export interface FormulaReference {
  cell: string;
  formula: string;
  dependencies: string[];
  description?: string;
}

export interface ExtractedMetrics {
  revenue: MetricSeries;
  expenses: MetricSeries;
  profitability: MetricSeries;
  cashFlow: MetricSeries;
  valuation: ValuationMetrics;
  assumptions: KeyAssumption[];
}

export interface MetricSeries {
  label: string;
  values: number[];
  periods: string[];
  growthRates?: number[];
  unit: string;
  confidence: number;
}

export interface ValuationMetrics {
  enterprise_value?: number;
  equity_value?: number;
  multiples: ValuationMultiple[];
  dcf_assumptions?: DCFAssumptions;
}

export interface ValuationMultiple {
  type: string;
  value: number;
  benchmark?: number;
  explanation: string;
}

export interface DCFAssumptions {
  discount_rate: number;
  terminal_growth: number;
  forecast_years: number;
  key_drivers: string[];
}

export interface KeyAssumption {
  category: string;
  description: string;
  value: number | string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  source_reference?: string;
}

export interface DataStructureAnalysis {
  complexity_score: number;
  data_quality_score: number;
  completeness_percentage: number;
  identified_issues: string[];
  recommendations: string[];
}

export interface PDFProcessingResult {
  extractedText: string;
  documentType: 'financial_report' | 'presentation' | 'due_diligence' | 'market_research' | 'other';
  keyFindings: string[];
  pageCount: number;
  tokenUsage: number;
  processingStatus: 'completed' | 'failed';
  errorMessage?: string;
  classification: DocumentClassification;
}

export interface DocumentClassification {
  type: 'financial_report' | 'presentation' | 'due_diligence' | 'market_research' | 'other';
  confidence: number;
  keyTopics: string[];
  suggestedAnalysisAreas: string[];
}

// Chat System Types
export interface ChatSession {
  id: string;
  userId: string;
  organizationId: string;
  messages: ChatMessage[];
  documents: ProcessedDocument[];
  context: AnalysisContext;
  tokenUsage: TokenUsageTracking;
  costTracking: CostTrackingData;
  phase: '1' | '2';
  transitionReadiness: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    documentReferences?: string[];
    processingTime?: number;
    tokenCount?: number;
    apiCallId?: string;
  };
}

export interface AnalysisContext {
  documentSummaries: string[];
  userObjectives?: string;
  chatHistory: ChatMessage[];
  keyInsights: string[];
  identifiedRisks: string[];
  assumptionsFound: KeyAssumption[];
  analysisScope: string;
  focusAreas: string[];
}

// Token Budget Management
export interface TokenBudget {
  maxTokensPerSession: number; // 15,000 for Phase 1
  remainingTokens: number;
  usedTokens: number;
  inputTokens: number;
  outputTokens: number;
  costSoFar: number; // Always $0 for Phase 1
  warningThreshold: number; // 80% of budget
  hardStopThreshold: number; // 95% of budget
  budgetStatus: 'normal' | 'warning' | 'near_limit' | 'exceeded';
  canContinue: boolean;
}

export interface BudgetStatus {
  status: 'normal' | 'warning' | 'near_limit' | 'exceeded';
  remainingTokens: number;
  percentageUsed: number;
  estimatedCost: number; // Always $0 for Phase 1
  canContinue: boolean;
  warningMessage?: string;
}

export interface TokenUsageTracking {
  sessionId: string;
  totalTokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  tokenBudget: number;
  budgetStatus: 'normal' | 'warning' | 'near_limit' | 'exceeded';
  canContinue: boolean;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostTrackingData {
  totalCostCents: number; // Always 0 for Phase 1
  apiCalls: APICallRecord[];
  lastUpdated: string;
}

export interface APICallRecord {
  id: string;
  sessionId: string;
  messageId?: string;
  apiProvider: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costCents: number; // Always 0 for Phase 1
  responseTimeMs?: number;
  status: 'pending' | 'completed' | 'failed' | 'timeout';
  errorMessage?: string;
  requestTimestamp: string;
  responseTimestamp?: string;
  organizationId: string;
  userId: string;
}

// Claude API Integration
export interface ChatResponse {
  content: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
  };
  responseTime: number;
  apiCallId: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface ClaudeAPIRequest {
  model: string;
  maxTokens: number;
  temperature: number;
  system: string;
  messages: ClaudeMessage[];
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Context Optimization
export interface ContextOptimizer {
  optimize(context: AnalysisContext, budget: TokenBudget): Promise<OptimizedContext>;
  compressDocumentSummaries(summaries: string[], targetTokens: number): Promise<string[]>;
  prioritizeContext(context: AnalysisContext): PrioritizedContext;
}

export interface OptimizedContext {
  optimizedSummaries: string[];
  prioritizedInsights: string[];
  compressedHistory: ChatMessage[];
  tokenCount: number;
  compressionRatio: number;
  strategy: string;
  optimizationTimeMs: number;
}

export interface PrioritizedContext {
  criticalInsights: string[];
  importantAssumptions: KeyAssumption[];
  relevantHistory: ChatMessage[];
  priorityScore: number;
}

// Phase 2 Transition
export interface Phase2Transition {
  explorationSummary: {
    documentsAnalyzed: DocumentSummary[];
    keyInsightsDiscovered: string[];
    questionsRefined: string[];
    tokenUsage: number;
    timeSpent: number;
    costIncurred: 0; // Always $0 for Phase 1
  };
  validationProposition: {
    riskAreas: IdentifiedRisk[];
    assumptionsToChallenge: KeyAssumption[];
    strategicQuestions: string[];
    professionalDeliverables: DeliverablePreview[];
  };
  validationOptions: {
    professionalValidation: {
      price: 500;
      description: string;
      timeEstimate: string;
      deliverables: string[];
      professionalQualityScore: string;
    };
  };
}

export interface DocumentSummary {
  fileName: string;
  fileType: string;
  keyMetrics: string[];
  insights: string[];
  processingTime: number;
}

export interface IdentifiedRisk {
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendedValidation: string;
}

export interface DeliverablePreview {
  title: string;
  description: string;
  format: string;
  professionalFeatures: string[];
}

export interface ContextHandoff {
  documentMetadata: DocumentMetadata[];
  analysisObjectives: {
    primaryQuestion: string;
    secondaryQuestions: string[];
    focusAreas: string[];
    riskTolerance: string;
  };
  preliminaryInsights: {
    keyFindings: string[];
    identifiedRisks: string[];
    assumptionsFound: string[];
    recommendedFocus: string[];
  };
  optimizedContext: {
    documentSummaries: string[];
    analysisScope: string;
    keyDataPoints: DataPoint[];
    maxTokens: number; // Prepared for Phase 2 budget (80K total)
  };
}

export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileType: string;
  summary: string;
  keyMetrics: string[];
  uploadTimestamp: string;
}

export interface DataPoint {
  category: string;
  value: number | string;
  unit?: string;
  confidence: number;
  source: string;
  relevance: 'high' | 'medium' | 'low';
}

// Error Handling
export interface ProcessingError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  suggestedAction?: string;
}

export interface FileProcessingError extends ProcessingError {
  fileName: string;
  fileType: string;
  processingStage: 'upload' | 'parsing' | 'analysis' | 'summarization';
}

// Conversation Flow Types
export interface ConversationFlow {
  documentProcessingComplete: {
    message: string;
    documentsProcessed: ProcessedDocument[];
    suggestedQuestions: string[];
    nextSteps: string[];
  };
  documentExploration: {
    userQuestion: string;
    aiResponse: string;
    documentReferences: DocumentReference[];
    followUpSuggestions: string[];
  };
  validationReadiness: {
    contextSummary: string;
    identifiedGaps: AnalysisGap[];
    recommendedValidation: ValidationRecommendation;
  };
}

export interface DocumentReference {
  documentId: string;
  fileName: string;
  relevantSection?: string;
  confidence: number;
}

export interface AnalysisGap {
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  addressableInPhase2: boolean;
}

export interface ValidationRecommendation {
  recommendationLevel: 'essential' | 'recommended' | 'optional';
  focusAreas: string[];
  expectedOutcomes: string[];
  estimatedValue: string;
  riskMitigation: string[];
}

// Phase 2 Readiness Assessment
export interface Phase2ReadinessAssessment {
  isReady: boolean;
  readinessScore: number; // 0-1 scale
  documentsProcessed: number;
  keyInsightsIdentified: number;
  questionsRefined: number;
  contextCompletenessScore: number;
  contextSummary: string;
  analysisObjectives: Record<string, unknown>;
  preliminaryInsights: string[];
  identifiedRisks: string[];
  optimizedContextTokens: number;
  phase2Context: Record<string, unknown>;
}

// Professional Constants
export const PHASE1_CONFIG = {
  MAX_TOKENS_PER_SESSION: 15000,
  WARNING_THRESHOLD: 12000, // 80%
  HARD_STOP_THRESHOLD: 14250, // 95%
  COST_PER_TOKEN: 0, // FREE for Phase 1
  PHASE2_COST_CENTS: 50000, // $500 per professional validation
  PROFESSIONAL_QUALITY_THRESHOLD: 0.85,
  SUPPORTED_FILE_TYPES: ['pdf', 'xlsx', 'xls', 'csv'],
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
} as const;