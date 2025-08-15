/**
 * Financial Terminology Dictionary for M&A Due Diligence
 * Comprehensive TypeScript interfaces and definitions for financial terms commonly used in M&A transactions
 */

/**
 * Core financial metrics and calculations used in M&A analysis
 */
export interface FinancialMetrics {
  /** Revenue metrics */
  revenue: RevenueMetrics;
  /** Profitability metrics */
  profitability: ProfitabilityMetrics;
  /** Cash flow metrics */
  cashFlow: CashFlowMetrics;
  /** Balance sheet metrics */
  balanceSheet: BalanceSheetMetrics;
  /** Valuation multiples */
  multiples: ValuationMultiples;
  /** Return metrics */
  returns: ReturnMetrics;
}

/**
 * Revenue-related financial metrics
 */
export interface RevenueMetrics {
  /** Total revenue/net sales */
  totalRevenue: number;
  /** Recurring revenue (for SaaS/subscription businesses) */
  recurringRevenue?: number;
  /** Annual Recurring Revenue */
  arr?: number;
  /** Monthly Recurring Revenue */
  mrr?: number;
  /** Revenue growth rate (year-over-year) */
  revenueGrowthRate: number;
  /** Compound Annual Growth Rate */
  cagr: number;
  /** Revenue per employee */
  revenuePerEmployee?: number;
  /** Customer acquisition cost */
  cac?: number;
  /** Customer lifetime value */
  ltv?: number;
  /** LTV/CAC ratio */
  ltvCacRatio?: number;
}

/**
 * Profitability metrics and margin calculations
 */
export interface ProfitabilityMetrics {
  /** Gross profit */
  grossProfit: number;
  /** Gross margin percentage */
  grossMargin: number;
  /** Earnings Before Interest, Taxes, Depreciation, and Amortization */
  ebitda: number;
  /** EBITDA margin percentage */
  ebitdaMargin: number;
  /** Normalized EBITDA (adjusted for one-time items) */
  normalizedEbitda: number;
  /** EBITDA add-backs and adjustments */
  ebitdaAddBacks: EbitdaAddBack[];
  /** Earnings Before Interest and Taxes */
  ebit: number;
  /** EBIT margin percentage */
  ebitMargin: number;
  /** Net income */
  netIncome: number;
  /** Net margin percentage */
  netMargin: number;
  /** Operating margin */
  operatingMargin: number;
}

/**
 * EBITDA add-backs and adjustments commonly seen in M&A
 */
export interface EbitdaAddBack {
  /** Type of add-back */
  type: EbitdaAddBackType;
  /** Amount of the adjustment */
  amount: number;
  /** Description/justification */
  description: string;
  /** Whether the add-back is considered reasonable */
  isReasonable: boolean;
  /** Supporting documentation */
  supportingDocs?: string[];
}

export type EbitdaAddBackType = 
  | 'ONE_TIME_LEGAL_FEES'
  | 'TRANSACTION_COSTS'
  | 'OWNER_COMPENSATION_ADJUSTMENT'
  | 'NON_RECURRING_EXPENSES'
  | 'RESTRUCTURING_COSTS'
  | 'MANAGEMENT_FEES'
  | 'STOCK_COMPENSATION'
  | 'SYNERGIES'
  | 'RENT_NORMALIZATION'
  | 'OTHER';

/**
 * Cash flow metrics and working capital analysis
 */
export interface CashFlowMetrics {
  /** Operating cash flow */
  operatingCashFlow: number;
  /** Free cash flow */
  freeCashFlow: number;
  /** Free cash flow margin */
  freeCashFlowMargin: number;
  /** Cash conversion cycle */
  cashConversionCycle: number;
  /** Working capital */
  workingCapital: number;
  /** Working capital as percentage of revenue */
  workingCapitalPercent: number;
  /** Capital expenditures */
  capex: number;
  /** Capex as percentage of revenue */
  capexPercent: number;
  /** Cash and cash equivalents */
  cash: number;
}

/**
 * Balance sheet metrics and leverage analysis
 */
export interface BalanceSheetMetrics {
  /** Total assets */
  totalAssets: number;
  /** Total debt */
  totalDebt: number;
  /** Net debt (total debt minus cash) */
  netDebt: number;
  /** Total equity */
  totalEquity: number;
  /** Debt-to-equity ratio */
  debtToEquity: number;
  /** Debt-to-EBITDA ratio */
  debtToEbitda: number;
  /** Net debt-to-EBITDA ratio */
  netDebtToEbitda: number;
  /** Interest coverage ratio */
  interestCoverageRatio: number;
  /** Current ratio */
  currentRatio: number;
  /** Quick ratio */
  quickRatio: number;
  /** Return on assets */
  roa: number;
  /** Return on equity */
  roe: number;
}

