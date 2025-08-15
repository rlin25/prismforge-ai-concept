/**
 * Red Flag Detection Framework for M&A Due Diligence
 * Automated detection of concerning patterns in financial data, projections, and business metrics
 */

import { FinancialMetrics, EbitdaAddBack } from './financial-terms';

/**
 * Overall red flag assessment result
 */
export interface RedFlagAssessment {
  /** Overall risk score (0-100, higher is more risky) */
  overallRiskScore: number;
  /** Total number of red flags detected */
  totalRedFlags: number;
  /** Red flags by category */
  categorizedFlags: CategorizedRedFlags;
  /** Critical red flags requiring immediate attention */
  criticalFlags: RedFlag[];
  /** Priority ranking of all flags */
  prioritizedFlags: RedFlag[];
  /** Risk mitigation recommendations */
  mitigationRecommendations: string[];
}

/**
 * Red flags organized by category
 */
export interface CategorizedRedFlags {
  /** Financial red flags */
  financial: RedFlag[];
  /** Operational red flags */
  operational: RedFlag[];
  /** Market/customer red flags */
  market: RedFlag[];
  /** Management red flags */
  management: RedFlag[];
  /** Legal/regulatory red flags */
  legal: RedFlag[];
  /** Quality of earnings red flags */
  qualityOfEarnings: RedFlag[];
}

/**
 * Individual red flag structure
 */
export interface RedFlag {
  /** Unique identifier */
  id: string;
  /** Red flag category */
  category: RedFlagCategory;
  /** Red flag type */
  type: RedFlagType;
  /** Severity level */
  severity: RedFlagSeverity;
  /** Risk score contribution (0-100) */
  riskScore: number;
  /** Title/name of the red flag */
  title: string;
  /** Detailed description */
  description: string;
  /** Supporting evidence/data */
  evidence: RedFlagEvidence[];
  /** Impact on valuation */
  valuationImpact: ValuationImpact;
  /** Recommended actions */
  recommendedActions: string[];
  /** Detection confidence (0-100) */
  confidence: number;
  /** Industry context relevance */
  industryRelevance: string[];
}

export type RedFlagCategory = 
  | 'FINANCIAL'
  | 'OPERATIONAL'
  | 'MARKET_CUSTOMER'
  | 'MANAGEMENT'
  | 'LEGAL_REGULATORY'
  | 'QUALITY_OF_EARNINGS'
  | 'STRATEGIC'
  | 'ESG';

export type RedFlagType = 
  | 'HOCKEY_STICK_PROJECTIONS'
  | 'EXCESSIVE_EBITDA_ADDBACKS'
  | 'CUSTOMER_CONCENTRATION'
  | 'REVENUE_QUALITY'
  | 'MARGIN_MANIPULATION'
  | 'WORKING_CAPITAL_ISSUES'
  | 'DEBT_COVENANT_RISK'
  | 'MANAGEMENT_TURNOVER'
  | 'RELATED_PARTY_TRANSACTIONS'
  | 'ACCOUNTING_IRREGULARITIES'
  | 'REGULATORY_VIOLATIONS'
  | 'COMPETITIVE_THREATS'
  | 'TECHNOLOGY_OBSOLESCENCE'
  | 'ESG_VIOLATIONS'
  | 'CHANNEL_STUFFING'
  | 'BILL_AND_HOLD'
  | 'ROUND_TRIP_TRANSACTIONS'
  | 'AGGRESSIVE_REVENUE_RECOGNITION'
  | 'RELATED_PARTY_REVENUE'
  | 'UNSUSTAINABLE_MARGINS';

export type RedFlagSeverity = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

/**
 * Evidence supporting a red flag
 */
export interface RedFlagEvidence {
  /** Type of evidence */
  type: EvidenceType;
  /** Data/metric value */
  value: number | string | boolean;
  /** Benchmark or threshold */
  benchmark?: number | string;
  /** Variance from benchmark */
  variance?: number;
  /** Supporting documentation */
  documentation?: string[];
  /** Time period of evidence */
  timePeriod?: string;
}

export type EvidenceType = 
  | 'FINANCIAL_METRIC'
  | 'RATIO_ANALYSIS'
  | 'TREND_ANALYSIS'
  | 'PEER_COMPARISON'
  | 'INDUSTRY_BENCHMARK'
  | 'HISTORICAL_PATTERN'
  | 'MANAGEMENT_STATEMENT'
  | 'THIRD_PARTY_DATA';

/**
 * Impact on company valuation
 */
