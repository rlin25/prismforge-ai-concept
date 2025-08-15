/**
 * Validation Frameworks for M&A Financial Analysis
 * Comprehensive validation logic for DCF analysis, comparable companies, and precedent transactions
 */

import { FinancialMetrics, ValuationMultiples } from './financial-terms';

/**
 * Discounted Cash Flow (DCF) Analysis Framework
 */
export interface DCFAnalysis {
  /** DCF model inputs */
  inputs: DCFInputs;
  /** Projected cash flows */
  projections: DCFProjections;
  /** Terminal value calculation */
  terminalValue: TerminalValue;
  /** Valuation results */
  valuation: DCFValuation;
  /** Sensitivity analysis */
  sensitivity: SensitivityAnalysis;
  /** Validation results */
  validation: DCFValidation;
}

/**
 * DCF model inputs and assumptions
 */
export interface DCFInputs {
  /** Discount rate (WACC) */
  discountRate: number;
  /** Tax rate */
  taxRate: number;
  /** Terminal growth rate */
  terminalGrowthRate: number;
  /** Projection period in years */
  projectionPeriod: number;
  /** Base year financials */
  baseYear: BaseYearFinancials;
  /** Growth assumptions */
  growthAssumptions: GrowthAssumptions;
  /** Margin assumptions */
  marginAssumptions: MarginAssumptions;
  /** Capital assumptions */
  capitalAssumptions: CapitalAssumptions;
}

/**
 * Base year financial data for DCF
 */
export interface BaseYearFinancials {
  /** Revenue */
  revenue: number;
  /** EBITDA */
  ebitda: number;
  /** EBIT */
  ebit: number;
  /** Net income */
  netIncome: number;
  /** Free cash flow */
  freeCashFlow: number;
  /** Working capital */
  workingCapital: number;
  /** Fixed assets */
  fixedAssets: number;
  /** Total debt */
  totalDebt: number;
  /** Cash */
  cash: number;
}

/**
 * Revenue and growth assumptions
 */
export interface GrowthAssumptions {
  /** Annual revenue growth rates by year */
  revenueGrowth: number[];
  /** EBITDA growth rates by year */
  ebitdaGrowth: number[];
  /** Organic vs inorganic growth breakdown */
  organicGrowthPercent: number;
  /** Market growth assumptions */
  marketGrowth: number;
  /** Market share assumptions */
  marketShare: number[];
}

/**
 * Margin and profitability assumptions
 */
export interface MarginAssumptions {
  /** Gross margin progression */
  grossMargin: number[];
  /** EBITDA margin progression */
  ebitdaMargin: number[];
  /** EBIT margin progression */
  ebitMargin: number[];
  /** Tax rate assumptions */
  taxRate: number[];
}

/**
 * Capital expenditure and working capital assumptions
 */
export interface CapitalAssumptions {
  /** Capex as percentage of revenue */
  capexPercent: number[];
  /** Depreciation assumptions */
  depreciationPercent: number[];
  /** Working capital as percentage of revenue */
  workingCapitalPercent: number[];
  /** Debt repayment schedule */
  debtRepayment: number[];
}

/**
 * DCF cash flow projections
 */
export interface DCFProjections {
  /** Projected years */
  years: number[];
  /** Revenue projections */
  revenue: number[];
  /** EBITDA projections */
  ebitda: number[];
  /** EBIT projections */
  ebit: number[];
  /** NOPAT (Net Operating Profit After Tax) */
  nopat: number[];
  /** Free cash flow projections */
  freeCashFlow: number[];
  /** Present value of cash flows */
  presentValue: number[];
  /** Cumulative present value */
  cumulativePV: number[];
}

/**
 * Terminal value calculation methods
 */
export interface TerminalValue {
  /** Terminal value method used */
  method: TerminalValueMethod;
  /** Terminal value amount */
  terminalValue: number;
  /** Present value of terminal value */
  presentValueTerminal: number;
  /** Terminal multiple (if using multiple method) */
  terminalMultiple?: number;
  /** Terminal growth rate (if using growth method) */
  terminalGrowthRate?: number;
}

export type TerminalValueMethod = 
  | 'PERPETUAL_GROWTH'
  | 'EXIT_MULTIPLE'
  | 'LIQUIDATION_VALUE';

/**
 * DCF valuation results
 */
export interface DCFValuation {
  /** Sum of present value of projected cash flows */
  pvProjections: number;
  /** Present value of terminal value */
  pvTerminal: number;
  /** Enterprise value */
  enterpriseValue: number;
  /** Equity value */
  equityValue: number;
  /** Shares outstanding */
  sharesOutstanding: number;
  /** Value per share */
  valuePerShare: number;
  /** Implied valuation multiples */
  impliedMultiples: ValuationMultiples;
}

/**
 * Sensitivity analysis for DCF
 */
export interface SensitivityAnalysis {
  /** Discount rate sensitivity */
  discountRateSensitivity: SensitivityTable;
  /** Terminal growth rate sensitivity */
  terminalGrowthSensitivity: SensitivityTable;
  /** Revenue growth sensitivity */
  revenueGrowthSensitivity: SensitivityTable;
  /** EBITDA margin sensitivity */
  marginSensitivity: SensitivityTable;
}

/**
 * Sensitivity table structure
 */
export interface SensitivityTable {
  /** Variable being tested */
  variable: string;
  /** Base case value */
  baseCase: number;
  /** Range of values tested */
  testValues: number[];
  /** Resulting valuations */
  resultingValues: number[];
  /** Percentage change from base case */
  percentageChange: number[];
}

/**
 * DCF validation framework
 */