/**
 * Valuation multiples used in M&A analysis
 */
export interface ValuationMultiples {
  /** Enterprise value */
  enterpriseValue: number;
  /** Market capitalization (for public companies) */
  marketCap?: number;
  /** Enterprise value to revenue multiple */
  evRevenue: number;
  /** Enterprise value to EBITDA multiple */
  evEbitda: number;
  /** Price to earnings ratio */
  peRatio?: number;
  /** Price to book ratio */
  pbRatio?: number;
  /** Price to sales ratio */
  psRatio?: number;
  /** Enterprise value to EBIT multiple */
  evEbit: number;
}

/**
 * Return metrics for investment analysis
 */
export interface ReturnMetrics {
  /** Internal Rate of Return */
  irr?: number;
  /** Return on Investment */
  roi?: number;
  /** Multiple on Invested Capital (MOIC) */
  moic?: number;
  /** Return on Invested Capital */
  roic: number;
  /** Weighted Average Cost of Capital */
  wacc: number;
}

/**
 * Due diligence checklist items for financial analysis
 */
export interface FinancialDueDiligenceItem {
  /** Category of DD item */
  category: FinancialDDCategory;
  /** Item description */
  item: string;
  /** Priority level */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Status of review */
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED';
  /** Findings or notes */
  notes?: string;
  /** Supporting documents */
  documents?: string[];
}

export type FinancialDDCategory = 
  | 'HISTORICAL_FINANCIALS'
  | 'REVENUE_QUALITY'
  | 'COST_STRUCTURE'
  | 'WORKING_CAPITAL'
  | 'DEBT_ANALYSIS'
  | 'TAX_REVIEW'
  | 'MANAGEMENT_ACCOUNTS'
  | 'AUDIT_REPORTS'
  | 'PROJECTIONS_REVIEW'
  | 'CASH_FLOW_ANALYSIS';

/**
 * Letter of Intent (LOI) terms and structure
 */
export interface LetterOfIntent {
  /** Purchase price or valuation range */
  purchasePrice: PurchasePrice;
  /** Deal structure */
  dealStructure: DealStructureType;
  /** Payment terms */
  paymentTerms: PaymentTerms;
  /** Due diligence period */
  dueDiligencePeriod: number; // days
  /** Exclusivity period */
  exclusivityPeriod: number; // days
  /** Break-up fee */
  breakupFee?: number;
  /** Key terms and conditions */
  keyTerms: string[];
  /** Financing conditions */
  financingConditions?: string[];
  /** Material adverse change clause */
  macClause: boolean;
  /** Employee retention requirements */
  employeeRetention?: string[];
}

/**
 * Purchase price structure in M&A transactions
 */
export interface PurchasePrice {
  /** Base purchase price */
  basePrice: number;
  /** Working capital adjustment */
  workingCapitalAdjustment?: WorkingCapitalAdjustment;
  /** Cash and debt adjustment */
  cashDebtAdjustment: boolean;
  /** Earnout provisions */
  earnout?: EarnoutProvision;
  /** Escrow amount */
  escrowAmount?: number;
  /** Escrow release terms */
  escrowTerms?: string;
}

export type DealStructureType = 
  | 'ASSET_PURCHASE'
  | 'STOCK_PURCHASE'
  | 'MERGER'
  | 'RECAPITALIZATION';

/**
 * Payment terms structure
 */
export interface PaymentTerms {
  /** Cash at closing */
  cashAtClosing: number;
  /** Seller financing */
  sellerFinancing?: SellerFinancing;
  /** Buyer financing */
  buyerFinancing?: BuyerFinancing;
  /** Earnout payments */
  earnoutPayments?: EarnoutPayment[];
}

/**
 * Working capital adjustment mechanism
 */
export interface WorkingCapitalAdjustment {
  /** Target working capital amount */
  targetAmount: number;
  /** Adjustment threshold (collar) */
  threshold: number;
  /** Dollar-for-dollar adjustment above/below threshold */
  dollarForDollar: boolean;
}

/**
 * Earnout provision structure
 */
export interface EarnoutProvision {
  /** Maximum earnout amount */
  maxAmount: number;
  /** Performance metrics */
  metrics: EarnoutMetric[];
  /** Performance period */
  periodYears: number;
  /** Payment schedule */
  paymentSchedule: 'ANNUAL' | 'AT_END' | 'MILESTONE_BASED';
}

/**
 * Earnout performance metric
 */
export interface EarnoutMetric {
  /** Type of metric */
  type: EarnoutMetricType;
  /** Target value */
  target: number;
  /** Weighting in earnout calculation */
  weight: number;
  /** Minimum threshold */
  threshold?: number;
  /** Maximum cap */
  cap?: number;
}