export interface ValuationImpact {
  /** Type of impact */
  impactType: ValuationImpactType;
  /** Estimated impact on enterprise value */
  estimatedImpact: number;
  /** Impact as percentage of current valuation */
  impactPercentage: number;
  /** Range of potential impact */
  impactRange: {
    low: number;
    high: number;
  };
  /** Probability of impact occurring */
  probability: number;
}

export type ValuationImpactType = 
  | 'MULTIPLE_COMPRESSION'
  | 'REVENUE_REDUCTION'
  | 'MARGIN_COMPRESSION'
  | 'CASH_FLOW_REDUCTION'
  | 'RISK_PREMIUM_INCREASE'
  | 'TERMINAL_VALUE_REDUCTION'
  | 'DISCOUNT_RATE_INCREASE';

/**
 * Financial projection red flags
 */
export interface ProjectionRedFlags {
  /** Hockey stick growth patterns */
  hockeyStickGrowth: HockeyStickAnalysis;
  /** Unrealistic margin expansion */
  marginExpansion: MarginExpansionAnalysis;
  /** Aggressive cost reduction assumptions */
  costReduction: CostReductionAnalysis;
  /** Working capital assumptions */
  workingCapital: WorkingCapitalAnalysis;
  /** Capital expenditure assumptions */
  capexAssumptions: CapexAssumptionAnalysis;
}

/**
 * Hockey stick growth analysis
 */
export interface HockeyStickAnalysis {
  /** Whether hockey stick pattern detected */
  detected: boolean;
  /** Years where acceleration occurs */
  accelerationYears: number[];
  /** Growth rates by year */
  growthRates: number[];
  /** Average early years growth */
  earlyGrowth: number;
  /** Average later years growth */
  lateGrowth: number;
  /** Growth acceleration ratio */
  accelerationRatio: number;
  /** Justification provided */
  justification?: string;
  /** Industry growth context */
  industryContext: {
    industryGrowthRate: number;
    marketSizeGrowth: number;
    competitorGrowthRates: number[];
  };
}

/**
 * Margin expansion analysis
 */
export interface MarginExpansionAnalysis {
  /** Margin type being analyzed */
  marginType: 'GROSS' | 'EBITDA' | 'OPERATING' | 'NET';
  /** Starting margin */
  startingMargin: number;
  /** Ending margin */
  endingMargin: number;
  /** Total expansion */
  totalExpansion: number;
  /** Annual expansion rate */
  annualExpansion: number;
  /** Whether expansion is aggressive */
  isAggressive: boolean;
  /** Justification for expansion */
  justification?: string;
  /** Industry benchmark margins */
  industryBenchmarks: {
    median: number;
    p75: number;
    p90: number;
  };
}

/**
 * Cost reduction analysis
 */
