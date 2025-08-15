/**
 * Deal Structure Templates for M&A Transactions
 * Comprehensive templates and frameworks for asset purchase, stock purchase, and merger structures
 */

import { FinancialMetrics } from './financial-terms';

/**
 * Base deal structure interface
 */
export interface DealStructure {
  /** Deal structure type */
  structureType: DealStructureType;
  /** Deal overview */
  dealOverview: DealOverview;
  /** Transaction terms */
  transactionTerms: TransactionTerms;
  /** Legal structure */
  legalStructure: LegalStructure;
  /** Tax implications */
  taxImplications: TaxImplications;
  /** Risk allocation */
  riskAllocation: RiskAllocation;
  /** Closing conditions */
  closingConditions: ClosingCondition[];
  /** Post-closing obligations */
  postClosingObligations: PostClosingObligation[];
}

export type DealStructureType = 
  | 'ASSET_PURCHASE'
  | 'STOCK_PURCHASE'
  | 'MERGER'
  | 'RECAPITALIZATION'
  | 'JOINT_VENTURE'
  | 'MANAGEMENT_BUYOUT'
  | 'LEVERAGED_BUYOUT'
  | 'ROLLUP'
  | 'SPIN_OFF'
  | 'CARVE_OUT';

/**
 * Deal overview information
 */
export interface DealOverview {
  /** Transaction rationale */
  rationale: TransactionRationale;
  /** Strategic objectives */
  strategicObjectives: string[];
  /** Target company information */
  targetInfo: TargetCompanyInfo;
  /** Acquirer information */
  acquirerInfo: AcquirerInfo;
  /** Transaction size */
  transactionSize: TransactionSize;
  /** Timeline */
  timeline: TransactionTimeline;
}

export type TransactionRationale = 
  | 'HORIZONTAL_INTEGRATION'
  | 'VERTICAL_INTEGRATION'
  | 'MARKET_EXPANSION'
  | 'PRODUCT_DIVERSIFICATION'
  | 'TECHNOLOGY_ACQUISITION'
  | 'TALENT_ACQUISITION'
  | 'COST_SYNERGIES'
  | 'REVENUE_SYNERGIES'
  | 'FINANCIAL_ENGINEERING'
  | 'DEFENSIVE'
  | 'DISTRESSED_ACQUISITION';

/**
 * Target company information
 */
export interface TargetCompanyInfo {
  /** Company name */
  name: string;
  /** Industry */
  industry: string;
  /** Business description */
  businessDescription: string;
  /** Financial highlights */
  financialHighlights: FinancialHighlights;
  /** Key assets */
  keyAssets: Asset[];
  /** Employee count */
  employeeCount: number;
  /** Geographic presence */
  geographicPresence: string[];
  /** Ownership structure */
  ownershipStructure: OwnershipStructure;
}

/**
 * Financial highlights
 */
export interface FinancialHighlights {
  /** Last twelve months revenue */
  ltmRevenue: number;
  /** Last twelve months EBITDA */
  ltmEbitda: number;
  /** Revenue growth rate */
  revenueGrowth: number;
  /** EBITDA margin */
  ebitdaMargin: number;
  /** Enterprise value */
  enterpriseValue: number;
  /** Net debt */
  netDebt: number;
}

/**
 * Asset information
 */