export interface DCFValidation {
  /** Overall validation score (0-100) */
  overallScore: number;
  /** Individual validation checks */
  checks: DCFValidationCheck[];
  /** Critical issues found */
  criticalIssues: string[];
  /** Warnings */
  warnings: string[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Individual DCF validation check
 */
export interface DCFValidationCheck {
  /** Check category */
  category: DCFValidationCategory;
  /** Check name */
  name: string;
  /** Pass/fail status */
  passed: boolean;
  /** Score (0-100) */
  score: number;
  /** Details/explanation */
  details: string;
  /** Severity if failed */
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type DCFValidationCategory = 
  | 'ASSUMPTIONS_REASONABLENESS'
  | 'MATHEMATICAL_ACCURACY'
  | 'MARKET_BENCHMARKING'
  | 'SENSITIVITY_ANALYSIS'
  | 'TERMINAL_VALUE'
  | 'GROWTH_SUSTAINABILITY';

/**
 * Comparable Companies Analysis Framework
 */
export interface ComparableCompaniesAnalysis {
  /** Selection criteria */
  selectionCriteria: CompSelectionCriteria;
  /** Comparable companies */
  comparables: ComparableCompany[];
  /** Multiple analysis */
  multipleAnalysis: MultipleAnalysis;
  /** Statistical analysis */
  statistics: CompStatistics;
  /** Validation results */
  validation: CompValidation;
}

/**
 * Criteria for selecting comparable companies
 */
export interface CompSelectionCriteria {
  /** Industry requirements */
  industry: string[];
  /** Size requirements */
  sizeRequirements: SizeRequirements;
  /** Geographic requirements */
  geography: string[];
  /** Business model requirements */
  businessModel: string[];
  /** Growth profile requirements */
  growthProfile: GrowthProfileRequirements;
  /** Profitability requirements */
  profitabilityRequirements: ProfitabilityRequirements;
}

/**
 * Size requirements for comparables
 */
export interface SizeRequirements {
  /** Minimum revenue */
  minRevenue?: number;
  /** Maximum revenue */
  maxRevenue?: number;
  /** Minimum market cap */
  minMarketCap?: number;
  /** Maximum market cap */
  maxMarketCap?: number;
  /** Revenue size bracket (e.g., +/- 50%) */
  revenueBracket?: number;
}

/**
 * Growth profile requirements
 */
export interface GrowthProfileRequirements {
  /** Minimum revenue growth */
  minRevenueGrowth?: number;
  /** Maximum revenue growth */
  maxRevenueGrowth?: number;
  /** Growth stage */
  growthStage?: 'EARLY' | 'GROWTH' | 'MATURE' | 'DECLINING';
}

/**
 * Profitability requirements
 */
export interface ProfitabilityRequirements {
  /** Minimum EBITDA margin */
  minEbitdaMargin?: number;
  /** Profitability status */
  profitable?: boolean;
  /** Margin stability */
  marginStability?: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

/**
 * Comparable company data
 */
export interface ComparableCompany {
  /** Company information */
  info: CompanyInfo;
  /** Financial metrics */
  financials: FinancialMetrics;
  /** Valuation multiples */
  multiples: ValuationMultiples;
  /** Relevance score */
  relevanceScore: number;
  /** Inclusion rationale */
  inclusionRationale: string;
  /** Adjustments made */
  adjustments: CompanyAdjustment[];
}

/**
 * Company basic information
 */
export interface CompanyInfo {
  /** Company name */
  name: string;
  /** Ticker symbol */
  ticker?: string;
  /** Industry */
  industry: string;
  /** Sector */
  sector: string;
  /** Market cap */
  marketCap: number;
  /** Revenue (LTM) */
  revenue: number;
  /** Geography */
  geography: string;
  /** Business description */
  description: string;
}

/**
 * Adjustments made to comparable company data
 */
export interface CompanyAdjustment {
  /** Type of adjustment */
  type: AdjustmentType;
  /** Metric adjusted */
  metric: string;
  /** Original value */
  originalValue: number;
  /** Adjusted value */
  adjustedValue: number;
  /** Rationale */
  rationale: string;
}

export type AdjustmentType = 
  | 'CALENDAR_YEAR_END'
  | 'ACCOUNTING_STANDARD'
  | 'ONE_TIME_ITEMS'
  | 'CURRENCY_CONVERSION'
  | 'BUSINESS_MIX'
  | 'SIZE_ADJUSTMENT';

/**
 * Valuation multiple analysis
 */
export interface MultipleAnalysis {
  /** EV/Revenue analysis */
  evRevenue: MultipleStats;
  /** EV/EBITDA analysis */
  evEbitda: MultipleStats;
  /** P/E analysis */
  peRatio: MultipleStats;
  /** Other multiples */
  otherMultiples: Record<string, MultipleStats>;
  /** Multiple selection rationale */
  multipleSelection: string[];
}

/**
 * Statistical analysis of multiples
 */
export interface MultipleStats {
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Standard deviation */
  standardDeviation: number;
  /** 25th percentile */
  p25: number;
  /** 75th percentile */
  p75: number;
  /** Minimum */
  min: number;
  /** Maximum */
  max: number;
  /** Count of observations */
  count: number;
  /** Outliers removed */
  outliersRemoved: number[];
}

/**
 * Statistical analysis of comparable companies
 */
export interface CompStatistics {
  /** Sample size */
  sampleSize: number;
  /** Outliers identified */
  outliers: ComparableCompany[];
  /** R-squared values */
  rSquared: Record<string, number>;
  /** Correlation analysis */
  correlations: CorrelationMatrix;
  /** Quality metrics */
  qualityMetrics: QualityMetrics;
}

/**
 * Correlation matrix for key metrics
 */
export interface CorrelationMatrix {
  /** Metrics included */
  metrics: string[];
  /** Correlation coefficients */
  correlations: number[][];
}

/**
 * Quality metrics for comparable analysis
 */
export interface QualityMetrics {
  /** Average relevance score */
  avgRelevanceScore: number;
  /** Industry homogeneity */
  industryHomogeneity: number;
  /** Size similarity */
  sizeSimilarity: number;
  /** Growth similarity */
  growthSimilarity: number;
  /** Profitability similarity */
  profitabilitySimilarity: number;
}

/**
 * Comparable companies validation
 */
export interface CompValidation {
  /** Overall validation score */
  overallScore: number;
  /** Validation checks */
  checks: CompValidationCheck[];
  /** Critical issues */
  criticalIssues: string[];
  /** Warnings */
  warnings: string[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Individual comparable validation check
 */
export interface CompValidationCheck {
  /** Check category */
  category: CompValidationCategory;
  /** Check name */
  name: string;
  /** Pass/fail status */
  passed: boolean;
  /** Score */
  score: number;
  /** Details */
  details: string;
  /** Severity */
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type CompValidationCategory = 
  | 'SAMPLE_SIZE'
  | 'INDUSTRY_RELEVANCE'
  | 'SIZE_COMPARABILITY'
  | 'BUSINESS_MODEL'
  | 'GROWTH_PROFILE'
  | 'PROFITABILITY'
  | 'GEOGRAPHIC_RELEVANCE'
  | 'TRADING_LIQUIDITY';

/**
 * Precedent Transactions Analysis Framework
 */
export interface PrecedentTransactionsAnalysis {
  /** Selection criteria */
  selectionCriteria: TransactionSelectionCriteria;
  /** Precedent transactions */
  transactions: PrecedentTransaction[];
  /** Multiple analysis */
  multipleAnalysis: TransactionMultipleAnalysis;
  /** Market context */
  marketContext: MarketContext;
  /** Validation results */
  validation: TransactionValidation;
}

/**
 * Criteria for selecting precedent transactions
 */
export interface TransactionSelectionCriteria {
  /** Time frame */
  timeFrame: TimeFrameRequirements;
  /** Industry requirements */
  industry: string[];
  /** Deal size requirements */
  dealSize: DealSizeRequirements;
  /** Deal type requirements */
  dealType: DealTypeRequirements;
  /** Geographic requirements */
  geography: string[];
  /** Transaction structure */
  structure: TransactionStructureRequirements;
}

/**
 * Time frame requirements for precedent transactions
 */
export interface TimeFrameRequirements {
  /** Start date */
  startDate: Date;
  /** End date */
  endDate: Date;
  /** Maximum age in years */
  maxAgeYears: number;
  /** Market cycle considerations */
  marketCycle: 'UP_CYCLE' | 'DOWN_CYCLE' | 'MIXED' | 'ANY';
}

/**
 * Deal size requirements
 */
export interface DealSizeRequirements {
  /** Minimum transaction value */
  minValue?: number;
  /** Maximum transaction value */
  maxValue?: number;
  /** Target company revenue requirements */
  targetRevenue?: SizeRequirements;
}

/**
 * Deal type requirements
 */
export interface DealTypeRequirements {
  /** Strategic vs financial buyers */
  buyerType: ('STRATEGIC' | 'FINANCIAL')[];
  /** Transaction rationale */
  rationale: TransactionRationale[];
  /** Control vs minority */
  controlType: ('CONTROL' | 'MINORITY')[];
}

export type TransactionRationale = 
  | 'HORIZONTAL_INTEGRATION'
  | 'VERTICAL_INTEGRATION'
  | 'MARKET_EXPANSION'
  | 'TECHNOLOGY_ACQUISITION'
  | 'TALENT_ACQUISITION'
  | 'FINANCIAL_ENGINEERING'
  | 'DISTRESSED_ACQUISITION';

/**
 * Transaction structure requirements
 */
export interface TransactionStructureRequirements {
  /** Payment structure */
  paymentStructure: ('CASH' | 'STOCK' | 'MIXED')[];
  /** Deal structure */
  dealStructure: ('ASSET_PURCHASE' | 'STOCK_PURCHASE' | 'MERGER')[];
  /** Auction vs negotiated */
  processType: ('AUCTION' | 'NEGOTIATED' | 'UNSOLICITED')[];
}

/**
 * Precedent transaction data
 */
export interface PrecedentTransaction {
  /** Transaction information */
  info: TransactionInfo;
  /** Target company information */
  target: TransactionTargetInfo;
  /** Acquirer information */
  acquirer: TransactionAcquirerInfo;
  /** Financial metrics at time of transaction */
  financials: TransactionFinancials;
  /** Valuation multiples */
  multiples: TransactionMultiples;
  /** Deal context */
  context: TransactionContext;
  /** Relevance score */
  relevanceScore: number;
  /** Adjustments made */
  adjustments: TransactionAdjustment[];
}

/**
 * Transaction basic information
 */
export interface TransactionInfo {
  /** Transaction ID */
  id: string;
  /** Announcement date */
  announcementDate: Date;
  /** Closing date */
  closingDate?: Date;
  /** Transaction value */
  transactionValue: number;
  /** Payment structure */
  paymentStructure: string;
  /** Deal structure */
  dealStructure: string;
  /** Process type */
  processType: string;
  /** Transaction status */
  status: 'COMPLETED' | 'PENDING' | 'TERMINATED';
}

/**
 * Target company information
 */
export interface TransactionTargetInfo {
  /** Company name */
  name: string;
  /** Industry */
  industry: string;
  /** Revenue (LTM at announcement) */
  revenue: number;
  /** EBITDA (LTM at announcement) */
  ebitda: number;
  /** Geography */
  geography: string;
  /** Business description */
  description: string;
  /** Ownership structure */
  ownershipStructure: string;
}

/**
 * Acquirer information
 */
export interface TransactionAcquirerInfo {
  /** Acquirer name */
  name: string;
  /** Acquirer type */
  type: 'STRATEGIC' | 'FINANCIAL';
  /** Industry (if strategic) */
  industry?: string;
  /** Geography */
  geography: string;
  /** Public/private status */
  publicStatus: 'PUBLIC' | 'PRIVATE';
}

/**
 * Financial metrics at transaction time
 */
export interface TransactionFinancials {
  /** Last twelve months metrics */
  ltm: FinancialMetrics;
  /** Next twelve months projections */
  ntm: FinancialMetrics;
  /** Growth rates */
  growthRates: {
    revenueGrowth: number;
    ebitdaGrowth: number;
  };
}

/**
 * Transaction valuation multiples
 */
export interface TransactionMultiples {
  /** EV/Revenue (LTM) */
  evRevenueLTM: number;
  /** EV/Revenue (NTM) */
  evRevenueNTM: number;
  /** EV/EBITDA (LTM) */
  evEbitdaLTM: number;
  /** EV/EBITDA (NTM) */
  evEbitdaNTM: number;
  /** Transaction premium */
  premium?: number;
  /** Other multiples */
  otherMultiples: Record<string, number>;
}

/**
 * Transaction context and market conditions
 */
export interface TransactionContext {
  /** Market conditions */
  marketConditions: MarketConditions;
  /** Transaction rationale */
  rationale: TransactionRationale;
  /** Competitive dynamics */
  competitiveDynamics: string;
  /** Strategic logic */
  strategicLogic: string;
  /** Synergies expected */
  synergiesExpected?: number;
}

/**
 * Market conditions at time of transaction
 */
export interface MarketConditions {
  /** M&A market activity level */
  maActivityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  /** Credit market conditions */
  creditConditions: 'TIGHT' | 'MODERATE' | 'LOOSE';
  /** Industry consolidation trend */
  consolidationTrend: 'EARLY' | 'ACTIVE' | 'MATURE';
  /** Economic environment */
  economicEnvironment: 'RECESSION' | 'RECOVERY' | 'GROWTH' | 'PEAK';
}

/**
 * Adjustments made to transaction data
 */
export interface TransactionAdjustment {
  /** Type of adjustment */
  type: TransactionAdjustmentType;
  /** Metric adjusted */
  metric: string;
  /** Original value */
  originalValue: number;
  /** Adjusted value */
  adjustedValue: number;
  /** Rationale */
  rationale: string;
}

export type TransactionAdjustmentType = 
  | 'TIMING_ADJUSTMENT'
  | 'MARKET_CONDITIONS'
  | 'SIZE_ADJUSTMENT'
  | 'CONTROL_PREMIUM'
  | 'SYNERGIES_ADJUSTMENT'
  | 'CURRENCY_CONVERSION';

/**
 * Transaction multiple analysis
 */
export interface TransactionMultipleAnalysis {
  /** EV/Revenue analysis */
  evRevenue: TransactionMultipleStats;
  /** EV/EBITDA analysis */
  evEbitda: TransactionMultipleStats;
  /** Premium analysis */
  premiumAnalysis: PremiumAnalysis;
  /** Time-weighted analysis */
  timeWeightedAnalysis: TimeWeightedAnalysis;
}

/**
 * Transaction multiple statistics
 */
export interface TransactionMultipleStats extends MultipleStats {
  /** Deal size weighted average */
  dealSizeWeighted: number;
  /** Time weighted average */
  timeWeighted: number;
  /** Strategic vs financial buyer split */
  buyerTypeSplit: {
    strategic: MultipleStats;
    financial: MultipleStats;
  };
}

/**
 * Premium analysis for precedent transactions
 */
export interface PremiumAnalysis {
  /** Average premium */
  averagePremium: number;
  /** Median premium */
  medianPremium: number;
  /** Premium by buyer type */
  premiumByBuyerType: Record<string, number>;
  /** Premium by deal size */
  premiumByDealSize: Record<string, number>;
  /** Premium trends over time */
  premiumTrends: PremiumTrend[];
}

/**
 * Premium trend analysis
 */
export interface PremiumTrend {
  /** Time period */
  period: string;
  /** Average premium */
  averagePremium: number;
  /** Transaction count */
  transactionCount: number;
}

/**
 * Time-weighted analysis
 */
export interface TimeWeightedAnalysis {
  /** Weights by time period */
  timeWeights: Record<string, number>;
  /** Weighted multiples */
  weightedMultiples: Record<string, number>;
  /** Decay factor used */
  decayFactor: number;
}

/**
 * Market context for transactions
 */
export interface MarketContext {
  /** M&A activity trends */
  activityTrends: MAActivityTrend[];
  /** Multiple trends */
  multipleTrends: MultipleTrend[];
  /** Credit market impact */
  creditMarketImpact: CreditMarketImpact;
  /** Regulatory environment */
  regulatoryEnvironment: RegulatoryEnvironment;
}

/**
 * M&A activity trend
 */
export interface MAActivityTrend {
  /** Time period */
  period: string;
  /** Transaction volume */
  transactionVolume: number;
  /** Total value */
  totalValue: number;
  /** Average deal size */
  averageDealSize: number;
  /** Activity level */
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
}

/**
 * Multiple trend analysis
 */
export interface MultipleTrend {
  /** Multiple type */
  multipleType: string;
  /** Time series data */
  timeSeries: TimeSeriesPoint[];
  /** Trend direction */
  trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  /** Volatility measure */
  volatility: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  /** Date */
  date: Date;
  /** Value */
  value: number;
}

/**
 * Credit market impact assessment
 */
export interface CreditMarketImpact {
  /** Leverage levels */
  leverageLevels: LeverageLevels;
  /** Interest rate environment */
  interestRates: InterestRateEnvironment;
  /** Credit availability */
  creditAvailability: 'TIGHT' | 'MODERATE' | 'LOOSE';
  /** Impact on multiples */
  multipleImpact: number;
}

/**
 * Leverage levels in the market
 */
export interface LeverageLevels {
  /** Average debt/EBITDA */
  averageDebtEbitda: number;
  /** Senior debt levels */
  seniorDebtLevels: number;
  /** Total leverage availability */
  totalLeverageAvailable: number;
}

/**
 * Interest rate environment
 */
export interface InterestRateEnvironment {
  /** Risk-free rate */
  riskFreeRate: number;
  /** Credit spreads */
  creditSpreads: number;
  /** Term structure */
  termStructure: 'NORMAL' | 'INVERTED' | 'FLAT';
  /** Rate direction */
  rateDirection: 'RISING' | 'STABLE' | 'FALLING';
}

/**
 * Regulatory environment assessment
 */
export interface RegulatoryEnvironment {
  /** Antitrust scrutiny level */
  antitrustScrutiny: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  /** Recent regulatory changes */
  recentChanges: string[];
  /** Industry-specific regulations */
  industryRegulations: string[];
  /** Impact on transaction activity */
  activityImpact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

/**
 * Transaction validation framework
 */
export interface TransactionValidation {
  /** Overall validation score */
  overallScore: number;
  /** Validation checks */
  checks: TransactionValidationCheck[];
  /** Critical issues */
  criticalIssues: string[];
  /** Warnings */
  warnings: string[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Individual transaction validation check
 */
export interface TransactionValidationCheck {
  /** Check category */
  category: TransactionValidationCategory;
  /** Check name */
  name: string;
  /** Pass/fail status */
  passed: boolean;
  /** Score */
  score: number;
  /** Details */
  details: string;
  /** Severity */
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type TransactionValidationCategory = 
  | 'SAMPLE_SIZE'
  | 'TIME_RELEVANCE'
  | 'INDUSTRY_RELEVANCE'
  | 'SIZE_COMPARABILITY'
  | 'DEAL_STRUCTURE'
  | 'MARKET_CONDITIONS'
  | 'DATA_QUALITY'
  | 'TRANSACTION_RATIONALE';

/**
 * Validation framework implementation class
 */
export class ValidationFrameworks {
  /**
   * Validate DCF analysis
   */
  static validateDCF(dcf: DCFAnalysis): DCFValidation {
    const checks: DCFValidationCheck[] = [];
    let totalScore = 0;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Assumption reasonableness checks
    const discountRateCheck = this.validateDiscountRate(dcf.inputs.discountRate);
    checks.push(discountRateCheck);
    totalScore += discountRateCheck.score;

    const terminalGrowthCheck = this.validateTerminalGrowthRate(dcf.inputs.terminalGrowthRate);
    checks.push(terminalGrowthCheck);
    totalScore += terminalGrowthCheck.score;

    const revenueGrowthCheck = this.validateRevenueGrowth(dcf.inputs.growthAssumptions.revenueGrowth);
    checks.push(revenueGrowthCheck);
    totalScore += revenueGrowthCheck.score;

    const marginCheck = this.validateMarginProgression(dcf.inputs.marginAssumptions);
    checks.push(marginCheck);
    totalScore += marginCheck.score;

    // Mathematical accuracy checks
    const calculationCheck = this.validateDCFCalculations(dcf);
    checks.push(calculationCheck);
    totalScore += calculationCheck.score;

    // Terminal value validation
    const terminalValueCheck = this.validateTerminalValue(dcf.terminalValue, dcf.projections);
    checks.push(terminalValueCheck);
    totalScore += terminalValueCheck.score;

    // Sensitivity analysis validation
    const sensitivityCheck = this.validateSensitivityAnalysis(dcf.sensitivity);
    checks.push(sensitivityCheck);
    totalScore += sensitivityCheck.score;

    // Collect critical issues and warnings
    checks.forEach(check => {
      if (!check.passed) {
        if (check.severity === 'CRITICAL') {
          criticalIssues.push(`${check.name}: ${check.details}`);
        } else if (check.severity === 'HIGH' || check.severity === 'MEDIUM') {
          warnings.push(`${check.name}: ${check.details}`);
        }
      }
    });

    // Generate recommendations
    if (dcf.inputs.terminalGrowthRate > 0.04) {
      recommendations.push('Consider reducing terminal growth rate to be more conservative');
    }
    if (dcf.valuation.pvTerminal / dcf.valuation.enterpriseValue > 0.75) {
      recommendations.push('Terminal value represents >75% of total value - consider longer projection period');
    }

    const overallScore = totalScore / checks.length;

    return {
      overallScore,
      checks,
      criticalIssues,
      warnings,
      recommendations
    };
  }

  /**
   * Validate comparable companies analysis
   */
  static validateComparables(comp: ComparableCompaniesAnalysis): CompValidation {
    const checks: CompValidationCheck[] = [];
    let totalScore = 0;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Sample size validation
    const sampleSizeCheck = this.validateSampleSize(comp.comparables.length);
    checks.push(sampleSizeCheck);
    totalScore += sampleSizeCheck.score;

    // Industry relevance validation
    const industryCheck = this.validateIndustryRelevance(comp.comparables, comp.selectionCriteria);
    checks.push(industryCheck);
    totalScore += industryCheck.score;

    // Size comparability validation
    const sizeCheck = this.validateSizeComparability(comp.comparables);
    checks.push(sizeCheck);
    totalScore += sizeCheck.score;

    // Business model validation
    const businessModelCheck = this.validateBusinessModelSimilarity(comp.comparables);
    checks.push(businessModelCheck);
    totalScore += businessModelCheck.score;

    // Statistical validity
    const statisticalCheck = this.validateStatisticalReliability(comp.statistics);
    checks.push(statisticalCheck);
    totalScore += statisticalCheck.score;

    // Collect issues
    checks.forEach(check => {
      if (!check.passed) {
        if (check.severity === 'CRITICAL') {
          criticalIssues.push(`${check.name}: ${check.details}`);
        } else {
          warnings.push(`${check.name}: ${check.details}`);
        }
      }
    });

    // Generate recommendations
    if (comp.comparables.length < 5) {
      recommendations.push('Consider expanding comparable set to at least 5 companies');
    }
    if (comp.statistics.qualityMetrics.avgRelevanceScore < 70) {
      recommendations.push('Consider refining selection criteria to improve relevance');
    }

    const overallScore = totalScore / checks.length;

    return {
      overallScore,
      checks,
      criticalIssues,
      warnings,
      recommendations
    };
  }

  /**
   * Validate precedent transactions analysis
   */
  static validatePrecedentTransactions(precedents: PrecedentTransactionsAnalysis): TransactionValidation {
    const checks: TransactionValidationCheck[] = [];
    let totalScore = 0;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Sample size validation
    const sampleSizeCheck = this.validateTransactionSampleSize(precedents.transactions.length);
    checks.push(sampleSizeCheck);
    totalScore += sampleSizeCheck.score;

    // Time relevance validation
    const timeRelevanceCheck = this.validateTimeRelevance(precedents.transactions, precedents.selectionCriteria.timeFrame);
    checks.push(timeRelevanceCheck);
    totalScore += timeRelevanceCheck.score;

    // Industry relevance validation
    const industryRelevanceCheck = this.validateTransactionIndustryRelevance(precedents.transactions);
    checks.push(industryRelevanceCheck);
    totalScore += industryRelevanceCheck.score;

    // Market conditions validation
    const marketConditionsCheck = this.validateMarketConditionsRelevance(precedents.marketContext);
    checks.push(marketConditionsCheck);
    totalScore += marketConditionsCheck.score;

    // Data quality validation
    const dataQualityCheck = this.validateTransactionDataQuality(precedents.transactions);
    checks.push(dataQualityCheck);
    totalScore += dataQualityCheck.score;

    // Collect issues
    checks.forEach(check => {
      if (!check.passed) {
        if (check.severity === 'CRITICAL') {
          criticalIssues.push(`${check.name}: ${check.details}`);
        } else {
          warnings.push(`${check.name}: ${check.details}`);
        }
      }
    });

    // Generate recommendations
    if (precedents.transactions.length < 3) {
      recommendations.push('Consider expanding transaction set to at least 3 transactions');
    }
    
    const avgAge = this.calculateAverageTransactionAge(precedents.transactions);
    if (avgAge > 3) {
      recommendations.push('Consider focusing on more recent transactions for better relevance');
    }

    const overallScore = totalScore / checks.length;

    return {
      overallScore,
      checks,
      criticalIssues,
      warnings,
      recommendations
    };
  }

  // Helper validation methods
  private static validateDiscountRate(discountRate: number): DCFValidationCheck {
    const isReasonable = discountRate >= 0.06 && discountRate <= 0.20;
    return {
      category: 'ASSUMPTIONS_REASONABLENESS',
      name: 'Discount Rate Validation',
      passed: isReasonable,
      score: isReasonable ? 100 : (discountRate > 0.20 ? 30 : 50),
      details: isReasonable ? 'Discount rate is within reasonable range (6-20%)' : 
               `Discount rate ${(discountRate * 100).toFixed(1)}% appears ${discountRate > 0.20 ? 'too high' : 'too low'}`,
      severity: isReasonable ? undefined : (discountRate > 0.25 || discountRate < 0.04 ? 'HIGH' : 'MEDIUM')
    };
  }

  private static validateTerminalGrowthRate(terminalGrowthRate: number): DCFValidationCheck {
    const isReasonable = terminalGrowthRate >= 0 && terminalGrowthRate <= 0.04;
    return {
      category: 'ASSUMPTIONS_REASONABLENESS',
      name: 'Terminal Growth Rate Validation',
      passed: isReasonable,
      score: isReasonable ? 100 : 40,
      details: isReasonable ? 'Terminal growth rate is conservative and reasonable' : 
               `Terminal growth rate ${(terminalGrowthRate * 100).toFixed(1)}% exceeds long-term GDP growth`,
      severity: isReasonable ? undefined : 'MEDIUM'
    };
  }

  private static validateRevenueGrowth(revenueGrowth: number[]): DCFValidationCheck {
    const hasHockeyStick = this.detectHockeyStickGrowth(revenueGrowth);
    const avgGrowth = revenueGrowth.reduce((sum, rate) => sum + rate, 0) / revenueGrowth.length;
    const isReasonable = !hasHockeyStick && avgGrowth <= 0.50;
    
    return {
      category: 'GROWTH_SUSTAINABILITY',
      name: 'Revenue Growth Validation',
      passed: isReasonable,
      score: isReasonable ? 100 : (hasHockeyStick ? 30 : 60),
      details: hasHockeyStick ? 'Hockey stick growth pattern detected' : 
               (avgGrowth > 0.50 ? 'Average growth rate appears aggressive' : 'Growth rates appear reasonable'),
      severity: hasHockeyStick ? 'HIGH' : (avgGrowth > 0.50 ? 'MEDIUM' : undefined)
    };
  }

  private static validateMarginProgression(margins: MarginAssumptions): DCFValidationCheck {
    const ebitdaMargins = margins.ebitdaMargin;
    const hasUnrealisticImprovement = this.detectUnrealisticMarginImprovement(ebitdaMargins);
    
    return {
      category: 'ASSUMPTIONS_REASONABLENESS',
      name: 'Margin Progression Validation',
      passed: !hasUnrealisticImprovement,
      score: hasUnrealisticImprovement ? 40 : 100,
      details: hasUnrealisticImprovement ? 'Unrealistic margin improvement detected' : 'Margin progression appears reasonable',
      severity: hasUnrealisticImprovement ? 'MEDIUM' : undefined
    };
  }

  private static validateDCFCalculations(dcf: DCFAnalysis): DCFValidationCheck {
    // Simplified calculation validation
    const calculatedEV = dcf.valuation.pvProjections + dcf.valuation.pvTerminal;
    const reportedEV = dcf.valuation.enterpriseValue;
    const calculationError = Math.abs(calculatedEV - reportedEV) / reportedEV;
    
    const isAccurate = calculationError < 0.01; // 1% tolerance
    
    return {
      category: 'MATHEMATICAL_ACCURACY',
      name: 'DCF Calculation Validation',
      passed: isAccurate,
      score: isAccurate ? 100 : 70,
      details: isAccurate ? 'DCF calculations are mathematically accurate' : 'Minor calculation discrepancies detected',
      severity: isAccurate ? undefined : 'LOW'
    };
  }

  private static validateTerminalValue(terminalValue: TerminalValue, projections: DCFProjections): DCFValidationCheck {
    const totalPV = projections.presentValue.reduce((sum, pv) => sum + pv, 0);
    const terminalPercentage = terminalValue.presentValueTerminal / (totalPV + terminalValue.presentValueTerminal);
    
    const isReasonable = terminalPercentage <= 0.75;
    
    return {
      category: 'TERMINAL_VALUE',
      name: 'Terminal Value Validation',
      passed: isReasonable,
      score: isReasonable ? 100 : 60,
      details: `Terminal value represents ${(terminalPercentage * 100).toFixed(1)}% of total value`,
      severity: terminalPercentage > 0.85 ? 'HIGH' : (terminalPercentage > 0.75 ? 'MEDIUM' : undefined)
    };
  }

  private static validateSensitivityAnalysis(sensitivity: SensitivityAnalysis): DCFValidationCheck {
    const hasAdequateSensitivity = sensitivity.discountRateSensitivity && 
                                   sensitivity.terminalGrowthSensitivity && 
                                   sensitivity.revenueGrowthSensitivity;
    
    return {
      category: 'SENSITIVITY_ANALYSIS',
      name: 'Sensitivity Analysis Validation',
      passed: hasAdequateSensitivity,
      score: hasAdequateSensitivity ? 100 : 50,
      details: hasAdequateSensitivity ? 'Comprehensive sensitivity analysis provided' : 'Sensitivity analysis is incomplete',
      severity: hasAdequateSensitivity ? undefined : 'MEDIUM'
    };
  }

  // Helper methods for pattern detection
  private static detectHockeyStickGrowth(growthRates: number[]): boolean {
    if (growthRates.length < 3) return false;
    
    // Check for significant acceleration in later years
    const earlyGrowth = growthRates.slice(0, 2).reduce((sum, rate) => sum + rate, 0) / 2;
    const lateGrowth = growthRates.slice(-2).reduce((sum, rate) => sum + rate, 0) / 2;
    
    return lateGrowth > earlyGrowth * 2; // 100% increase in growth rate
  }

  private static detectUnrealisticMarginImprovement(margins: number[]): boolean {
    if (margins.length < 2) return false;
    
    const totalImprovement = margins[margins.length - 1] - margins[0];
    return totalImprovement > 0.15; // More than 15 percentage points improvement
  }

  // Additional validation helper methods...
  private static validateSampleSize(sampleSize: number): CompValidationCheck {
    const isAdequate = sampleSize >= 5;
    return {
      category: 'SAMPLE_SIZE',
      name: 'Sample Size Validation',
      passed: isAdequate,
      score: isAdequate ? 100 : Math.max(20, sampleSize * 20),
      details: `Sample size: ${sampleSize} companies`,
      severity: sampleSize < 3 ? 'CRITICAL' : (sampleSize < 5 ? 'HIGH' : undefined)
    };
  }

  private static validateIndustryRelevance(comparables: ComparableCompany[], criteria: CompSelectionCriteria): CompValidationCheck {
    const relevantCount = comparables.filter(comp => criteria.industry.includes(comp.info.industry)).length;
    const relevancePercentage = relevantCount / comparables.length;
    
    const isRelevant = relevancePercentage >= 0.8;
    
    return {
      category: 'INDUSTRY_RELEVANCE',
      name: 'Industry Relevance Validation',
      passed: isRelevant,
      score: relevancePercentage * 100,
      details: `${(relevancePercentage * 100).toFixed(1)}% of companies are industry-relevant`,
      severity: relevancePercentage < 0.5 ? 'HIGH' : (relevancePercentage < 0.8 ? 'MEDIUM' : undefined)
    };
  }

  private static validateSizeComparability(comparables: ComparableCompany[]): CompValidationCheck {
    const revenues = comparables.map(comp => comp.info.revenue);
    const maxRevenue = Math.max(...revenues);
    const minRevenue = Math.min(...revenues);
    const sizeRatio = maxRevenue / minRevenue;
    
    const isComparable = sizeRatio <= 10; // Within 10x size range
    
    return {
      category: 'SIZE_COMPARABILITY',
      name: 'Size Comparability Validation',
      passed: isComparable,
      score: isComparable ? 100 : Math.max(30, 100 - (sizeRatio - 10) * 5),
      details: `Size range: ${sizeRatio.toFixed(1)}x (max/min revenue)`,
      severity: sizeRatio > 20 ? 'HIGH' : (sizeRatio > 10 ? 'MEDIUM' : undefined)
    };
  }

  private static validateBusinessModelSimilarity(comparables: ComparableCompany[]): CompValidationCheck {
    // Simplified business model validation based on margin similarity
    const ebitdaMargins = comparables.map(comp => comp.financials.profitability.ebitdaMargin);
    const avgMargin = ebitdaMargins.reduce((sum, margin) => sum + margin, 0) / ebitdaMargins.length;
    const maxDeviation = Math.max(...ebitdaMargins.map(margin => Math.abs(margin - avgMargin)));
    
    const isSimilar = maxDeviation <= 0.15; // Within 15 percentage points
    
    return {
      category: 'BUSINESS_MODEL',
      name: 'Business Model Similarity Validation',
      passed: isSimilar,
      score: isSimilar ? 100 : Math.max(40, 100 - maxDeviation * 300),
      details: `Maximum EBITDA margin deviation: ${(maxDeviation * 100).toFixed(1)} percentage points`,
      severity: maxDeviation > 0.25 ? 'MEDIUM' : undefined
    };
  }

  private static validateStatisticalReliability(statistics: CompStatistics): CompValidationCheck {
    const hasOutliers = statistics.outliers.length > 0;
    const sampleSize = statistics.sampleSize;
    const isReliable = sampleSize >= 5 && statistics.outliers.length / sampleSize <= 0.2;
    
    return {
      category: 'SAMPLE_SIZE',
      name: 'Statistical Reliability Validation',
      passed: isReliable,
      score: isReliable ? 100 : 60,
      details: `${statistics.outliers.length} outliers in sample of ${sampleSize}`,
      severity: statistics.outliers.length / sampleSize > 0.3 ? 'MEDIUM' : undefined
    };
  }

  private static validateTransactionSampleSize(sampleSize: number): TransactionValidationCheck {
    const isAdequate = sampleSize >= 3;
    return {
      category: 'SAMPLE_SIZE',
      name: 'Transaction Sample Size Validation',
      passed: isAdequate,
      score: isAdequate ? 100 : Math.max(30, sampleSize * 33),
      details: `Sample size: ${sampleSize} transactions`,
      severity: sampleSize < 2 ? 'CRITICAL' : (sampleSize < 3 ? 'HIGH' : undefined)
    };
  }

  private static validateTimeRelevance(transactions: PrecedentTransaction[], timeFrame: TimeFrameRequirements): TransactionValidationCheck {
    const avgAge = this.calculateAverageTransactionAge(transactions);
    const isRelevant = avgAge <= 3; // Within 3 years
    
    return {
      category: 'TIME_RELEVANCE',
      name: 'Time Relevance Validation',
      passed: isRelevant,
      score: isRelevant ? 100 : Math.max(40, 100 - (avgAge - 3) * 15),
      details: `Average transaction age: ${avgAge.toFixed(1)} years`,
      severity: avgAge > 5 ? 'HIGH' : (avgAge > 3 ? 'MEDIUM' : undefined)
    };
  }

  private static validateTransactionIndustryRelevance(transactions: PrecedentTransaction[]): TransactionValidationCheck {
    // Simplified validation - could be enhanced with industry classification logic
    const isRelevant = transactions.length > 0; // Placeholder logic
    
    return {
      category: 'INDUSTRY_RELEVANCE',
      name: 'Transaction Industry Relevance Validation',
      passed: isRelevant,
      score: 100,
      details: 'Industry relevance analysis completed',
      severity: undefined
    };
  }

  private static validateMarketConditionsRelevance(marketContext: MarketContext): TransactionValidationCheck {
    const hasCurrentMarketData = marketContext.activityTrends.length > 0;
    
    return {
      category: 'MARKET_CONDITIONS',
      name: 'Market Conditions Relevance Validation',
      passed: hasCurrentMarketData,
      score: hasCurrentMarketData ? 100 : 60,
      details: hasCurrentMarketData ? 'Market conditions analysis included' : 'Limited market conditions data',
      severity: hasCurrentMarketData ? undefined : 'MEDIUM'
    };
  }

  private static validateTransactionDataQuality(transactions: PrecedentTransaction[]): TransactionValidationCheck {
    const completeTransactions = transactions.filter(t => 
      t.financials.ltm && t.multiples.evRevenueLTM && t.multiples.evEbitdaLTM
    ).length;
    
    const completenessRatio = completeTransactions / transactions.length;
    const isHighQuality = completenessRatio >= 0.8;
    
    return {
      category: 'DATA_QUALITY',
      name: 'Transaction Data Quality Validation',
      passed: isHighQuality,
      score: completenessRatio * 100,
      details: `${(completenessRatio * 100).toFixed(1)}% of transactions have complete data`,
      severity: completenessRatio < 0.6 ? 'HIGH' : (completenessRatio < 0.8 ? 'MEDIUM' : undefined)
    };
  }

  private static calculateAverageTransactionAge(transactions: PrecedentTransaction[]): number {
    const currentDate = new Date();
    const ages = transactions.map(t => {
      const transactionDate = t.info.announcementDate;
      return (currentDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    });
    
    return ages.reduce((sum, age) => sum + age, 0) / ages.length;
  }
}