export interface CostReductionAnalysis {
  /** Total cost reduction assumed */
  totalReduction: number;
  /** Cost reduction as % of revenue */
  reductionPercentage: number;
  /** Cost categories targeted */
  costCategories: CostCategory[];
  /** Implementation timeline */
  implementationTimeline: string;
  /** Historical precedent */
  historicalPrecedent?: string;
  /** Risk assessment */
  implementationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Cost category for reduction analysis
 */
export interface CostCategory {
  /** Category name */
  category: string;
  /** Current cost amount */
  currentCost: number;
  /** Targeted reduction */
  targetedReduction: number;
  /** Reduction percentage */
  reductionPercentage: number;
  /** Implementation difficulty */
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT';
}

/**
 * Working capital analysis
 */
export interface WorkingCapitalAnalysis {
  /** Current working capital as % of revenue */
  currentWCPercent: number;
  /** Projected working capital as % of revenue */
  projectedWCPercent: number;
  /** Improvement assumed */
  improvementAssumed: number;
  /** Whether improvement is realistic */
  isRealistic: boolean;
  /** Components driving change */
  drivingComponents: {
    daysPayableOutstanding: number;
    daysSalesOutstanding: number;
    daysInventoryOutstanding: number;
  };
  /** Industry benchmarks */
  industryBenchmarks: {
    median: number;
    bestInClass: number;
  };
}

/**
 * Capital expenditure assumption analysis
 */
export interface CapexAssumptionAnalysis {
  /** Capex as % of revenue - historical */
  historicalCapexPercent: number;
  /** Capex as % of revenue - projected */
  projectedCapexPercent: number;
  /** Difference from historical */
  deviationFromHistorical: number;
  /** Whether reduction is justified */
  reductionJustified: boolean;
  /** Business impact of reduced capex */
  businessImpact: string[];
  /** Industry capex requirements */
  industryRequirements: {
    maintenanceCapex: number;
    growthCapex: number;
  };
}

/**
 * Quality of earnings red flags
 */
export interface QualityOfEarningsFlags {
  /** Revenue quality issues */
  revenueQuality: RevenueQualityFlags;
  /** Expense management issues */
  expenseManagement: ExpenseManagementFlags;
  /** Balance sheet issues */
  balanceSheet: BalanceSheetFlags;
  /** Cash flow issues */
  cashFlow: CashFlowFlags;
}

/**
 * Revenue quality red flags
 */
export interface RevenueQualityFlags {
  /** Channel stuffing indicators */
  channelStuffing: ChannelStuffingIndicators;
  /** Bill and hold transactions */
  billAndHold: BillAndHoldIndicators;
  /** Related party revenue */
  relatedPartyRevenue: RelatedPartyRevenueAnalysis;
  /** Round trip transactions */
  roundTripTransactions: RoundTripAnalysis;
  /** Aggressive revenue recognition */
  aggressiveRecognition: AggressiveRecognitionFlags;
}

/**
 * Channel stuffing indicators
 */
export interface ChannelStuffingIndicators {
  /** DSO trend analysis */
  dsoTrend: {
    historicalDSO: number[];
    currentDSO: number;
    trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
    quarterEndSpikes: boolean;
  };
  /** Inventory vs sales growth */
  inventoryVsSales: {
    inventoryGrowth: number;
    salesGrowth: number;
    ratio: number;
    concerning: boolean;
  };
  /** Quarter-end patterns */
  quarterEndPatterns: {
    q1Revenue: number;
    q2Revenue: number;
    q3Revenue: number;
    q4Revenue: number;
    q4Concentration: number;
  };
}

/**
 * Bill and hold indicators
 */
export interface BillAndHoldIndicators {
  /** Revenue billed but not shipped */
  billedNotShipped: number;
  /** Percentage of total revenue */
  percentageOfRevenue: number;
  /** Customer acceptance required */
  customerAcceptanceRequired: boolean;
  /** Justification provided */
  justification?: string;
}

/**
 * Related party revenue analysis
 */
export interface RelatedPartyRevenueAnalysis {
  /** Total related party revenue */
  totalRelatedPartyRevenue: number;
  /** Percentage of total revenue */
  percentageOfRevenue: number;
  /** Nature of related party relationships */
  relationshipTypes: string[];
  /** Whether transactions are at arm's length */
  armsLength: boolean;
  /** Market rate comparison */
  marketRateComparison?: {
    relatedPartyRate: number;
    marketRate: number;
    variance: number;
  };
}

/**
 * Round trip transaction analysis
 */
export interface RoundTripAnalysis {
  /** Identified round trip transactions */
  identifiedTransactions: RoundTripTransaction[];
  /** Total value */
  totalValue: number;
  /** Impact on revenue */
  revenueImpact: number;
  /** Impact on margins */
  marginImpact: number;
}

/**
 * Individual round trip transaction
 */
export interface RoundTripTransaction {
  /** Transaction description */
  description: string;
  /** Amount */
  amount: number;
  /** Counterparty */
  counterparty: string;
  /** Time period */
  timePeriod: string;
  /** Business justification */
  justification?: string;
}

/**
 * Aggressive revenue recognition flags
 */
export interface AggressiveRecognitionFlags {
  /** Percentage of completion issues */
  percentageOfCompletion: {
    used: boolean;
    appropriateUsage: boolean;
    estimateChanges: boolean;
  };
  /** Multiple deliverable issues */
  multipleDeliverables: {
    complexArrangements: boolean;
    allocationMethodology: string;
    separateContracts: boolean;
  };
  /** Long-term contract issues */
  longTermContracts: {
    contractLength: number;
    changeOrderFrequency: number;
    scopeChanges: boolean;
  };
}

/**
 * EBITDA add-back analysis
 */
export interface EBITDAAddBackAnalysis {
  /** Total add-backs */
  totalAddBacks: number;
  /** Add-backs as percentage of EBITDA */
  addBackPercentage: number;
  /** Individual add-back analysis */
  addBackDetails: EBITDAAddBackDetail[];
  /** Reasonableness assessment */
  reasonablenessAssessment: AddBackReasonableness;
  /** Peer comparison */
  peerComparison: {
    industryMedian: number;
    industryP75: number;
    peerRange: [number, number];
  };
}

/**
 * Detailed EBITDA add-back analysis
 */
export interface EBITDAAddBackDetail {
  /** Add-back item */
  addBack: EbitdaAddBack;
  /** Reasonableness score (0-100) */
  reasonablenessScore: number;
  /** Red flag indicators */
  redFlags: string[];
  /** Supporting documentation quality */
  documentationQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  /** Recurrence likelihood */
  recurrenceLikelihood: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Add-back reasonableness assessment
 */
export interface AddBackReasonableness {
  /** Overall reasonableness score */
  overallScore: number;
  /** Concerning add-backs */
  concerningAddBacks: string[];
  /** Industry appropriateness */
  industryAppropriateness: number;
  /** Documentation completeness */
  documentationCompleteness: number;
  /** One-time nature validation */
  oneTimeValidation: number;
}

/**
 * Customer concentration analysis
 */
export interface CustomerConcentrationAnalysis {
  /** Top customer analysis */
  topCustomers: TopCustomerAnalysis;
  /** Concentration metrics */
  concentrationMetrics: ConcentrationMetrics;
  /** Risk assessment */
  riskAssessment: ConcentrationRiskAssessment;
  /** Mitigation factors */
  mitigationFactors: string[];
}

/**
 * Top customer analysis
 */
export interface TopCustomerAnalysis {
  /** Top 1 customer percentage */
  top1CustomerPercent: number;
  /** Top 3 customers percentage */
  top3CustomersPercent: number;
  /** Top 5 customers percentage */
  top5CustomersPercent: number;
  /** Top 10 customers percentage */
  top10CustomersPercent: number;
  /** Customer details */
  customerDetails: CustomerDetail[];
}

/**
 * Individual customer detail
 */
export interface CustomerDetail {
  /** Customer rank */
  rank: number;
  /** Revenue percentage */
  revenuePercentage: number;
  /** Relationship length */
  relationshipLength: number;
  /** Contract terms */
  contractTerms: {
    duration: number;
    terminationClause: boolean;
    exclusivity: boolean;
  };
  /** Customer credit quality */
  creditQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  /** Growth/decline trend */
  trend: 'GROWING' | 'STABLE' | 'DECLINING';
}

/**
 * Concentration metrics
 */
export interface ConcentrationMetrics {
  /** Herfindahl-Hirschman Index */
  hhi: number;
  /** Gini coefficient */
  giniCoefficient: number;
  /** Customer count for 80% of revenue */
  customers80Percent: number;
  /** New customer acquisition rate */
  newCustomerRate: number;
  /** Customer churn rate */
  churnRate: number;
}

/**
 * Concentration risk assessment
 */
export interface ConcentrationRiskAssessment {
  /** Overall risk level */
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Risk factors */
  riskFactors: string[];
  /** Industry context */
  industryContext: {
    typicalConcentration: number;
    industryRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  /** Potential revenue at risk */
  revenueAtRisk: {
    oneCustomerLoss: number;
    threeCustomerLoss: number;
    fiveCustomerLoss: number;
  };
}

/**
 * Working capital red flags
 */
export interface WorkingCapitalRedFlags {
  /** DSO deterioration */
  dsoDeterioriation: {
    historicalDSO: number;
    currentDSO: number;
    deterioration: number;
    concerningTrend: boolean;
  };
  /** Inventory buildup */
  inventoryBuildup: {
    inventoryTurnover: number;
    industryBenchmark: number;
    excessInventory: number;
    obsolescenceRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  /** Payables extension */
  payablesExtension: {
    dpo: number;
    industryBenchmark: number;
    supplierRelationshipRisk: boolean;
  };
}

/**
 * Management and governance red flags
 */
export interface ManagementRedFlags {
  /** Management turnover */
  managementTurnover: ManagementTurnoverAnalysis;
  /** Related party transactions */
  relatedPartyTransactions: RelatedPartyAnalysis;
  /** Compensation structure */
  compensationStructure: CompensationAnalysis;
  /** Corporate governance */
  corporateGovernance: GovernanceAnalysis;
}

/**
 * Management turnover analysis
 */
export interface ManagementTurnoverAnalysis {
  /** CEO tenure */
  ceoTenure: number;
  /** CFO tenure */
  cfoTenure: number;
  /** Executive team turnover rate */
  executiveTurnoverRate: number;
  /** Key departures in last 2 years */
  keyDepartures: ExecutiveDeparture[];
  /** Succession planning */
  successionPlanning: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

/**
 * Executive departure details
 */
export interface ExecutiveDeparture {
  /** Position */
  position: string;
  /** Departure date */
  departureDate: Date;
  /** Reason */
  reason: string;
  /** Replacement timeline */
  replacementTimeline: number;
  /** Impact on operations */
  operationalImpact: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Related party transaction analysis
 */
export interface RelatedPartyAnalysis {
  /** Total related party transactions */
  totalTransactions: number;
  /** Types of transactions */
  transactionTypes: RelatedPartyTransactionType[];
  /** Arms length assessment */
  armsLengthAssessment: ArmsLengthAssessment;
  /** Disclosure adequacy */
  disclosureAdequacy: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

/**
 * Related party transaction type
 */
export interface RelatedPartyTransactionType {
  /** Type */
  type: string;
  /** Amount */
  amount: number;
  /** Frequency */
  frequency: 'ONE_TIME' | 'OCCASIONAL' | 'REGULAR';
  /** Business justification */
  justification: string;
}

/**
 * Arms length assessment
 */
export interface ArmsLengthAssessment {
  /** Overall assessment */
  overall: 'ARMS_LENGTH' | 'QUESTIONABLE' | 'NOT_ARMS_LENGTH';
  /** Pricing comparison */
  pricingComparison: {
    marketRate: number;
    transactionRate: number;
    variance: number;
  };
  /** Terms comparison */
  termsComparison: string;
}

/**
 * Compensation analysis
 */
export interface CompensationAnalysis {
  /** Executive compensation level */
  compensationLevel: 'BELOW_MARKET' | 'MARKET' | 'ABOVE_MARKET' | 'EXCESSIVE';
  /** Compensation structure */
  structure: {
    baseSalary: number;
    bonus: number;
    equity: number;
    benefits: number;
  };
  /** Performance alignment */
  performanceAlignment: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  /** Peer comparison */
  peerComparison: {
    medianCompensation: number;
    companyCompensation: number;
    percentile: number;
  };
}

/**
 * Corporate governance analysis
 */
export interface GovernanceAnalysis {
  /** Board composition */
  boardComposition: {
    independentDirectors: number;
    totalDirectors: number;
    independencePercentage: number;
  };
  /** Audit committee */
  auditCommittee: {
    independent: boolean;
    financialExpertise: boolean;
    meetingFrequency: number;
  };
  /** Internal controls */
  internalControls: 'WEAK' | 'ADEQUATE' | 'STRONG' | 'EXCELLENT';
  /** Compliance record */
  complianceRecord: {
    violations: number;
    materialWeaknesses: number;
    restatements: number;
  };
}

/**
 * Market and competitive red flags
 */
export interface MarketRedFlags {
  /** Market share trends */
  marketShareTrends: MarketShareAnalysis;
  /** Competitive position */
  competitivePosition: CompetitiveAnalysis;
  /** Technology disruption risk */
  technologyDisruption: TechnologyDisruptionAnalysis;
  /** Regulatory changes */
  regulatoryChanges: RegulatoryChangeAnalysis;
}

/**
 * Market share analysis
 */
export interface MarketShareAnalysis {
  /** Current market share */
  currentMarketShare: number;
  /** Historical market share trend */
  historicalTrend: number[];
  /** Trend direction */
  trendDirection: 'GAINING' | 'STABLE' | 'LOSING';
  /** Market growth rate */
  marketGrowthRate: number;
  /** Company growth vs market */
  growthVsMarket: number;
}

/**
 * Competitive analysis
 */
export interface CompetitiveAnalysis {
  /** Competitive position */
  position: 'MARKET_LEADER' | 'STRONG_PLAYER' | 'NICHE_PLAYER' | 'WEAK_PLAYER';
  /** Competitive advantages */
  advantages: string[];
  /** Competitive threats */
  threats: CompetitiveThreat[];
  /** Barrier to entry strength */
  barrierStrength: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Competitive threat
 */
export interface CompetitiveThreat {
  /** Threat source */
  source: string;
  /** Threat level */
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Impact description */
  impact: string;
  /** Timeline */
  timeline: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
}

/**
 * Technology disruption analysis
 */
export interface TechnologyDisruptionAnalysis {
  /** Disruption risk level */
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Potential disruptors */
  potentialDisruptors: string[];
  /** Technology investment */
  technologyInvestment: {
    rdSpend: number;
    rdPercent: number;
    industryBenchmark: number;
  };
  /** Innovation pipeline */
  innovationPipeline: 'WEAK' | 'ADEQUATE' | 'STRONG' | 'LEADING';
}

/**
 * Regulatory change analysis
 */
export interface RegulatoryChangeAnalysis {
  /** Pending regulatory changes */
  pendingChanges: RegulatoryChange[];
  /** Compliance costs */
  complianceCosts: number;
  /** Business model impact */
  businessModelImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Industry-wide impact */
  industryImpact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

/**
 * Individual regulatory change
 */
export interface RegulatoryChange {
  /** Change description */
  description: string;
  /** Effective date */
  effectiveDate: Date;
  /** Impact assessment */
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  /** Compliance cost */
  complianceCost: number;
  /** Business impact */
  businessImpact: string;
}

/**
 * Red flag detection engine
 */
export class RedFlagDetector {
  /**
   * Comprehensive red flag analysis
   */
  static analyzeRedFlags(
    financials: FinancialMetrics,
    projections?: any,
    customerData?: any,
    managementData?: any,
    marketData?: any
  ): RedFlagAssessment {
    const redFlags: RedFlag[] = [];

    // Detect financial red flags
    redFlags.push(...this.detectFinancialRedFlags(financials));

    // Detect projection red flags
    if (projections) {
      redFlags.push(...this.detectProjectionRedFlags(projections));
    }

    // Detect customer concentration red flags
    if (customerData) {
      redFlags.push(...this.detectCustomerRedFlags(customerData));
    }

    // Detect management red flags
    if (managementData) {
      redFlags.push(...this.detectManagementRedFlags(managementData));
    }

    // Detect market red flags
    if (marketData) {
      redFlags.push(...this.detectMarketRedFlags(marketData));
    }

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(redFlags);

    // Categorize red flags
    const categorizedFlags = this.categorizeRedFlags(redFlags);

    // Identify critical flags
    const criticalFlags = redFlags.filter(flag => flag.severity === 'CRITICAL');

    // Prioritize flags
    const prioritizedFlags = this.prioritizeRedFlags(redFlags);

    // Generate mitigation recommendations
    const mitigationRecommendations = this.generateMitigationRecommendations(redFlags);

    return {
      overallRiskScore,
      totalRedFlags: redFlags.length,
      categorizedFlags,
      criticalFlags,
      prioritizedFlags,
      mitigationRecommendations
    };
  }