export interface Asset {
  /** Asset type */
  type: AssetType;
  /** Asset description */
  description: string;
  /** Book value */
  bookValue: number;
  /** Fair market value */
  fairMarketValue: number;
  /** Strategic importance */
  strategicImportance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type AssetType = 
  | 'REAL_ESTATE'
  | 'EQUIPMENT'
  | 'INTELLECTUAL_PROPERTY'
  | 'INTANGIBLE_ASSETS'
  | 'INVENTORY'
  | 'ACCOUNTS_RECEIVABLE'
  | 'INVESTMENTS'
  | 'CASH'
  | 'OTHER';

/**
 * Ownership structure
 */
export interface OwnershipStructure {
  /** Ownership type */
  type: 'PRIVATE_EQUITY' | 'FAMILY_OWNED' | 'PUBLIC' | 'MANAGEMENT_OWNED' | 'INSTITUTIONAL';
  /** Key shareholders */
  keyShareholders: Shareholder[];
  /** Management ownership percentage */
  managementOwnership: number;
  /** Employee ownership percentage */
  employeeOwnership: number;
}

/**
 * Shareholder information
 */
export interface Shareholder {
  /** Shareholder name */
  name: string;
  /** Ownership percentage */
  ownershipPercentage: number;
  /** Shareholder type */
  type: 'FOUNDER' | 'INVESTOR' | 'MANAGEMENT' | 'EMPLOYEE' | 'INSTITUTIONAL' | 'OTHER';
  /** Voting rights */
  votingRights: number;
}

/**
 * Acquirer information
 */
export interface AcquirerInfo {
  /** Acquirer name */
  name: string;
  /** Acquirer type */
  type: AcquirerType;
  /** Industry */
  industry: string;
  /** Financial capacity */
  financialCapacity: FinancialCapacity;
  /** Strategic fit */
  strategicFit: StrategicFit;
  /** Integration experience */
  integrationExperience: IntegrationExperience;
}

export type AcquirerType = 
  | 'STRATEGIC_BUYER'
  | 'FINANCIAL_BUYER'
  | 'PRIVATE_EQUITY'
  | 'VENTURE_CAPITAL'
  | 'HEDGE_FUND'
  | 'SOVEREIGN_WEALTH_FUND'
  | 'PENSION_FUND'
  | 'FAMILY_OFFICE'
  | 'MANAGEMENT_TEAM';

/**
 * Financial capacity
 */
export interface FinancialCapacity {
  /** Available cash */
  availableCash: number;
  /** Debt capacity */
  debtCapacity: number;
  /** Equity capacity */
  equityCapacity: number;
  /** Total financing capacity */
  totalCapacity: number;
  /** Credit rating */
  creditRating?: string;
  /** Cost of capital */
  costOfCapital: number;
}

/**
 * Strategic fit assessment
 */
export interface StrategicFit {
  /** Market overlap */
  marketOverlap: number;
  /** Customer overlap */
  customerOverlap: number;
  /** Product synergies */
  productSynergies: string[];
  /** Technology synergies */
  technologySynergies: string[];
  /** Operational synergies */
  operationalSynergies: string[];
  /** Cultural fit */
  culturalFit: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

/**
 * Integration experience
 */
export interface IntegrationExperience {
  /** Number of previous acquisitions */
  previousAcquisitions: number;
  /** Average acquisition size */
  averageAcquisitionSize: number;
  /** Integration success rate */
  integrationSuccessRate: number;
  /** Time to integration */
  averageIntegrationTime: number;
  /** Key learnings */
  keyLearnings: string[];
}

/**
 * Transaction size and metrics
 */
export interface TransactionSize {
  /** Total transaction value */
  totalValue: number;
  /** Enterprise value */
  enterpriseValue: number;
  /** Equity value */
  equityValue: number;
  /** Valuation multiples */
  valuationMultiples: {
    evRevenue: number;
    evEbitda: number;
    priceEarnings?: number;
    priceBook?: number;
  };
  /** Premium paid */
  premium?: number;
}

/**
 * Transaction timeline
 */
export interface TransactionTimeline {
  /** Process start date */
  processStart: Date;
  /** LOI execution */
  loiExecution: Date;
  /** Due diligence period */
  dueDiligencePeriod: number; // days
  /** Expected closing */
  expectedClosing: Date;
  /** Key milestones */
  keyMilestones: Milestone[];
}

/**
 * Milestone in transaction timeline
 */
export interface Milestone {
  /** Milestone name */
  name: string;
  /** Target date */
  targetDate: Date;
  /** Responsible party */
  responsibleParty: string;
  /** Status */
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  /** Dependencies */
  dependencies: string[];
}

/**
 * Transaction terms
 */
export interface TransactionTerms {
  /** Purchase price */
  purchasePrice: PurchasePrice;
  /** Payment structure */
  paymentStructure: PaymentStructure;
  /** Adjustment mechanisms */
  adjustmentMechanisms: AdjustmentMechanism[];
  /** Financing structure */
  financingStructure: FinancingStructure;
  /** Conditions precedent */
  conditionsPrecedent: ConditionPrecedent[];
}

/**
 * Purchase price structure
 */
export interface PurchasePrice {
  /** Base purchase price */
  basePrice: number;
  /** Price determination method */
  determinationMethod: PriceDeterminationMethod;
  /** Valuation basis */
  valuationBasis: ValuationBasis;
  /** Price adjustments */
  priceAdjustments: PriceAdjustment[];
  /** Earnout provisions */
  earnoutProvisions?: EarnoutProvision[];
}

export type PriceDeterminationMethod = 
  | 'FIXED_PRICE'
  | 'FORMULA_BASED'
  | 'AUCTION_PROCESS'
  | 'NEGOTIATED'
  | 'APPRAISAL_BASED'
  | 'MARKET_BASED';

export type ValuationBasis = 
  | 'ENTERPRISE_VALUE'
  | 'EQUITY_VALUE'
  | 'ASSET_VALUE'
  | 'LIQUIDATION_VALUE'
  | 'GOING_CONCERN_VALUE';

/**
 * Price adjustment mechanism
 */
export interface PriceAdjustment {
  /** Adjustment type */
  type: PriceAdjustmentType;
  /** Calculation method */
  calculationMethod: string;
  /** Dollar limit */
  dollarLimit?: number;
  /** Threshold */
  threshold?: number;
  /** Effective date */
  effectiveDate: Date;
}

export type PriceAdjustmentType = 
  | 'WORKING_CAPITAL'
  | 'CASH_DEBT'
  | 'CAPITAL_EXPENDITURE'
  | 'INVENTORY'
  | 'EARNOUT'
  | 'INDEMNIFICATION'
  | 'TAX_ADJUSTMENT'
  | 'REGULATORY_ADJUSTMENT';

/**
 * Earnout provision
 */
export interface EarnoutProvision {
  /** Maximum earnout amount */
  maxAmount: number;
  /** Performance period */
  performancePeriod: number; // years
  /** Performance metrics */
  performanceMetrics: PerformanceMetric[];
  /** Payment schedule */
  paymentSchedule: EarnoutPaymentSchedule;
  /** Calculation methodology */
  calculationMethodology: string;
  /** Dispute resolution */
  disputeResolution: string;
}

/**
 * Performance metric for earnout
 */
export interface PerformanceMetric {
  /** Metric type */
  type: PerformanceMetricType;
  /** Target value */
  targetValue: number;
  /** Threshold value */
  thresholdValue: number;
  /** Maximum value */
  maximumValue: number;
  /** Weighting */
  weighting: number;
  /** Calculation period */
  calculationPeriod: 'ANNUAL' | 'CUMULATIVE' | 'QUARTERLY';
}

export type PerformanceMetricType = 
  | 'REVENUE'
  | 'EBITDA'
  | 'NET_INCOME'
  | 'GROSS_MARGIN'
  | 'CUSTOMER_COUNT'
  | 'RECURRING_REVENUE'
  | 'PRODUCT_MILESTONE'
  | 'REGULATORY_MILESTONE'
  | 'INTEGRATION_MILESTONE'
  | 'CUSTOM_METRIC';

export type EarnoutPaymentSchedule = 
  | 'ANNUAL'
  | 'CUMULATIVE'
  | 'MILESTONE_BASED'
  | 'CLIFF_VESTING'
  | 'GRADED_VESTING';

/**
 * Payment structure
 */
export interface PaymentStructure {
  /** Cash component */
  cashComponent: CashComponent;
  /** Stock component */
  stockComponent?: StockComponent;
  /** Debt assumption */
  debtAssumption?: DebtAssumption;
  /** Seller financing */
  sellerFinancing?: SellerFinancing;
  /** Contingent payments */
  contingentPayments?: ContingentPayment[];
}

/**
 * Cash component of payment
 */
export interface CashComponent {
  /** Amount */
  amount: number;
  /** Percentage of total consideration */
  percentage: number;
  /** Source of funds */
  sourceOfFunds: FundingSource[];
  /** Payment timing */
  paymentTiming: PaymentTiming;
  /** Escrow arrangements */
  escrowArrangements?: EscrowArrangement[];
}

/**
 * Funding source
 */
export interface FundingSource {
  /** Source type */
  type: FundingSourceType;
  /** Amount */
  amount: number;
  /** Terms */
  terms: FundingTerms;
  /** Conditions */
  conditions: string[];
}

export type FundingSourceType = 
  | 'INTERNAL_CASH'
  | 'BANK_DEBT'
  | 'BOND_FINANCING'
  | 'EQUITY_RAISE'
  | 'MEZZANINE_DEBT'
  | 'SELLER_FINANCING'
  | 'EARNOUT'
  | 'ASSET_BASED_LENDING';

/**
 * Funding terms
 */
export interface FundingTerms {
  /** Interest rate */
  interestRate?: number;
  /** Term length */
  termLength?: number;
  /** Covenants */
  covenants?: string[];
  /** Security */
  security?: string;
  /** Guarantees */
  guarantees?: string[];
}

export type PaymentTiming = 
  | 'AT_CLOSING'
  | 'DEFERRED'
  | 'INSTALLMENTS'
  | 'MILESTONE_BASED'
  | 'PERFORMANCE_BASED';

/**
 * Escrow arrangement
 */
export interface EscrowArrangement {
  /** Purpose */
  purpose: EscrowPurpose;
  /** Amount */
  amount: number;
  /** Term */
  termMonths: number;
  /** Release conditions */
  releaseConditions: string[];
  /** Dispute resolution */
  disputeResolution: string;
}

export type EscrowPurpose = 
  | 'GENERAL_INDEMNITY'
  | 'TAX_INDEMNITY'
  | 'ENVIRONMENTAL_INDEMNITY'
  | 'WORKING_CAPITAL_ADJUSTMENT'
  | 'EARNOUT_SECURITY'
  | 'REGULATORY_MATTERS';

/**
 * Stock component of payment
 */
export interface StockComponent {
  /** Amount */
  amount: number;
  /** Percentage of total consideration */
  percentage: number;
  /** Stock type */
  stockType: StockType;
  /** Exchange ratio */
  exchangeRatio?: number;
  /** Collar provisions */
  collarProvisions?: CollarProvision;
  /** Lock-up provisions */
  lockUpProvisions?: LockUpProvision[];
}

export type StockType = 
  | 'COMMON_STOCK'
  | 'PREFERRED_STOCK'
  | 'CONVERTIBLE_PREFERRED'
  | 'WARRANT'
  | 'OPTION'
  | 'PHANTOM_EQUITY';

/**
 * Collar provision for stock deals
 */
export interface CollarProvision {
  /** Collar type */
  type: 'FIXED' | 'FLOATING' | 'HYBRID';
  /** Floor price */
  floorPrice: number;
  /** Ceiling price */
  ceilingPrice: number;
  /** Reference period */
  referencePeriod: number; // days
  /** Walk-away rights */
  walkAwayRights: boolean;
}

/**
 * Lock-up provision
 */
export interface LockUpProvision {
  /** Applicable shareholders */
  applicableShareholders: string[];
  /** Lock-up period */
  lockUpPeriod: number; // months
  /** Release schedule */
  releaseSchedule: ReleaseSchedule[];
  /** Exceptions */
  exceptions: string[];
}

/**
 * Release schedule for lock-up
 */
export interface ReleaseSchedule {
  /** Release date */
  releaseDate: Date;
  /** Release percentage */
  releasePercentage: number;
  /** Conditions */
  conditions: string[];
}

/**
 * Debt assumption
 */
export interface DebtAssumption {
  /** Total debt assumed */
  totalDebtAssumed: number;
  /** Debt details */
  debtDetails: DebtDetail[];
  /** Guarantees */
  guarantees: string[];
  /** Covenant modifications */
  covenantModifications: string[];
}

/**
 * Debt detail
 */
export interface DebtDetail {
  /** Debt type */
  type: string;
  /** Principal amount */
  principalAmount: number;
  /** Interest rate */
  interestRate: number;
  /** Maturity date */
  maturityDate: Date;
  /** Security */
  security: string;
  /** Transferability */
  transferable: boolean;
}

/**
 * Seller financing
 */
export interface SellerFinancing {
  /** Principal amount */
  principalAmount: number;
  /** Interest rate */
  interestRate: number;
  /** Term */
  termYears: number;
  /** Payment schedule */
  paymentSchedule: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'BULLET';
  /** Security */
  security: string;
  /** Subordination */
  subordination: boolean;
  /** Prepayment terms */
  prepaymentTerms: PrepaymentTerms;
}

/**
 * Prepayment terms
 */
export interface PrepaymentTerms {
  /** Prepayment allowed */
  prepaymentAllowed: boolean;
  /** Prepayment penalty */
  prepaymentPenalty?: number;
  /** Minimum prepayment amount */
  minimumPrepaymentAmount?: number;
  /** Notice period */
  noticePeriod?: number; // days
}

/**
 * Contingent payment
 */
export interface ContingentPayment {
  /** Payment type */
  type: ContingentPaymentType;
  /** Maximum amount */
  maxAmount: number;
  /** Trigger events */
  triggerEvents: string[];
  /** Payment timing */
  paymentTiming: string;
  /** Calculation method */
  calculationMethod: string;
}

export type ContingentPaymentType = 
  | 'EARNOUT'
  | 'MILESTONE_PAYMENT'
  | 'REGULATORY_PAYMENT'
  | 'PERFORMANCE_BONUS'
  | 'RETENTION_BONUS'
  | 'SUCCESS_FEE';

/**
 * Legal structure
 */
export interface LegalStructure {
  /** Transaction structure */
  transactionStructure: TransactionStructureDetail;
  /** Corporate structure */
  corporateStructure: CorporateStructure;
  /** Governance structure */
  governanceStructure: GovernanceStructure;
  /** Legal entities */
  legalEntities: LegalEntity[];
}

/**
 * Transaction structure detail
 */
export interface TransactionStructureDetail {
  /** Structure type */
  structureType: DealStructureType;
  /** Subsidiaries included */
  subsidiariesIncluded: string[];
  /** Assets included */
  assetsIncluded: AssetInclusion[];
  /** Liabilities assumed */
  liabilitiesAssumed: LiabilityAssumption[];
  /** Excluded items */
  excludedItems: ExcludedItem[];
}

/**
 * Asset inclusion
 */
export interface AssetInclusion {
  /** Asset description */
  assetDescription: string;
  /** Book value */
  bookValue: number;
  /** Allocation value */
  allocationValue: number;
  /** Transfer method */
  transferMethod: string;
  /** Conditions */
  conditions: string[];
}

/**
 * Liability assumption
 */
export interface LiabilityAssumption {
  /** Liability description */
  liabilityDescription: string;
  /** Amount */
  amount: number;
  /** Assumption conditions */
  assumptionConditions: string[];
  /** Indemnification */
  indemnification: boolean;
}

/**
 * Excluded item
 */
export interface ExcludedItem {
  /** Item description */
  itemDescription: string;
  /** Reason for exclusion */
  exclusionReason: string;
  /** Disposition plan */
  dispositionPlan: string;
}

/**
 * Corporate structure
 */
export interface CorporateStructure {
  /** Post-closing structure */
  postClosingStructure: string;
  /** Surviving entity */
  survivingEntity: string;
  /** Dissolved entities */
  dissolvedEntities: string[];
  /** New entities created */
  newEntitiesCreated: NewEntity[];
}

/**
 * New entity
 */
export interface NewEntity {
  /** Entity name */
  entityName: string;
  /** Entity type */
  entityType: string;
  /** Jurisdiction */
  jurisdiction: string;
  /** Purpose */
  purpose: string;
  /** Ownership structure */
  ownershipStructure: string;
}

/**
 * Governance structure
 */
export interface GovernanceStructure {
  /** Board composition */
  boardComposition: BoardComposition;
  /** Management structure */
  managementStructure: ManagementStructure;
  /** Decision-making process */
  decisionMakingProcess: DecisionMakingProcess;
  /** Reporting requirements */
  reportingRequirements: string[];
}

/**
 * Board composition
 */
export interface BoardComposition {
  /** Total board seats */
  totalSeats: number;
  /** Acquirer representatives */
  acquirerRepresentatives: number;
  /** Seller representatives */
  sellerRepresentatives?: number;
  /** Independent directors */
  independentDirectors: number;
  /** Management representatives */
  managementRepresentatives: number;
  /** Board committees */
  boardCommittees: BoardCommittee[];
}

/**
 * Board committee
 */
export interface BoardCommittee {
  /** Committee name */
  name: string;
  /** Committee purpose */
  purpose: string;
  /** Committee composition */
  composition: string;
  /** Meeting frequency */
  meetingFrequency: string;
}

/**
 * Management structure
 */
export interface ManagementStructure {
  /** CEO */
  ceo: ManagementPosition;
  /** Key management positions */
  keyPositions: ManagementPosition[];
  /** Employment agreements */
  employmentAgreements: EmploymentAgreement[];
  /** Retention arrangements */
  retentionArrangements: RetentionArrangement[];
}

/**
 * Management position
 */
export interface ManagementPosition {
  /** Position title */
  title: string;
  /** Incumbent name */
  incumbentName: string;
  /** Reporting relationship */
  reportsTo: string;
  /** Key responsibilities */
  keyResponsibilities: string[];
  /** Performance metrics */
  performanceMetrics: string[];
}

/**
 * Employment agreement
 */
export interface EmploymentAgreement {
  /** Employee name */
  employeeName: string;
  /** Position */
  position: string;
  /** Term */
  termYears: number;
  /** Base salary */
  baseSalary: number;
  /** Bonus structure */
  bonusStructure: BonusStructure;
  /** Termination provisions */
  terminationProvisions: TerminationProvision[];
  /** Non-compete restrictions */
  nonCompeteRestrictions: NonCompeteRestriction;
}

/**
 * Bonus structure
 */
export interface BonusStructure {
  /** Target bonus percentage */
  targetBonusPercentage: number;
  /** Performance metrics */
  performanceMetrics: string[];
  /** Payment timing */
  paymentTiming: string;
  /** Minimum/maximum payouts */
  payoutRange: [number, number];
}

/**
 * Termination provision
 */
export interface TerminationProvision {
  /** Termination type */
  type: TerminationType;
  /** Notice period */
  noticePeriod: number; // months
  /** Severance payment */
  severancePayment: number;
  /** Benefit continuation */
  benefitContinuation: number; // months
  /** Restrictive covenant enforcement */
  restrictiveCovenantEnforcement: boolean;
}

export type TerminationType = 
  | 'TERMINATION_FOR_CAUSE'
  | 'TERMINATION_WITHOUT_CAUSE'
  | 'RESIGNATION_FOR_GOOD_REASON'
  | 'RESIGNATION_WITHOUT_REASON'
  | 'CHANGE_IN_CONTROL'
  | 'DEATH_OR_DISABILITY';

/**
 * Non-compete restriction
 */
export interface NonCompeteRestriction {
  /** Duration */
  durationMonths: number;
  /** Geographic scope */
  geographicScope: string;
  /** Industry scope */
  industryScope: string;
  /** Customer restrictions */
  customerRestrictions: string;
  /** Employee solicitation restrictions */
  employeeSolicitationRestrictions: string;
}

/**
 * Retention arrangement
 */
export interface RetentionArrangement {
  /** Employee name */
  employeeName: string;
  /** Retention bonus amount */
  retentionBonusAmount: number;
  /** Vesting schedule */
  vestingSchedule: VestingSchedule[];
  /** Performance requirements */
  performanceRequirements: string[];
  /** Clawback provisions */
  clawbackProvisions: string[];
}

/**
 * Vesting schedule
 */
export interface VestingSchedule {
  /** Vesting date */
  vestingDate: Date;
  /** Vesting percentage */
  vestingPercentage: number;
  /** Conditions */
  conditions: string[];
}

/**
 * Decision-making process
 */
export interface DecisionMakingProcess {
  /** Ordinary decisions */
  ordinaryDecisions: DecisionProcess;
  /** Special decisions */
  specialDecisions: SpecialDecision[];
  /** Approval thresholds */
  approvalThresholds: ApprovalThreshold[];
  /** Dispute resolution */
  disputeResolution: string;
}

/**
 * Decision process
 */
export interface DecisionProcess {
  /** Decision maker */
  decisionMaker: string;
  /** Approval requirement */
  approvalRequirement: string;
  /** Voting threshold */
  votingThreshold: number;
  /** Notice requirements */
  noticeRequirements: string;
}

/**
 * Special decision
 */
export interface SpecialDecision {
  /** Decision category */
  category: string;
  /** Approval requirement */
  approvalRequirement: string;
  /** Special voting threshold */
  specialVotingThreshold: number;
  /** Additional conditions */
  additionalConditions: string[];
}

/**
 * Approval threshold
 */
export interface ApprovalThreshold {
  /** Dollar threshold */
  dollarThreshold: number;
  /** Decision category */
  decisionCategory: string;
  /** Required approver */
  requiredApprover: string;
  /** Process requirements */
  processRequirements: string[];
}

/**
 * Legal entity information
 */
export interface LegalEntity {
  /** Entity name */
  entityName: string;
  /** Entity type */
  entityType: EntityType;
  /** Jurisdiction */
  jurisdiction: string;
  /** Role in transaction */
  roleInTransaction: string;
  /** Ownership structure */
  ownershipStructure: EntityOwnership[];
  /** Key contracts */
  keyContracts: string[];
}

export type EntityType = 
  | 'CORPORATION'
  | 'LLC'
  | 'PARTNERSHIP'
  | 'LIMITED_PARTNERSHIP'
  | 'TRUST'
  | 'HOLDING_COMPANY'
  | 'SUBSIDIARY'
  | 'FOREIGN_ENTITY';

/**
 * Entity ownership
 */
export interface EntityOwnership {
  /** Owner name */
  ownerName: string;
  /** Ownership percentage */
  ownershipPercentage: number;
  /** Ownership type */
  ownershipType: string;
  /** Voting rights */
  votingRights: number;
}

/**
 * Tax implications
 */
export interface TaxImplications {
  /** Buyer tax implications */
  buyerTaxImplications: TaxImplication[];
  /** Seller tax implications */
  sellerTaxImplications: TaxImplication[];
  /** Transaction tax structure */
  transactionTaxStructure: TransactionTaxStructure;
  /** Tax elections */
  taxElections: TaxElection[];
  /** Tax indemnification */
  taxIndemnification: TaxIndemnification;
}

/**
 * Tax implication
 */
export interface TaxImplication {
  /** Tax type */
  taxType: TaxType;
  /** Estimated amount */
  estimatedAmount: number;
  /** Timing */
  timing: string;
  /** Mitigation strategies */
  mitigationStrategies: string[];
  /** Planning opportunities */
  planningOpportunities: string[];
}

export type TaxType = 
  | 'CAPITAL_GAINS'
  | 'ORDINARY_INCOME'
  | 'DEPRECIATION_RECAPTURE'
  | 'STATE_TAX'
  | 'INTERNATIONAL_TAX'
  | 'TRANSFER_TAX'
  | 'WITHHOLDING_TAX'
  | 'ALTERNATIVE_MINIMUM_TAX';

/**
 * Transaction tax structure
 */
export interface TransactionTaxStructure {
  /** Tax treatment */
  taxTreatment: TaxTreatment;
  /** Section 338 election */
  section338Election?: boolean;
  /** Tax-free reorganization */
  taxFreeReorganization?: boolean;
  /** Installment sale treatment */
  installmentSaleTreatment?: boolean;
  /** Like-kind exchange */
  likeKindExchange?: boolean;
}

export type TaxTreatment = 
  | 'TAXABLE_TRANSACTION'
  | 'TAX_FREE_REORGANIZATION'
  | 'INSTALLMENT_SALE'
  | 'LIKE_KIND_EXCHANGE'
  | 'MIXED_TREATMENT';

/**
 * Tax election
 */
export interface TaxElection {
  /** Election type */
  electionType: string;
  /** Election deadline */
  electionDeadline: Date;
  /** Required filings */
  requiredFilings: string[];
  /** Tax benefit */
  taxBenefit: number;
  /** Responsible party */
  responsibleParty: string;
}

/**
 * Tax indemnification
 */
export interface TaxIndemnification {
  /** Scope of indemnification */
  scopeOfIndemnification: string[];
  /** Indemnification cap */
  indemnificationCap: number;
  /** Survival period */
  survivalPeriod: number; // months
  /** Procedure for claims */
  procedureForClaims: string;
  /** Tax sharing agreement */
  taxSharingAgreement?: string;
}

/**
 * Risk allocation
 */
export interface RiskAllocation {
  /** Risk categories */
  riskCategories: RiskCategory[];
  /** Indemnification structure */
  indemnificationStructure: IndemnificationStructure;
  /** Insurance arrangements */
  insuranceArrangements: InsuranceArrangement[];
  /** Limitation of liability */
  limitationOfLiability: LimitationOfLiability;
}

/**
 * Risk category
 */
export interface RiskCategory {
  /** Category name */
  categoryName: string;
  /** Risk description */
  riskDescription: string;
  /** Risk level */
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Allocated to */
  allocatedTo: 'BUYER' | 'SELLER' | 'SHARED';
  /** Mitigation measures */
  mitigationMeasures: string[];
  /** Insurance coverage */
  insuranceCoverage?: string;
}

/**
 * Indemnification structure
 */
export interface IndemnificationStructure {
  /** General indemnification */
  generalIndemnification: GeneralIndemnification;
  /** Specific indemnifications */
  specificIndemnifications: SpecificIndemnification[];
  /** Mutual indemnifications */
  mutualIndemnifications: string[];
  /** Survival periods */
  survivalPeriods: SurvivalPeriod[];
}

/**
 * General indemnification
 */
export interface GeneralIndemnification {
  /** Indemnifying party */
  indemnifyingParty: 'BUYER' | 'SELLER';
  /** Scope */
  scope: string;
  /** Materiality threshold */
  materialityThreshold: number;
  /** Individual claim threshold */
  individualClaimThreshold: number;
  /** Aggregate threshold */
  aggregateThreshold: number;
  /** Cap amount */
  capAmount: number;
}

/**
 * Specific indemnification
 */
export interface SpecificIndemnification {
  /** Subject matter */
  subjectMatter: string;
  /** Indemnifying party */
  indemnifyingParty: 'BUYER' | 'SELLER';
  /** Cap amount */
  capAmount?: number;
  /** Survival period */
  survivalPeriod?: number; // months
  /** Special procedures */
  specialProcedures?: string[];
}

/**
 * Survival period
 */
export interface SurvivalPeriod {
  /** Category */
  category: string;
  /** Period length */
  periodMonths: number;
  /** Exceptions */
  exceptions: string[];
}

/**
 * Insurance arrangement
 */
export interface InsuranceArrangement {
  /** Insurance type */
  insuranceType: InsuranceType;
  /** Coverage amount */
  coverageAmount: number;
  /** Premium cost */
  premiumCost: number;
  /** Deductible */
  deductible: number;
  /** Policy term */
  policyTerm: number; // months
  /** Covered risks */
  coveredRisks: string[];
}

export type InsuranceType = 
  | 'REPRESENTATIONS_WARRANTIES'
  | 'DIRECTORS_OFFICERS'
  | 'GENERAL_LIABILITY'
  | 'PROFESSIONAL_LIABILITY'
  | 'ENVIRONMENTAL'
  | 'CYBER_LIABILITY'
  | 'TRANSACTION_LIABILITY';

/**
 * Limitation of liability
 */
export interface LimitationOfLiability {
  /** Overall liability cap */
  overallLiabilityCap: number;
  /** Excluded damages */
  excludedDamages: string[];
  /** Carve-outs from limitation */
  carveOutsFromLimitation: string[];
  /** Time limitations */
  timeLimitations: TimeLimitation[];
}

/**
 * Time limitation
 */
export interface TimeLimitation {
  /** Claim type */
  claimType: string;
  /** Time limit */
  timeLimitMonths: number;
  /** Discovery rule */
  discoveryRule: boolean;
}

/**
 * Closing condition
 */
export interface ClosingCondition {
  /** Condition description */
  description: string;
  /** Responsible party */
  responsibleParty: 'BUYER' | 'SELLER' | 'BOTH' | 'THIRD_PARTY';
  /** Waivable by buyer */
  waivableByBuyer: boolean;
  /** Waivable by seller */
  waivableBySeller: boolean;
  /** Deadline */
  deadline?: Date;
  /** Status */
  status: ConditionStatus;
  /** Required documentation */
  requiredDocumentation: string[];
}

export type ConditionStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBSTANTIALLY_SATISFIED'
  | 'SATISFIED'
  | 'WAIVED'
  | 'FAILED';

/**
 * Post-closing obligation
 */
export interface PostClosingObligation {
  /** Obligation description */
  description: string;
  /** Responsible party */
  responsibleParty: 'BUYER' | 'SELLER' | 'BOTH';
  /** Deadline */
  deadline: Date;
  /** Deliverables */
  deliverables: string[];
  /** Penalty for non-compliance */
  penaltyForNonCompliance?: number;
  /** Status */
  status: ObligationStatus;
}

export type ObligationStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'WAIVED';

/**
 * Asset Purchase Agreement template
 */
export interface AssetPurchaseAgreement extends DealStructure {
  /** Specific asset purchase terms */
  assetPurchaseTerms: AssetPurchaseTerms;
  /** Excluded assets */
  excludedAssets: ExcludedAsset[];
  /** Assumed liabilities */
  assumedLiabilities: AssumedLiability[];
  /** Excluded liabilities */
  excludedLiabilities: ExcludedLiability[];
  /** Allocation schedule */
  allocationSchedule: AllocationSchedule;
}

/**
 * Asset purchase specific terms
 */
export interface AssetPurchaseTerms {
  /** Purchase price allocation */
  purchasePriceAllocation: PurchasePriceAllocation;
  /** Asset transfer method */
  assetTransferMethod: AssetTransferMethod;
  /** Bulk sale compliance */
  bulkSaleCompliance: boolean;
  /** Third party consents */
  thirdPartyConsents: ThirdPartyConsent[];
  /** Assignment restrictions */
  assignmentRestrictions: AssignmentRestriction[];
}

/**
 * Purchase price allocation
 */
export interface PurchasePriceAllocation {
  /** Tangible assets */
  tangibleAssets: AssetAllocation[];
  /** Intangible assets */
  intangibleAssets: AssetAllocation[];
  /** Goodwill */
  goodwill: number;
  /** Covenant not to compete */
  covenantNotToCompete: number;
  /** Total allocation */
  totalAllocation: number;
}

/**
 * Asset allocation
 */
export interface AssetAllocation {
  /** Asset description */
  assetDescription: string;
  /** Book value */
  bookValue: number;
  /** Fair market value */
  fairMarketValue: number;
  /** Allocated purchase price */
  allocatedPurchasePrice: number;
  /** Tax basis */
  taxBasis: number;
}

export type AssetTransferMethod = 
  | 'BILL_OF_SALE'
  | 'ASSIGNMENT'
  | 'NOVATION'
  | 'ASSUMPTION'
  | 'OPERATION_OF_LAW';

/**
 * Third party consent
 */
export interface ThirdPartyConsent {
  /** Contract description */
  contractDescription: string;
  /** Counterparty */
  counterparty: string;
  /** Consent required */
  consentRequired: boolean;
  /** Consent obtained */
  consentObtained: boolean;
  /** Alternative if consent not obtained */
  alternativeIfConsentNotObtained: string;
}

/**
 * Assignment restriction
 */
export interface AssignmentRestriction {
  /** Asset/contract description */
  assetContractDescription: string;
  /** Restriction type */
  restrictionType: string;
  /** Required actions */
  requiredActions: string[];
  /** Workaround if restriction not lifted */
  workaroundIfRestrictionNotLifted: string;
}

/**
 * Excluded asset
 */
export interface ExcludedAsset {
  /** Asset description */
  assetDescription: string;
  /** Book value */
  bookValue: number;
  /** Reason for exclusion */
  reasonForExclusion: string;
  /** Disposition plan */
  dispositionPlan: string;
}

/**
 * Assumed liability
 */
export interface AssumedLiability {
  /** Liability description */
  liabilityDescription: string;
  /** Amount */
  amount: number;
  /** Assumption date */
  assumptionDate: Date;
  /** Special terms */
  specialTerms: string[];
}

/**
 * Excluded liability
 */
export interface ExcludedLiability {
  /** Liability description */
  liabilityDescription: string;
  /** Amount */
  amount: number;
  /** Reason for exclusion */
  reasonForExclusion: string;
  /** Indemnification */
  indemnification: boolean;
}

/**
 * Allocation schedule
 */
export interface AllocationSchedule {
  /** Total purchase price */
  totalPurchasePrice: number;
  /** Asset allocations */
  assetAllocations: AssetAllocation[];
  /** Tax implications */
  taxImplications: string[];
  /** Depreciation/amortization schedule */
  depreciationAmortizationSchedule: DepreciationSchedule[];
}

/**
 * Depreciation schedule
 */
export interface DepreciationSchedule {
  /** Asset category */
  assetCategory: string;
  /** Allocated amount */
  allocatedAmount: number;
  /** Useful life */
  usefulLife: number;
  /** Depreciation method */
  depreciationMethod: string;
  /** Annual depreciation */
  annualDepreciation: number;
}

/**
 * Stock Purchase Agreement template
 */
export interface StockPurchaseAgreement extends DealStructure {
  /** Stock purchase terms */
  stockPurchaseTerms: StockPurchaseTerms;
  /** Shares to be purchased */
  sharesToBePurchased: SharesPurchased[];
  /** Seller warranties specific to stock purchase */
  stockSpecificWarranties: StockSpecificWarranty[];
  /** Corporate actions */
  corporateActions: CorporateAction[];
}

/**
 * Stock purchase terms
 */
export interface StockPurchaseTerms {
  /** Purchase price per share */
  purchasePricePerShare: number;
  /** Total shares purchased */
  totalSharesPurchased: number;
  /** Share transfer method */
  shareTransferMethod: ShareTransferMethod;
  /** Stock certificates */
  stockCertificates: StockCertificate[];
  /** Transfer restrictions */
  transferRestrictions: TransferRestriction[];
}

export type ShareTransferMethod = 
  | 'PHYSICAL_DELIVERY'
  | 'BOOK_ENTRY'
  | 'ELECTRONIC_TRANSFER'
  | 'ESCROW_DELIVERY';

/**
 * Shares purchased
 */
export interface SharesPurchased {
  /** Share class */
  shareClass: string;
  /** Number of shares */
  numberOfShares: number;
  /** Price per share */
  pricePerShare: number;
  /** Total consideration */
  totalConsideration: number;
  /** Voting rights */
  votingRights: number;
  /** Dividend rights */
  dividendRights: string;
}

/**
 * Stock certificate
 */
export interface StockCertificate {
  /** Certificate number */
  certificateNumber: string;
  /** Number of shares */
  numberOfShares: number;
  /** Share class */
  shareClass: string;
  /** Registered owner */
  registeredOwner: string;
  /** Transfer agent */
  transferAgent: string;
}

/**
 * Transfer restriction
 */
export interface TransferRestriction {
  /** Restriction type */
  restrictionType: string;
  /** Applicable shares */
  applicableShares: string;
  /** Duration */
  duration: number; // months
  /** Exceptions */
  exceptions: string[];
  /** Enforcement mechanism */
  enforcementMechanism: string;
}

/**
 * Stock-specific warranty
 */
export interface StockSpecificWarranty {
  /** Warranty description */
  warrantyDescription: string;
  /** Materiality threshold */
  materialityThreshold?: number;
  /** Knowledge qualifier */
  knowledgeQualifier: boolean;
  /** Survival period */
  survivalPeriod: number; // months
  /** Supporting documentation */
  supportingDocumentation: string[];
}

/**
 * Corporate action
 */
export interface CorporateAction {
  /** Action type */
  actionType: CorporateActionType;
  /** Action description */
  actionDescription: string;
  /** Effective date */
  effectiveDate: Date;
  /** Required approvals */
  requiredApprovals: string[];
  /** Documentation required */
  documentationRequired: string[];
}

export type CorporateActionType = 
  | 'BOARD_RESOLUTION'
  | 'SHAREHOLDER_RESOLUTION'
  | 'CHARTER_AMENDMENT'
  | 'BYLAWS_AMENDMENT'
  | 'DIVIDEND_DECLARATION'
  | 'STOCK_SPLIT'
  | 'MERGER_APPROVAL'
  | 'DISSOLUTION';

/**
 * Merger Agreement template
 */
export interface MergerAgreement extends DealStructure {
  /** Merger terms */
  mergerTerms: MergerTerms;
  /** Exchange ratio */
  exchangeRatio: ExchangeRatio;
  /** Merger consideration */
  mergerConsideration: MergerConsideration;
  /** Voting agreements */
  votingAgreements: VotingAgreement[];
  /** Appraisal rights */
  appraisalRights: AppraisalRights;
}

/**
 * Merger terms
 */
export interface MergerTerms {
  /** Merger type */
  mergerType: MergerType;
  /** Surviving entity */
  survivingEntity: string;
  /** Effective time */
  effectiveTime: Date;
  /** Merger consideration type */
  mergerConsiderationType: MergerConsiderationType;
  /** Required approvals */
  requiredApprovals: RequiredApproval[];
}

export type MergerType = 
  | 'FORWARD_MERGER'
  | 'REVERSE_MERGER'
  | 'TRIANGULAR_MERGER'
  | 'REVERSE_TRIANGULAR_MERGER'
  | 'SHORT_FORM_MERGER'
  | 'STATUTORY_MERGER';

export type MergerConsiderationType = 
  | 'ALL_CASH'
  | 'ALL_STOCK'
  | 'MIXED_CONSIDERATION'
  | 'CONTINGENT_VALUE_RIGHTS';

/**
 * Required approval
 */
export interface RequiredApproval {
  /** Approval type */
  approvalType: string;
  /** Approving party */
  approvingParty: string;
  /** Voting threshold */
  votingThreshold: number;
  /** Expected timing */
  expectedTiming: Date;
  /** Status */
  status: 'PENDING' | 'OBTAINED' | 'FAILED';
}

/**
 * Exchange ratio
 */
export interface ExchangeRatio {
  /** Target shares */
  targetShares: number;
  /** Acquirer shares issued */
  acquirerSharesIssued: number;
  /** Exchange ratio */
  ratio: number;
  /** Collar adjustment */
  collarAdjustment?: CollarAdjustment;
  /** Price protection */
  priceProtection: PriceProtection;
}

/**
 * Collar adjustment
 */
export interface CollarAdjustment {
  /** Reference price */
  referencePrice: number;
  /** Floor price */
  floorPrice: number;
  /** Ceiling price */
  ceilingPrice: number;
  /** Adjustment mechanism */
  adjustmentMechanism: string;
}

/**
 * Price protection
 */
export interface PriceProtection {
  /** Protection type */
  protectionType: 'FIXED_RATIO' | 'FIXED_VALUE' | 'FLOATING_RATIO' | 'COLLAR';
  /** Measurement period */
  measurementPeriod: number; // days
  /** Termination rights */
  terminationRights: boolean;
  /** Threshold for termination */
  thresholdForTermination?: number;
}

/**
 * Merger consideration
 */
export interface MergerConsideration {
  /** Cash component */
  cashComponent?: number;
  /** Stock component */
  stockComponent?: number;
  /** Contingent value rights */
  contingentValueRights?: ContingentValueRights;
  /** Election procedures */
  electionProcedures: ElectionProcedure[];
  /** Proration procedures */
  prorationProcedures: ProrationProcedure[];
}

/**
 * Contingent value rights
 */
export interface ContingentValueRights {
  /** Total CVR value */
  totalCVRValue: number;
  /** Performance metrics */
  performanceMetrics: PerformanceMetric[];
  /** Payment schedule */
  paymentSchedule: CVRPaymentSchedule[];
  /** Trading rights */
  tradingRights: boolean;
}

/**
 * CVR payment schedule
 */
export interface CVRPaymentSchedule {
  /** Payment date */
  paymentDate: Date;
  /** Performance period */
  performancePeriod: string;
  /** Maximum payment */
  maximumPayment: number;
  /** Calculation method */
  calculationMethod: string;
}

/**
 * Election procedure
 */
export interface ElectionProcedure {
  /** Election type */
  electionType: 'CASH_ELECTION' | 'STOCK_ELECTION' | 'MIXED_ELECTION';
  /** Election deadline */
  electionDeadline: Date;
  /** Election form */
  electionForm: string;
  /** Default election */
  defaultElection: string;
  /** Revocation rights */
  revocationRights: boolean;
}

/**
 * Proration procedure
 */
export interface ProrationProcedure {
  /** Proration basis */
  prorationBasis: string;
  /** Allocation method */
  allocationMethod: string;
  /** Oversubscription handling */
  oversubscriptionHandling: string;
  /** Fractional share treatment */
  fractionalShareTreatment: string;
}

/**
 * Voting agreement
 */
export interface VotingAgreement {
  /** Agreeing shareholder */
  agreeingShareholder: string;
  /** Shares covered */
  sharesCovered: number;
  /** Voting commitment */
  votingCommitment: string;
  /** Term */
  term: string;
  /** Termination events */
  terminationEvents: string[];
}

/**
 * Appraisal rights
 */
export interface AppraisalRights {
  /** Availability */
  availability: boolean;
  /** Eligible shareholders */
  eligibleShareholders: string;
  /** Procedure */
  procedure: string;
  /** Notice requirements */
  noticeRequirements: string[];
  /** Valuation method */
  valuationMethod: string;
}

/**
 * Deal structure templates factory
 */
export class DealStructureTemplates {
  