export type EarnoutMetricType = 
  | 'REVENUE'
  | 'EBITDA'
  | 'NET_INCOME'
  | 'CUSTOMER_METRICS'
  | 'PRODUCT_MILESTONES'
  | 'OTHER';

/**
 * Seller financing terms
 */
export interface SellerFinancing {
  /** Principal amount */
  principalAmount: number;
  /** Interest rate */
  interestRate: number;
  /** Term in years */
  termYears: number;
  /** Payment schedule */
  paymentSchedule: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'BULLET';
  /** Security/collateral */
  security?: string;
}

/**
 * Buyer financing structure
 */
export interface BuyerFinancing {
  /** Type of financing */
  type: BuyerFinancingType;
  /** Amount */
  amount: number;
  /** Terms and conditions */
  terms: string[];
  /** Financing contingency */
  contingency: boolean;
}

export type BuyerFinancingType = 
  | 'BANK_DEBT'
  | 'SBA_LOAN'
  | 'PRIVATE_EQUITY'
  | 'MEZZANINE'
  | 'BONDS'
  | 'INTERNAL_CASH';

/**
 * Earnout payment structure
 */
export interface EarnoutPayment {
  /** Payment date */
  paymentDate: Date;
  /** Amount or calculation method */
  amount: number | string;
  /** Conditions for payment */
  conditions: string[];
}

/**
 * Stock Purchase Agreement (SPA) key terms
 */
export interface StockPurchaseAgreement {
  /** Purchase price allocation */
  priceAllocation: PriceAllocation;
  /** Representations and warranties */
  repsAndWarranties: RepresentationWarranty[];
  /** Indemnification terms */
  indemnification: IndemnificationTerms;
  /** Closing conditions */
  closingConditions: ClosingCondition[];
  /** Post-closing covenants */
  postClosingCovenants: string[];
  /** Survival periods */
  survivalPeriods: SurvivalPeriod[];
}

/**
 * Purchase price allocation for tax purposes
 */
export interface PriceAllocation {
  /** Tangible assets */
  tangibleAssets: number;
  /** Intangible assets */
  intangibleAssets: IntangibleAssetAllocation[];
  /** Goodwill */
  goodwill: number;
  /** Total allocation */
  totalAllocation: number;
}

/**
 * Intangible asset allocation
 */
export interface IntangibleAssetAllocation {
  /** Asset type */
  assetType: IntangibleAssetType;
  /** Allocated value */
  value: number;
  /** Useful life for amortization */
  usefulLife: number;
}

export type IntangibleAssetType = 
  | 'CUSTOMER_RELATIONSHIPS'
  | 'BRAND_NAME'
  | 'TECHNOLOGY'
  | 'NON_COMPETE_AGREEMENTS'
  | 'PATENTS'
  | 'TRADEMARKS'
  | 'OTHER';

/**
 * Representation and warranty
 */
export interface RepresentationWarranty {
  /** Category */
  category: RepWarrantyCategory;
  /** Description */
  description: string;
  /** Materiality threshold */
  materialityThreshold?: number;
  /** Knowledge qualifier */
  knowledgeQualifier: boolean;
  /** Survival period */
  survivalPeriod: number; // months
}

export type RepWarrantyCategory = 
  | 'CORPORATE_MATTERS'
  | 'FINANCIAL_STATEMENTS'
  | 'NO_MATERIAL_ADVERSE_CHANGE'
  | 'CONTRACTS'
  | 'LITIGATION'
  | 'COMPLIANCE'
  | 'INTELLECTUAL_PROPERTY'
  | 'EMPLOYEE_MATTERS'
  | 'ENVIRONMENTAL'
  | 'TAX_MATTERS';

/**
 * Indemnification terms
 */
export interface IndemnificationTerms {
  /** Indemnification cap */
  cap: number;
  /** Deductible/basket */
  deductible: number;
  /** Survival period */
  survivalPeriod: number; // months
  /** Escrow fund amount */
  escrowFund: number;
  /** Special indemnities */
  specialIndemnities: SpecialIndemnity[];
}

/**
 * Special indemnity provision
 */
export interface SpecialIndemnity {
  /** Subject matter */
  subject: string;
  /** Cap amount (if different from general cap) */
  cap?: number;
  /** Survival period (if different from general) */
  survivalPeriod?: number;
}

/**
 * Closing condition
 */
export interface ClosingCondition {
  /** Condition description */
  description: string;
  /** Party responsible */
  responsibleParty: 'BUYER' | 'SELLER' | 'BOTH';
  /** Waivable by buyer */
  waivableByBuyer: boolean;
  /** Waivable by seller */
  waivableBySeller: boolean;
}