  /**
   * Detect hockey stick growth patterns
   */
  static detectHockeyStickGrowth(revenueProjections: number[]): RedFlag | null {
    if (revenueProjections.length < 4) return null;

    const growthRates = [];
    for (let i = 1; i < revenueProjections.length; i++) {
      growthRates.push((revenueProjections[i] - revenueProjections[i-1]) / revenueProjections[i-1]);
    }

    const earlyGrowth = growthRates.slice(0, 2).reduce((sum, rate) => sum + rate, 0) / 2;
    const lateGrowth = growthRates.slice(-2).reduce((sum, rate) => sum + rate, 0) / 2;
    const accelerationRatio = lateGrowth / earlyGrowth;

    if (accelerationRatio > 2.0) { // Growth doubles in later years
      const severity: RedFlagSeverity = accelerationRatio > 3.0 ? 'HIGH' : 'MEDIUM';
      const riskScore = Math.min(90, 50 + (accelerationRatio - 2) * 20);

      return {
        id: 'HOCKEY_STICK_001',
        category: 'FINANCIAL',
        type: 'HOCKEY_STICK_PROJECTIONS',
        severity,
        riskScore,
        title: 'Hockey Stick Revenue Growth Detected',
        description: `Revenue projections show unrealistic acceleration with ${(accelerationRatio * 100).toFixed(0)}% increase in growth rate`,
        evidence: [
          {
            type: 'TREND_ANALYSIS',
            value: accelerationRatio,
            benchmark: 1.5,
            variance: accelerationRatio - 1.5
          }
        ],
        valuationImpact: {
          impactType: 'MULTIPLE_COMPRESSION',
          estimatedImpact: -0.15,
          impactPercentage: -15,
          impactRange: { low: -25, high: -10 },
          probability: 0.7
        },
        recommendedActions: [
          'Request detailed justification for growth acceleration',
          'Analyze market sizing to validate growth assumptions',
          'Review sales pipeline and customer acquisition strategy',
          'Consider scenario analysis with more conservative growth'
        ],
        confidence: 85,
        industryRelevance: ['TECHNOLOGY', 'SAAS', 'STARTUP']
      };
    }

    return null;
  }