  /**
   * Create asset purchase agreement template
   */
  static createAssetPurchaseTemplate(dealParams: DealParameters): AssetPurchaseAgreement {
    const baseStructure = this.createBaseDealStructure(dealParams);
    
    return {
      ...baseStructure,
      structureType: 'ASSET_PURCHASE',
      assetPurchaseTerms: this.createAssetPurchaseTerms(dealParams),
      excludedAssets: this.createExcludedAssets(dealParams),
      assumedLiabilities: this.createAssumedLiabilities(dealParams),
      excludedLiabilities: this.createExcludedLiabilities(dealParams),
      allocationSchedule: this.createAllocationSchedule(dealParams)
    };
  }

  /**
   * Create stock purchase agreement template
   */
  static createStockPurchaseTemplate(dealParams: DealParameters): StockPurchaseAgreement {
    const baseStructure = this.createBaseDealStructure(dealParams);
    
    return {
      ...baseStructure,
      structureType: 'STOCK_PURCHASE',
      stockPurchaseTerms: this.createStockPurchaseTerms(dealParams),
      sharesToBePurchased: this.createSharesPurchased(dealParams),
      stockSpecificWarranties: this.createStockSpecificWarranties(dealParams),
      corporateActions: this.createCorporateActions(dealParams)
    };
  }