/**
 * Survival period for different categories
 */
export interface SurvivalPeriod {
  /** Category */
  category: RepWarrantyCategory;
  /** Period in months */
  periodMonths: number;
  /** Special provisions */
  specialProvisions?: string;
}

/**
 * Financial calculation utilities
 */
export class FinancialCalculators {
  /**
   * Calculate Enterprise Value
   */
  static calculateEnterpriseValue(marketCap: number, totalDebt: number, cash: number): number {
    return marketCap + totalDebt - cash;
  }

  /**
   * Calculate Free Cash Flow
   */
  static calculateFreeCashFlow(operatingCashFlow: number, capex: number): number {
    return operatingCashFlow - capex;
  }

  /**
   * Calculate EBITDA from financial data
   */
  static calculateEBITDA(netIncome: number, interest: number, taxes: number, 
                        depreciation: number, amortization: number): number {
    return netIncome + interest + taxes + depreciation + amortization;
  }

  /**
   * Calculate debt-to-EBITDA ratio
   */
  static calculateDebtToEBITDA(totalDebt: number, ebitda: number): number {
    return ebitda > 0 ? totalDebt / ebitda : Infinity;
  }

  /**
   * Calculate working capital
   */
  static calculateWorkingCapital(currentAssets: number, currentLiabilities: number): number {
    return currentAssets - currentLiabilities;
  }

  /**
   * Calculate LTV/CAC ratio
   */
  static calculateLTVCACRatio(ltv: number, cac: number): number {
    return cac > 0 ? ltv / cac : Infinity;
  }

  /**
   * Calculate compound annual growth rate
   */
  static calculateCAGR(beginningValue: number, endingValue: number, years: number): number {
    return Math.pow(endingValue / beginningValue, 1 / years) - 1;
  }

  /**
   * Calculate return on invested capital
   */
  static calculateROIC(nopat: number, investedCapital: number): number {
    return investedCapital > 0 ? nopat / investedCapital : 0;
  }

  /**
   * Validate EBITDA add-backs reasonableness
   */
  static validateEBITDAAddBacks(addBacks: EbitdaAddBack[], totalEBITDA: number): {
    totalAddBacks: number;
    addBackPercentage: number;
    isReasonable: boolean;
    flags: string[];
  } {
    const totalAddBacks = addBacks.reduce((sum, addBack) => sum + addBack.amount, 0);
    const addBackPercentage = totalEBITDA > 0 ? (totalAddBacks / totalEBITDA) * 100 : 0;
    
    const flags: string[] = [];
    if (addBackPercentage > 20) {
      flags.push('Add-backs exceed 20% of EBITDA - requires careful scrutiny');
    }
    
    const unreasonableAddBacks = addBacks.filter(ab => !ab.isReasonable);
    if (unreasonableAddBacks.length > 0) {
      flags.push(`${unreasonableAddBacks.length} add-backs appear unreasonable`);
    }

    return {
      totalAddBacks,
      addBackPercentage,
      isReasonable: addBackPercentage <= 20 && unreasonableAddBacks.length === 0,
      flags
    };
  }
}

/**
 * Common financial terms glossary
 */
export const FINANCIAL_TERMS_GLOSSARY: Record<string, string> = {
  'EBITDA': 'Earnings Before Interest, Taxes, Depreciation, and Amortization - a measure of company profitability',
  'Enterprise Value': 'Total value of a company including debt, calculated as market cap plus debt minus cash',
  'Free Cash Flow': 'Operating cash flow minus capital expenditures - cash available for distribution',
  'Working Capital': 'Current assets minus current liabilities - measure of short-term liquidity',
  'ROIC': 'Return on Invested Capital - measure of how efficiently capital is deployed',
  'LTV': 'Lifetime Value - total revenue expected from a customer over their lifetime',
  'CAC': 'Customer Acquisition Cost - cost to acquire a new customer',
  'ARR': 'Annual Recurring Revenue - predictable revenue from subscriptions',
  'MRR': 'Monthly Recurring Revenue - monthly subscription revenue',
  'CAGR': 'Compound Annual Growth Rate - average annual growth rate over multiple years',
  'IRR': 'Internal Rate of Return - rate of return that makes NPV equal to zero',
  'MOIC': 'Multiple on Invested Capital - total value received divided by total value invested',
  'SPA': 'Stock Purchase Agreement - legal document outlining terms of stock acquisition',
  'LOI': 'Letter of Intent - non-binding document outlining key deal terms',
  'MAC': 'Material Adverse Change - significant negative change in business condition',
  'Earnout': 'Additional payment based on future performance metrics',
  'Escrow': 'Funds held by third party to secure representations and warranties'
};