  /**
   * Detect excessive EBITDA add-backs
   */
  static detectExcessiveEBITDAAddBacks(addBacks: EbitdaAddBack[], baseEBITDA: number): RedFlag | null {
    const totalAddBacks = addBacks.reduce((sum, addBack) => sum + addBack.amount, 0);
    const addBackPercentage = (totalAddBacks / baseEBITDA) * 100;

    if (addBackPercentage > 20) {
      const severity: RedFlagSeverity = addBackPercentage > 40 ? 'CRITICAL' : 
                                       addBackPercentage > 30 ? 'HIGH' : 'MEDIUM';
      const riskScore = Math.min(95, 40 + addBackPercentage);

      const unreasonableAddBacks = addBacks.filter(ab => !ab.isReasonable);

      return {
        id: 'EBITDA_ADDBACK_001',
        category: 'QUALITY_OF_EARNINGS',
        type: 'EXCESSIVE_EBITDA_ADDBACKS',
        severity,
        riskScore,
        title: 'Excessive EBITDA Add-backs',
        description: `EBITDA add-backs represent ${addBackPercentage.toFixed(1)}% of EBITDA, exceeding reasonable threshold of 20%`,
        evidence: [
          {
            type: 'FINANCIAL_METRIC',
            value: addBackPercentage,
            benchmark: 20,
            variance: addBackPercentage - 20
          },
          {
            type: 'RATIO_ANALYSIS',
            value: unreasonableAddBacks.length,
            documentation: unreasonableAddBacks.map(ab => ab.description)
          }
        ],
        valuationImpact: {
          impactType: 'MULTIPLE_COMPRESSION',
          estimatedImpact: -0.10,
          impactPercentage: -10,
          impactRange: { low: -20, high: -5 },
          probability: 0.8
        },
        recommendedActions: [
          'Request detailed justification for each add-back',
          'Verify one-time nature of adjustments',
          'Obtain supporting documentation',
          'Consider normalized EBITDA without questionable add-backs'
        ],
        confidence: 90,
        industryRelevance: ['ALL']
      };
    }

    return null;
  }