  /**
   * Create merger agreement template
   */
  static createMergerTemplate(dealParams: DealParameters): MergerAgreement {
    const baseStructure = this.createBaseDealStructure(dealParams);
    
    return {
      ...baseStructure,
      structureType: 'MERGER',
      mergerTerms: this.createMergerTerms(dealParams),
      exchangeRatio: this.createExchangeRatio(dealParams),
      mergerConsideration: this.createMergerConsideration(dealParams),
      votingAgreements: this.createVotingAgreements(dealParams),
      appraisalRights: this.createAppraisalRights(dealParams)
    };
  }

  /**
   * Analyze deal structure efficiency
   */
  static analyzeDealStructure(dealStructure: DealStructure): DealStructureAnalysis {
    return {
      structureType: dealStructure.structureType,
      efficiencyScore: this.calculateEfficiencyScore(dealStructure),
      taxEfficiency: this.analyzeTaxEfficiency(dealStructure),
      riskProfile: this.analyzeRiskProfile(dealStructure),
      implementationComplexity: this.analyzeImplementationComplexity(dealStructure),
      recommendations: this.generateStructureRecommendations(dealStructure),
      alternatives: this.suggestAlternativeStructures(dealStructure)
    };
  }

  // Helper methods for template creation
  private static createBaseDealStructure(dealParams: DealParameters): DealStructure {
    // Implementation would create base structure
    // This is a simplified placeholder
    return {} as DealStructure;
  }

  private static createAssetPurchaseTerms(dealParams: DealParameters): AssetPurchaseTerms {
    // Implementation would create asset purchase specific terms
    return {} as AssetPurchaseTerms;
  }

  private static createExcludedAssets(dealParams: DealParameters): ExcludedAsset[] {
    // Implementation would create excluded assets
    return [];
  }

  private static createAssumedLiabilities(dealParams: DealParameters): AssumedLiability[] {
    // Implementation would create assumed liabilities
    return [];
  }

  private static createExcludedLiabilities(dealParams: DealParameters): ExcludedLiability[] {
    // Implementation would create excluded liabilities
    return [];
  }

  private static createAllocationSchedule(dealParams: DealParameters): AllocationSchedule {
    // Implementation would create allocation schedule
    return {} as AllocationSchedule;
  }

  private static createStockPurchaseTerms(dealParams: DealParameters): StockPurchaseTerms {
    // Implementation would create stock purchase terms
    return {} as StockPurchaseTerms;
  }

  private static createSharesPurchased(dealParams: DealParameters): SharesPurchased[] {
    // Implementation would create shares purchased
    return [];
  }

  private static createStockSpecificWarranties(dealParams: DealParameters): StockSpecificWarranty[] {
    // Implementation would create stock specific warranties
    return [];
  }