  /**
   * Detect customer concentration risk
   */
  static detectCustomerConcentration(topCustomerPercentages: number[]): RedFlag | null {
    const top1Customer = topCustomerPercentages[0] || 0;
    const top3Customers = topCustomerPercentages.slice(0, 3).reduce((sum, pct) => sum + pct, 0);

    if (top1Customer > 30 || top3Customers > 50) {
      const severity: RedFlagSeverity = top1Customer > 50 ? 'CRITICAL' :
                                       top1Customer > 40 ? 'HIGH' : 'MEDIUM';
      const riskScore = Math.min(90, Math.max(top1Customer, top3Customers * 0.8));

      return {
        id: 'CUSTOMER_CONC_001',
        category: 'MARKET_CUSTOMER',
        type: 'CUSTOMER_CONCENTRATION',
        severity,
        riskScore,
        title: 'High Customer Concentration Risk',
        description: `Top customer represents ${top1Customer.toFixed(1)}% of revenue, creating significant concentration risk`,
        evidence: [
          {
            type: 'FINANCIAL_METRIC',
            value: top1Customer,
            benchmark: 20,
            variance: top1Customer - 20
          },
          {
            type: 'FINANCIAL_METRIC',
            value: top3Customers,
            benchmark: 40,
            variance: top3Customers - 40
          }
        ],
        valuationImpact: {
          impactType: 'RISK_PREMIUM_INCREASE',
          estimatedImpact: -0.08,
          impactPercentage: -8,
          impactRange: { low: -15, high: -5 },
          probability: 0.6
        },
        recommendedActions: [
          'Assess customer contract terms and duration',
          'Evaluate customer relationship stability',
          'Review customer diversification strategy',
          'Consider customer loss scenarios in valuation'
        ],
        confidence: 95,
        industryRelevance: ['MANUFACTURING', 'DISTRIBUTION', 'SERVICES']
      };
    }

    return null;
  }