  private static createCorporateActions(dealParams: DealParameters): CorporateAction[] {
    // Implementation would create corporate actions
    return [];
  }

  private static createMergerTerms(dealParams: DealParameters): MergerTerms {
    // Implementation would create merger terms
    return {} as MergerTerms;
  }

  private static createExchangeRatio(dealParams: DealParameters): ExchangeRatio {
    // Implementation would create exchange ratio
    return {} as ExchangeRatio;
  }

  private static createMergerConsideration(dealParams: DealParameters): MergerConsideration {
    // Implementation would create merger consideration
    return {} as MergerConsideration;
  }

  private static createVotingAgreements(dealParams: DealParameters): VotingAgreement[] {
    // Implementation would create voting agreements
    return [];
  }

  private static createAppraisalRights(dealParams: DealParameters): AppraisalRights {
    // Implementation would create appraisal rights
    return {} as AppraisalRights;
  }

  private static calculateEfficiencyScore(dealStructure: DealStructure): number {
    // Implementation would calculate efficiency score
    return 85;
  }

  private static analyzeTaxEfficiency(dealStructure: DealStructure): TaxEfficiencyAnalysis {
    // Implementation would analyze tax efficiency
    return {} as TaxEfficiencyAnalysis;
  }

  private static analyzeRiskProfile(dealStructure: DealStructure): RiskProfileAnalysis {
    // Implementation would analyze risk profile
    return {} as RiskProfileAnalysis;
  }