  // Helper methods for red flag detection
  private static detectFinancialRedFlags(financials: FinancialMetrics): RedFlag[] {
    const flags: RedFlag[] = [];

    // Check for margin inconsistencies
    const grossMargin = financials.profitability.grossMargin;
    const ebitdaMargin = financials.profitability.ebitdaMargin;
    
    if (ebitdaMargin > grossMargin) {
      flags.push({
        id: 'MARGIN_001',
        category: 'QUALITY_OF_EARNINGS',
        type: 'MARGIN_MANIPULATION',
        severity: 'HIGH',
        riskScore: 80,
        title: 'EBITDA Margin Exceeds Gross Margin',
        description: 'EBITDA margin cannot exceed gross margin - indicates potential calculation error or manipulation',
        evidence: [
          { type: 'FINANCIAL_METRIC', value: ebitdaMargin },
          { type: 'FINANCIAL_METRIC', value: grossMargin }
        ],
        valuationImpact: {
          impactType: 'MULTIPLE_COMPRESSION',
          estimatedImpact: -0.20,
          impactPercentage: -20,
          impactRange: { low: -30, high: -15 },
          probability: 0.9
        },
        recommendedActions: ['Verify calculation methodology', 'Request detailed P&L breakdown'],
        confidence: 95,
        industryRelevance: ['ALL']
      });
    }

    // Check for negative free cash flow with positive EBITDA
    if (financials.profitability.ebitda > 0 && financials.cashFlow.freeCashFlow < 0) {
      const fcfMargin = financials.cashFlow.freeCashFlowMargin;
      if (fcfMargin < -0.05) { // FCF margin worse than -5%
        flags.push({
          id: 'CASHFLOW_001',
          category: 'FINANCIAL',
          type: 'WORKING_CAPITAL_ISSUES',
          severity: 'MEDIUM',
          riskScore: 60,
          title: 'Negative Free Cash Flow Despite Positive EBITDA',
          description: 'Company shows positive EBITDA but negative free cash flow, indicating potential working capital or capex issues',
          evidence: [
            { type: 'FINANCIAL_METRIC', value: financials.profitability.ebitda },
            { type: 'FINANCIAL_METRIC', value: financials.cashFlow.freeCashFlow },
            { type: 'RATIO_ANALYSIS', value: fcfMargin }
          ],
          valuationImpact: {
            impactType: 'CASH_FLOW_REDUCTION',
            estimatedImpact: -0.10,
            impactPercentage: -10,
            impactRange: { low: -20, high: -5 },
            probability: 0.7
          },
          recommendedActions: [
            'Analyze working capital components',
            'Review capital expenditure requirements',
            'Assess cash conversion cycle'
          ],
          confidence: 85,
          industryRelevance: ['MANUFACTURING', 'RETAIL', 'DISTRIBUTION']
        });
      }
    }

    return flags;
  }

  private static detectProjectionRedFlags(projections: any): RedFlag[] {
    const flags: RedFlag[] = [];
    
    // Hockey stick detection would go here
    // Margin expansion detection would go here
    // Other projection-related red flags
    
    return flags;
  }

  private static detectCustomerRedFlags(customerData: any): RedFlag[] {
    const flags: RedFlag[] = [];
    
    // Customer concentration detection would go here
    // Customer credit quality issues
    // Customer contract terms
    
    return flags;
  }

  private static detectManagementRedFlags(managementData: any): RedFlag[] {
    const flags: RedFlag[] = [];
    
    // Management turnover detection
    // Related party transactions
    // Compensation issues
    
    return flags;
  }

  private static detectMarketRedFlags(marketData: any): RedFlag[] {
    const flags: RedFlag[] = [];
    
    // Market share decline
    // Competitive threats
    // Technology disruption
    
    return flags;
  }

  private static calculateOverallRiskScore(redFlags: RedFlag[]): number {
    if (redFlags.length === 0) return 0;
    
    const weightedScore = redFlags.reduce((sum, flag) => {
      const severityWeight = this.getSeverityWeight(flag.severity);
      return sum + (flag.riskScore * severityWeight);
    }, 0);
    
    const totalWeight = redFlags.reduce((sum, flag) => {
      return sum + this.getSeverityWeight(flag.severity);
    }, 0);
    
    return Math.min(100, weightedScore / totalWeight);
  }

  private static getSeverityWeight(severity: RedFlagSeverity): number {
    switch (severity) {
      case 'LOW': return 0.5;
      case 'MEDIUM': return 1.0;
      case 'HIGH': return 2.0;
      case 'CRITICAL': return 3.0;
      default: return 1.0;
    }
  }

  private static categorizeRedFlags(redFlags: RedFlag[]): CategorizedRedFlags {
    return {
      financial: redFlags.filter(f => f.category === 'FINANCIAL'),
      operational: redFlags.filter(f => f.category === 'OPERATIONAL'),
      market: redFlags.filter(f => f.category === 'MARKET_CUSTOMER'),
      management: redFlags.filter(f => f.category === 'MANAGEMENT'),
      legal: redFlags.filter(f => f.category === 'LEGAL_REGULATORY'),
      qualityOfEarnings: redFlags.filter(f => f.category === 'QUALITY_OF_EARNINGS')
    };
  }

  private static prioritizeRedFlags(redFlags: RedFlag[]): RedFlag[] {
    return redFlags.sort((a, b) => {
      // Sort by severity first, then by risk score
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) return severityDiff;
      return b.riskScore - a.riskScore;
    });
  }

  private static generateMitigationRecommendations(redFlags: RedFlag[]): string[] {
    const recommendations = new Set<string>();
    
    redFlags.forEach(flag => {
      flag.recommendedActions.forEach(action => recommendations.add(action));
    });
    
    // Add general recommendations based on flag patterns
    const criticalFlags = redFlags.filter(f => f.severity === 'CRITICAL');
    if (criticalFlags.length > 0) {
      recommendations.add('Consider walking away from transaction due to critical red flags');
      recommendations.add('Engage specialized experts for detailed investigation');
    }
    
    const qoeFlags = redFlags.filter(f => f.category === 'QUALITY_OF_EARNINGS');
    if (qoeFlags.length > 2) {
      recommendations.add('Conduct comprehensive quality of earnings analysis');
      recommendations.add('Consider normalized earnings adjustments in valuation');
    }
    
    return Array.from(recommendations);
  }
}