  private static analyzeImplementationComplexity(dealStructure: DealStructure): ImplementationComplexityAnalysis {
    // Implementation would analyze implementation complexity
    return {} as ImplementationComplexityAnalysis;
  }

  private static generateStructureRecommendations(dealStructure: DealStructure): string[] {
    // Implementation would generate recommendations
    return [];
  }

  private static suggestAlternativeStructures(dealStructure: DealStructure): AlternativeStructure[] {
    // Implementation would suggest alternatives
    return [];
  }
}

/**
 * Deal parameters for template creation
 */
export interface DealParameters {
  transactionValue: number;
  targetCompany: string;
  acquirer: string;
  industry: string;
  dealRationale: TransactionRationale;
  paymentMethod: 'CASH' | 'STOCK' | 'MIXED';
  taxObjectives: string[];
  riskPreferences: string[];
  timelineConstraints: string[];
}

/**
 * Deal structure analysis result
 */
export interface DealStructureAnalysis {
  structureType: DealStructureType;
  efficiencyScore: number;
  taxEfficiency: TaxEfficiencyAnalysis;
  riskProfile: RiskProfileAnalysis;
  implementationComplexity: ImplementationComplexityAnalysis;
  recommendations: string[];
  alternatives: AlternativeStructure[];
}

/**
 * Tax efficiency analysis
 */
export interface TaxEfficiencyAnalysis {
  buyerTaxEfficiency: number;
  sellerTaxEfficiency: number;
  overallTaxEfficiency: number;
  taxSavingsOpportunities: string[];
  taxRisks: string[];
}

/**
 * Risk profile analysis
 */
export interface RiskProfileAnalysis {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  buyerRisks: string[];
  sellerRisks: string[];
  mitigationStrategies: string[];
  riskAllocationEffectiveness: number;
}

/**
 * Implementation complexity analysis
 */
export interface ImplementationComplexityAnalysis {
  complexityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keyComplexityFactors: string[];
  estimatedTimeToClose: number; // days
  requiredResources: string[];
  implementationRisks: string[];
}

/**
 * Alternative structure suggestion
 */
export interface AlternativeStructure {
  structureType: DealStructureType;
  advantages: string[];
  disadvantages: string[];
  taxImplications: string[];
  riskImplications: string[];
  implementationConsiderations: string[];
}