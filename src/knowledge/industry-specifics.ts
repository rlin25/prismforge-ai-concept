/**
 * Industry-Specific M&A Analysis Framework
 * Comprehensive sector-specific considerations, metrics, and validation criteria for M&A due diligence
 */

import { FinancialMetrics, ValuationMultiples } from './financial-terms';
import { RedFlag } from './red-flags';

/**
 * Industry-specific analysis configuration
 */
export interface IndustryAnalysisConfig {
  /** Industry type */
  industry: IndustryType;
  /** Sector-specific metrics to focus on */
  keyMetrics: IndustryKeyMetrics;
  /** Typical valuation multiples */
  valuationBenchmarks: IndustryValuationBenchmarks;
  /** Common red flags for the industry */
  commonRedFlags: IndustryRedFlagConfig[];
  /** Due diligence focus areas */
  dueDiligenceFocus: DueDiligenceFocusArea[];
  /** Regulatory considerations */
  regulatoryConsiderations: RegulatoryConsideration[];
  /** Market dynamics */
  marketDynamics: MarketDynamics;
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
  | 'EDUCATION'
  | 'FOOD_BEVERAGE'
  | 'AUTOMOTIVE'
  | 'AEROSPACE'
  | 'TELECOMMUNICATIONS'
  | 'MEDIA_ENTERTAINMENT'
  | 'PROFESSIONAL_SERVICES'
  | 'LOGISTICS'
  | 'AGRICULTURE'
  | 'CONSTRUCTION'
  | 'HOSPITALITY';

/**
 * Industry-specific key metrics
 */
export interface IndustryKeyMetrics {
  /** Primary metrics to evaluate */
  primaryMetrics: MetricDefinition[];
  /** Secondary metrics for context */
  secondaryMetrics: MetricDefinition[];
  /** Industry-specific ratios */
  industryRatios: RatioDefinition[];
  /** Benchmarking standards */
  benchmarks: BenchmarkStandard[];
}

/**
 * Metric definition
 */
export interface MetricDefinition {
  /** Metric name */
  name: string;
  /** Metric description */
  description: string;
  /** Calculation formula */
  formula: string;
  /** Typical ranges */
  typicalRanges: {
    excellent: [number, number];
    good: [number, number];
    average: [number, number];
    poor: [number, number];
  };
  /** Industry benchmarks */
  industryBenchmarks: {
    median: number;
    p25: number;
    p75: number;
    topQuartile: number;
  };
  /** Critical thresholds */
  criticalThresholds: {
    redFlag: number;
    concern: number;
  };
}

/**
 * Industry-specific ratio definition
 */
export interface RatioDefinition {
  /** Ratio name */
  name: string;
  /** Numerator */
  numerator: string;
  /** Denominator */
  denominator: string;
  /** Interpretation guide */
  interpretation: string;
  /** Industry-specific considerations */
  industryConsiderations: string[];
}

/**
 * Benchmark standard
 */
export interface BenchmarkStandard {
  /** Metric being benchmarked */
  metric: string;
  /** Data source */
  source: string;
  /** Sample size */
  sampleSize: number;
  /** Time period */
  timePeriod: string;
  /** Geographic scope */
  geography: string;
  /** Benchmark values */
  values: {
    mean: number;
    median: number;
    standardDeviation: number;
    percentiles: Record<string, number>;
  };
}

/**
 * Industry valuation benchmarks
 */
export interface IndustryValuationBenchmarks {
  /** Primary valuation multiples */
  primaryMultiples: string[];
  /** Multiple ranges by performance */
  multipleRanges: Record<string, MultipleRange>;
  /** Growth-adjusted multiples */
  growthAdjustedMultiples: GrowthAdjustedMultiple[];
  /** Margin-adjusted multiples */
  marginAdjustedMultiples: MarginAdjustedMultiple[];
  /** Market conditions impact */
  marketConditionsImpact: MarketConditionsImpact;
}

/**
 * Multiple range definition
 */
export interface MultipleRange {
  /** Multiple name */
  multiple: string;
  /** Low end of range */
  low: number;
  /** High end of range */
  high: number;
  /** Median */
  median: number;
  /** Performance criteria */
  performanceCriteria: string[];
}

/**
 * Growth-adjusted multiple
 */
export interface GrowthAdjustedMultiple {
  /** Base multiple */
  baseMultiple: string;
  /** Growth rate ranges */
  growthRanges: {
    growthRate: [number, number];
    multipleAdjustment: number;
  }[];
  /** Formula */
  adjustmentFormula: string;
}

/**
 * Margin-adjusted multiple
 */
export interface MarginAdjustedMultiple {
  /** Base multiple */
  baseMultiple: string;
  /** Margin type */
  marginType: 'GROSS' | 'EBITDA' | 'NET';
  /** Margin ranges */
  marginRanges: {
    marginRange: [number, number];
    multipleAdjustment: number;
  }[];
}

/**
 * Market conditions impact on valuation
 */
export interface MarketConditionsImpact {
  /** Bull market adjustment */
  bullMarket: number;
  /** Bear market adjustment */
  bearMarket: number;
  /** Credit availability impact */
  creditImpact: {
    tight: number;
    loose: number;
  };
  /** M&A activity impact */
  activityImpact: {
    high: number;
    low: number;
  };
}

/**
 * Industry-specific red flag configuration
 */
export interface IndustryRedFlagConfig {
  /** Red flag type */
  type: string;
  /** Industry-specific threshold */
  threshold: number;
  /** Severity in this industry */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Industry context */
  context: string;
  /** Detection criteria */
  detectionCriteria: DetectionCriteria;
}

/**
 * Detection criteria for red flags
 */
export interface DetectionCriteria {
  /** Metric thresholds */
  metricThresholds: Record<string, number>;
  /** Pattern indicators */
  patternIndicators: string[];
  /** Time-based criteria */
  timeCriteria: {
    lookbackPeriod: number;
    trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  };
}

/**
 * Due diligence focus area
 */
export interface DueDiligenceFocusArea {
  /** Area name */
  area: string;
  /** Priority level */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Specific items to review */
  items: DueDiligenceItem[];
  /** Industry-specific risks */
  industryRisks: string[];
  /** Expert requirements */
  expertRequirements: string[];
}

/**
 * Due diligence item
 */
export interface DueDiligenceItem {
  /** Item description */
  description: string;
  /** Required documentation */
  requiredDocs: string[];
  /** Analysis type */
  analysisType: string;
  /** Time allocation (hours) */
  timeAllocation: number;
}

/**
 * Regulatory consideration
 */
export interface RegulatoryConsideration {
  /** Regulatory area */
  area: string;
  /** Governing bodies */
  governingBodies: string[];
  /** Key regulations */
  keyRegulations: Regulation[];
  /** Compliance requirements */
  complianceRequirements: string[];
  /** Recent changes */
  recentChanges: RegulatoryChange[];
  /** Pending changes */
  pendingChanges: RegulatoryChange[];
}

/**
 * Regulation details
 */
export interface Regulation {
  /** Regulation name */
  name: string;
  /** Effective date */
  effectiveDate: Date;
  /** Key provisions */
  keyProvisions: string[];
  /** Compliance cost impact */
  complianceCost: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Business impact */
  businessImpact: string;
}

/**
 * Regulatory change
 */
export interface RegulatoryChange {
  /** Change description */
  description: string;
  /** Implementation date */
  implementationDate: Date;
  /** Impact assessment */
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  /** Preparation requirements */
  preparationRequirements: string[];
}

/**
 * Market dynamics
 */
export interface MarketDynamics {
  /** Market structure */
  marketStructure: MarketStructure;
  /** Competitive landscape */
  competitiveLandscape: CompetitiveLandscape;
  /** Growth drivers */
  growthDrivers: string[];
  /** Market risks */
  marketRisks: MarketRisk[];
  /** Cyclicality */
  cyclicality: CyclicalityAssessment;
}

/**
 * Market structure
 */
export interface MarketStructure {
  /** Market concentration */
  concentration: 'FRAGMENTED' | 'MODERATELY_CONCENTRATED' | 'HIGHLY_CONCENTRATED';
  /** Market size */
  marketSize: number;
  /** Growth rate */
  growthRate: number;
  /** Maturity stage */
  maturityStage: 'EMERGING' | 'GROWING' | 'MATURE' | 'DECLINING';
  /** Barriers to entry */
  barriersToEntry: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Competitive landscape
 */
export interface CompetitiveLandscape {
  /** Number of major players */
  majorPlayers: number;
  /** Market share distribution */
  marketShareDistribution: 'FRAGMENTED' | 'MODERATE' | 'CONCENTRATED';
  /** Competitive intensity */
  competitiveIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Differentiation factors */
  differentiationFactors: string[];
  /** Switching costs */
  switchingCosts: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Market risk
 */
export interface MarketRisk {
  /** Risk type */
  type: string;
  /** Probability */
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Impact */
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/**
 * Cyclicality assessment
 */
export interface CyclicalityAssessment {
  /** Cyclical nature */
  cyclical: boolean;
  /** Cycle length (years) */
  cycleLength?: number;
  /** Current cycle position */
  currentPosition?: 'PEAK' | 'DOWNTURN' | 'TROUGH' | 'RECOVERY';
  /** Economic sensitivity */
  economicSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Seasonal patterns */
  seasonalPatterns: boolean;
}

/**
 * SaaS-specific metrics and analysis
 */
export interface SaaSSpecificMetrics {
  /** Annual Recurring Revenue */
  arr: number;
  /** Monthly Recurring Revenue */
  mrr: number;
  /** ARR growth rate */
  arrGrowthRate: number;
  /** Customer acquisition cost */
  cac: number;
  /** Customer lifetime value */
  ltv: number;
  /** LTV/CAC ratio */
  ltvCacRatio: number;
  /** Monthly churn rate */
  monthlyChurnRate: number;
  /** Annual churn rate */
  annualChurnRate: number;
  /** Net revenue retention */
  netRevenueRetention: number;
  /** Gross revenue retention */
  grossRevenueRetention: number;
  /** Average revenue per user */
  arpu: number;
  /** Customer count */
  customerCount: number;
  /** Paid vs free users */
  paidUserRatio: number;
  /** Sales efficiency metrics */
  salesEfficiency: SaaSSalesEfficiency;
  /** Product metrics */
  productMetrics: SaaSProductMetrics;
}

/**
 * SaaS sales efficiency metrics
 */
export interface SaaSSalesEfficiency {
  /** Sales efficiency ratio */
  salesEfficiencyRatio: number;
  /** Magic number */
  magicNumber: number;
  /** Payback period */
  paybackPeriod: number;
  /** Sales team productivity */
  salesProductivity: {
    avgDealsPerRep: number;
    avgDealSize: number;
    salesCycleLength: number;
  };
}

/**
 * SaaS product metrics
 */
export interface SaaSProductMetrics {
  /** Daily active users */
  dau?: number;
  /** Monthly active users */
  mau?: number;
  /** Feature adoption rates */
  featureAdoption: Record<string, number>;
  /** Time to value */
  timeToValue: number;
  /** Customer satisfaction scores */
  customerSatisfaction: {
    nps: number;
    csat: number;
    ces: number;
  };
}

/**
 * Manufacturing-specific metrics
 */
export interface ManufacturingSpecificMetrics {
  /** Capacity utilization */
  capacityUtilization: number;
  /** Inventory turnover */
  inventoryTurnover: number;
  /** Days inventory outstanding */
  daysInventoryOutstanding: number;
  /** Gross margin by product line */
  grossMarginByProduct: Record<string, number>;
  /** Equipment efficiency */
  equipmentEfficiency: number;
  /** Quality metrics */
  qualityMetrics: ManufacturingQualityMetrics;
  /** Supply chain metrics */
  supplyChainMetrics: SupplyChainMetrics;
  /** Labor metrics */
  laborMetrics: LaborMetrics;
}

/**
 * Manufacturing quality metrics
 */
export interface ManufacturingQualityMetrics {
  /** Defect rate */
  defectRate: number;
  /** First-pass yield */
  firstPassYield: number;
  /** Rework rate */
  reworkRate: number;
  /** Customer complaint rate */
  customerComplaintRate: number;
  /** Warranty costs */
  warrantyCosts: number;
}

/**
 * Supply chain metrics
 */
export interface SupplyChainMetrics {
  /** Supplier concentration */
  supplierConcentration: {
    top1SupplierPercent: number;
    top3SuppliersPercent: number;
    top5SuppliersPercent: number;
  };
  /** On-time delivery */
  onTimeDelivery: number;
  /** Supplier performance */
  supplierPerformance: number;
  /** Inventory obsolescence */
  inventoryObsolescence: number;
}

/**
 * Labor metrics
 */
export interface LaborMetrics {
  /** Employee turnover */
  employeeTurnover: number;
  /** Productivity per employee */
  productivityPerEmployee: number;
  /** Absenteeism rate */
  absenteeismRate: number;
  /** Safety incidents */
  safetyIncidents: number;
  /** Training hours per employee */
  trainingHoursPerEmployee: number;
}

/**
 * Healthcare-specific metrics
 */
export interface HealthcareSpecificMetrics {
  /** Revenue per patient */
  revenuePerPatient: number;
  /** Patient satisfaction scores */
  patientSatisfactionScores: number;
  /** Clinical outcomes */
  clinicalOutcomes: ClinicalOutcomes;
  /** Regulatory compliance */
  regulatoryCompliance: RegulatoryCompliance;
  /** Reimbursement metrics */
  reimbursementMetrics: ReimbursementMetrics;
  /** Operational efficiency */
  operationalEfficiency: HealthcareOperationalEfficiency;
}

/**
 * Clinical outcomes
 */
export interface ClinicalOutcomes {
  /** Readmission rates */
  readmissionRates: number;
  /** Infection rates */
  infectionRates: number;
  /** Mortality rates */
  mortalityRates: number;
  /** Treatment success rates */
  treatmentSuccessRates: number;
  /** Patient safety incidents */
  patientSafetyIncidents: number;
}

/**
 * Regulatory compliance
 */
export interface RegulatoryCompliance {
  /** FDA compliance status */
  fdaComplianceStatus: 'COMPLIANT' | 'WARNING_LETTER' | 'NON_COMPLIANT';
  /** HIPAA compliance */
  hipaaCompliance: boolean;
  /** Quality certifications */
  qualityCertifications: string[];
  /** Audit findings */
  auditFindings: number;
  /** Corrective action plans */
  correctiveActionPlans: number;
}

/**
 * Reimbursement metrics
 */
export interface ReimbursementMetrics {
  /** Payer mix */
  payerMix: Record<string, number>;
  /** Days in A/R */
  daysInAR: number;
  /** Collection rate */
  collectionRate: number;
  /** Denial rate */
  denialRate: number;
  /** Prior authorization requirements */
  priorAuthRequirements: number;
}

/**
 * Healthcare operational efficiency
 */
export interface HealthcareOperationalEfficiency {
  /** Bed utilization */
  bedUtilization: number;
  /** Staff efficiency */
  staffEfficiency: number;
  /** Equipment utilization */
  equipmentUtilization: number;
  /** Cost per case */
  costPerCase: number;
  /** Length of stay */
  lengthOfStay: number;
}

/**
 * Industry-specific analysis engine
 */
export class IndustryAnalyzer {
  
  /**
   * Get industry configuration
   */
  static getIndustryConfig(industry: IndustryType): IndustryAnalysisConfig {
    switch (industry) {
      case 'SAAS':
        return this.getSaaSConfig();
      case 'MANUFACTURING':
        return this.getManufacturingConfig();
      case 'HEALTHCARE':
        return this.getHealthcareConfig();
      case 'FINTECH':
        return this.getFintechConfig();
      case 'RETAIL':
        return this.getRetailConfig();
      default:
        return this.getGenericConfig();
    }
  }

  /**
   * SaaS industry configuration
   */
  private static getSaaSConfig(): IndustryAnalysisConfig {
    return {
      industry: 'SAAS',
      keyMetrics: {
        primaryMetrics: [
          {
            name: 'ARR Growth Rate',
            description: 'Annual Recurring Revenue growth year-over-year',
            formula: '(Current ARR - Previous ARR) / Previous ARR',
            typicalRanges: {
              excellent: [0.5, 2.0],
              good: [0.3, 0.5],
              average: [0.15, 0.3],
              poor: [0, 0.15]
            },
            industryBenchmarks: {
              median: 0.25,
              p25: 0.15,
              p75: 0.40,
              topQuartile: 0.50
            },
            criticalThresholds: {
              redFlag: 0.05,
              concern: 0.10
            }
          },
          {
            name: 'LTV/CAC Ratio',
            description: 'Customer Lifetime Value to Customer Acquisition Cost ratio',
            formula: 'Customer Lifetime Value / Customer Acquisition Cost',
            typicalRanges: {
              excellent: [5.0, 10.0],
              good: [3.0, 5.0],
              average: [2.0, 3.0],
              poor: [0, 2.0]
            },
            industryBenchmarks: {
              median: 3.5,
              p25: 2.5,
              p75: 5.0,
              topQuartile: 6.0
            },
            criticalThresholds: {
              redFlag: 1.5,
              concern: 2.0
            }
          },
          {
            name: 'Net Revenue Retention',
            description: 'Revenue retention from existing customers including expansion',
            formula: '(Starting ARR + Expansion - Churn) / Starting ARR',
            typicalRanges: {
              excellent: [1.15, 1.5],
              good: [1.10, 1.15],
              average: [1.05, 1.10],
              poor: [0.8, 1.05]
            },
            industryBenchmarks: {
              median: 1.08,
              p25: 1.02,
              p75: 1.15,
              topQuartile: 1.20
            },
            criticalThresholds: {
              redFlag: 0.95,
              concern: 1.0
            }
          }
        ],
        secondaryMetrics: [
          {
            name: 'Monthly Churn Rate',
            description: 'Percentage of customers that cancel monthly',
            formula: 'Churned Customers / Total Customers (monthly)',
            typicalRanges: {
              excellent: [0, 0.02],
              good: [0.02, 0.05],
              average: [0.05, 0.10],
              poor: [0.10, 0.20]
            },
            industryBenchmarks: {
              median: 0.05,
              p25: 0.03,
              p75: 0.08,
              topQuartile: 0.02
            },
            criticalThresholds: {
              redFlag: 0.15,
              concern: 0.10
            }
          }
        ],
        industryRatios: [
          {
            name: 'Rule of 40',
            numerator: 'Revenue Growth Rate',
            denominator: 'Free Cash Flow Margin',
            interpretation: 'Sum should exceed 40% for healthy SaaS companies',
            industryConsiderations: [
              'Higher growth companies can have lower margins',
              'Mature companies should focus more on profitability',
              'Rule may be relaxed during market downturns'
            ]
          }
        ],
        benchmarks: [
          {
            metric: 'ARR Growth Rate',
            source: 'SaaS Industry Survey 2024',
            sampleSize: 500,
            timePeriod: '2023-2024',
            geography: 'North America',
            values: {
              mean: 0.28,
              median: 0.25,
              standardDeviation: 0.15,
              percentiles: {
                '10': 0.10,
                '25': 0.15,
                '50': 0.25,
                '75': 0.40,
                '90': 0.55
              }
            }
          }
        ]
      },
      valuationBenchmarks: {
        primaryMultiples: ['EV/Revenue', 'EV/ARR', 'Price/Sales'],
        multipleRanges: {
          'EV/Revenue': {
            multiple: 'EV/Revenue',
            low: 3.0,
            high: 15.0,
            median: 6.0,
            performanceCriteria: ['Growth rate >30%', 'NRR >110%', 'Positive FCF']
          }
        },
        growthAdjustedMultiples: [
          {
            baseMultiple: 'EV/Revenue',
            growthRanges: [
              { growthRate: [0, 0.20], multipleAdjustment: -0.3 },
              { growthRate: [0.20, 0.40], multipleAdjustment: 0 },
              { growthRate: [0.40, 0.60], multipleAdjustment: 0.3 },
              { growthRate: [0.60, 1.0], multipleAdjustment: 0.6 }
            ],
            adjustmentFormula: 'Base Multiple × (1 + Growth Adjustment)'
          }
        ],
        marginAdjustedMultiples: [
          {
            baseMultiple: 'EV/Revenue',
            marginType: 'EBITDA',
            marginRanges: [
              { marginRange: [-0.2, 0], multipleAdjustment: -0.4 },
              { marginRange: [0, 0.15], multipleAdjustment: -0.2 },
              { marginRange: [0.15, 0.30], multipleAdjustment: 0 },
              { marginRange: [0.30, 0.50], multipleAdjustment: 0.2 }
            ]
          }
        ],
        marketConditionsImpact: {
          bullMarket: 0.3,
          bearMarket: -0.4,
          creditImpact: {
            tight: -0.2,
            loose: 0.15
          },
          activityImpact: {
            high: 0.1,
            low: -0.15
          }
        }
      },
      commonRedFlags: [
        {
          type: 'HIGH_CHURN_RATE',
          threshold: 0.10,
          severity: 'HIGH',
          context: 'Monthly churn >10% indicates product-market fit issues',
          detectionCriteria: {
            metricThresholds: { 'monthlyChurnRate': 0.10 },
            patternIndicators: ['Increasing churn trend', 'Cohort degradation'],
            timeCriteria: {
              lookbackPeriod: 12,
              trendDirection: 'DETERIORATING'
            }
          }
        },
        {
          type: 'LOW_LTV_CAC_RATIO',
          threshold: 2.0,
          severity: 'CRITICAL',
          context: 'LTV/CAC <2.0 indicates unsustainable unit economics',
          detectionCriteria: {
            metricThresholds: { 'ltvCacRatio': 2.0 },
            patternIndicators: ['Rising CAC', 'Declining LTV'],
            timeCriteria: {
              lookbackPeriod: 6,
              trendDirection: 'DETERIORATING'
            }
          }
        }
      ],
      dueDiligenceFocus: [
        {
          area: 'Customer Metrics and Cohort Analysis',
          priority: 'HIGH',
          items: [
            {
              description: 'Analyze customer cohorts and retention patterns',
              requiredDocs: ['Customer data', 'Cohort analysis', 'Churn analysis'],
              analysisType: 'Quantitative',
              timeAllocation: 20
            }
          ],
          industryRisks: ['Customer concentration', 'Churn acceleration', 'Feature adoption'],
          expertRequirements: ['SaaS metrics specialist', 'Customer success expert']
        },
        {
          area: 'Product and Technology',
          priority: 'HIGH',
          items: [
            {
              description: 'Evaluate technology stack and scalability',
              requiredDocs: ['Technical architecture', 'Security audits', 'Infrastructure costs'],
              analysisType: 'Technical',
              timeAllocation: 30
            }
          ],
          industryRisks: ['Technical debt', 'Scalability limitations', 'Security vulnerabilities'],
          expertRequirements: ['Technical architect', 'Security specialist']
        }
      ],
      regulatoryConsiderations: [
        {
          area: 'Data Privacy',
          governingBodies: ['GDPR', 'CCPA', 'SOC 2'],
          keyRegulations: [
            {
              name: 'GDPR',
              effectiveDate: new Date('2018-05-25'),
              keyProvisions: ['Data consent', 'Right to deletion', 'Data portability'],
              complianceCost: 'MEDIUM',
              businessImpact: 'Operational processes and customer consent mechanisms'
            }
          ],
          complianceRequirements: ['Privacy policies', 'Data processing agreements', 'Security certifications'],
          recentChanges: [],
          pendingChanges: []
        }
      ],
      marketDynamics: {
        marketStructure: {
          concentration: 'FRAGMENTED',
          marketSize: 157000000000, // $157B
          growthRate: 0.18,
          maturityStage: 'GROWING',
          barriersToEntry: 'MEDIUM'
        },
        competitiveLandscape: {
          majorPlayers: 20,
          marketShareDistribution: 'FRAGMENTED',
          competitiveIntensity: 'HIGH',
          differentiationFactors: ['Features', 'Integrations', 'User experience', 'Pricing'],
          switchingCosts: 'MEDIUM'
        },
        growthDrivers: [
          'Digital transformation',
          'Remote work adoption',
          'Cloud migration',
          'API economy growth'
        ],
        marketRisks: [
          {
            type: 'Market saturation',
            probability: 'MEDIUM',
            impact: 'MEDIUM',
            mitigationStrategies: ['Vertical expansion', 'International markets']
          }
        ],
        cyclicality: {
          cyclical: false,
          economicSensitivity: 'MEDIUM',
          seasonalPatterns: true
        }
      }
    };
  }

  /**
   * Manufacturing industry configuration
   */
  private static getManufacturingConfig(): IndustryAnalysisConfig {
    return {
      industry: 'MANUFACTURING',
      keyMetrics: {
        primaryMetrics: [
          {
            name: 'Capacity Utilization',
            description: 'Percentage of total production capacity being used',
            formula: 'Actual Production / Maximum Production Capacity',
            typicalRanges: {
              excellent: [0.85, 0.95],
              good: [0.75, 0.85],
              average: [0.65, 0.75],
              poor: [0.40, 0.65]
            },
            industryBenchmarks: {
              median: 0.78,
              p25: 0.70,
              p75: 0.85,
              topQuartile: 0.90
            },
            criticalThresholds: {
              redFlag: 0.50,
              concern: 0.60
            }
          },
          {
            name: 'Inventory Turnover',
            description: 'How quickly inventory is sold and replaced',
            formula: 'Cost of Goods Sold / Average Inventory',
            typicalRanges: {
              excellent: [8, 15],
              good: [6, 8],
              average: [4, 6],
              poor: [2, 4]
            },
            industryBenchmarks: {
              median: 6.2,
              p25: 4.5,
              p75: 8.5,
              topQuartile: 10.0
            },
            criticalThresholds: {
              redFlag: 2.0,
              concern: 3.0
            }
          }
        ],
        secondaryMetrics: [
          {
            name: 'Overall Equipment Effectiveness',
            description: 'Measure of manufacturing productivity',
            formula: 'Availability × Performance × Quality',
            typicalRanges: {
              excellent: [0.85, 1.0],
              good: [0.70, 0.85],
              average: [0.60, 0.70],
              poor: [0.40, 0.60]
            },
            industryBenchmarks: {
              median: 0.65,
              p25: 0.55,
              p75: 0.75,
              topQuartile: 0.85
            },
            criticalThresholds: {
              redFlag: 0.45,
              concern: 0.55
            }
          }
        ],
        industryRatios: [
          {
            name: 'Asset Turnover',
            numerator: 'Revenue',
            denominator: 'Total Assets',
            interpretation: 'Measures efficiency of asset utilization',
            industryConsiderations: [
              'Capital-intensive industries typically have lower ratios',
              'Asset age and condition affect the ratio',
              'Lease vs buy decisions impact comparability'
            ]
          }
        ],
        benchmarks: [
          {
            metric: 'Capacity Utilization',
            source: 'Manufacturing Industry Report 2024',
            sampleSize: 300,
            timePeriod: '2023-2024',
            geography: 'North America',
            values: {
              mean: 0.76,
              median: 0.78,
              standardDeviation: 0.12,
              percentiles: {
                '10': 0.60,
                '25': 0.70,
                '50': 0.78,
                '75': 0.85,
                '90': 0.92
              }
            }
          }
        ]
      },
      valuationBenchmarks: {
        primaryMultiples: ['EV/EBITDA', 'EV/Revenue', 'P/E'],
        multipleRanges: {
          'EV/EBITDA': {
            multiple: 'EV/EBITDA',
            low: 6.0,
            high: 14.0,
            median: 9.5,
            performanceCriteria: ['EBITDA margin >15%', 'Stable operations', 'Market leadership']
          }
        },
        growthAdjustedMultiples: [
          {
            baseMultiple: 'EV/EBITDA',
            growthRanges: [
              { growthRate: [-0.05, 0.05], multipleAdjustment: -0.2 },
              { growthRate: [0.05, 0.15], multipleAdjustment: 0 },
              { growthRate: [0.15, 0.25], multipleAdjustment: 0.15 }
            ],
            adjustmentFormula: 'Base Multiple × (1 + Growth Adjustment)'
          }
        ],
        marginAdjustedMultiples: [
          {
            baseMultiple: 'EV/EBITDA',
            marginType: 'EBITDA',
            marginRanges: [
              { marginRange: [0, 0.10], multipleAdjustment: -0.3 },
              { marginRange: [0.10, 0.15], multipleAdjustment: -0.1 },
              { marginRange: [0.15, 0.25], multipleAdjustment: 0 },
              { marginRange: [0.25, 0.35], multipleAdjustment: 0.15 }
            ]
          }
        ],
        marketConditionsImpact: {
          bullMarket: 0.2,
          bearMarket: -0.3,
          creditImpact: {
            tight: -0.15,
            loose: 0.1
          },
          activityImpact: {
            high: 0.1,
            low: -0.1
          }
        }
      },
      commonRedFlags: [
        {
          type: 'LOW_CAPACITY_UTILIZATION',
          threshold: 0.60,
          severity: 'HIGH',
          context: 'Capacity utilization <60% indicates operational inefficiency',
          detectionCriteria: {
            metricThresholds: { 'capacityUtilization': 0.60 },
            patternIndicators: ['Declining orders', 'Market share loss'],
            timeCriteria: {
              lookbackPeriod: 6,
              trendDirection: 'DETERIORATING'
            }
          }
        },
        {
          type: 'INVENTORY_BUILDUP',
          threshold: 3.0,
          severity: 'MEDIUM',
          context: 'Inventory turnover <3.0x suggests demand issues or obsolete inventory',
          detectionCriteria: {
            metricThresholds: { 'inventoryTurnover': 3.0 },
            patternIndicators: ['Inventory aging', 'Slow-moving stock'],
            timeCriteria: {
              lookbackPeriod: 12,
              trendDirection: 'DETERIORATING'
            }
          }
        }
      ],
      dueDiligenceFocus: [
        {
          area: 'Operations and Manufacturing',
          priority: 'HIGH',
          items: [
            {
              description: 'Assess manufacturing processes and efficiency',
              requiredDocs: ['Production reports', 'Quality metrics', 'Capacity studies'],
              analysisType: 'Operational',
              timeAllocation: 40
            }
          ],
          industryRisks: ['Equipment obsolescence', 'Supply chain disruption', 'Quality issues'],
          expertRequirements: ['Manufacturing engineer', 'Operations specialist']
        },
        {
          area: 'Environmental and Safety',
          priority: 'HIGH',
          items: [
            {
              description: 'Evaluate environmental compliance and safety record',
              requiredDocs: ['Environmental permits', 'Safety reports', 'Compliance audits'],
              analysisType: 'Compliance',
              timeAllocation: 25
            }
          ],
          industryRisks: ['Environmental liabilities', 'Safety violations', 'Regulatory changes'],
          expertRequirements: ['Environmental consultant', 'Safety specialist']
        }
      ],
      regulatoryConsiderations: [
        {
          area: 'Environmental',
          governingBodies: ['EPA', 'OSHA', 'State regulators'],
          keyRegulations: [
            {
              name: 'Clean Air Act',
              effectiveDate: new Date('1970-12-31'),
              keyProvisions: ['Emission standards', 'Permit requirements', 'Monitoring'],
              complianceCost: 'HIGH',
              businessImpact: 'Capital investments for emission control equipment'
            }
          ],
          complianceRequirements: ['Environmental permits', 'Emission monitoring', 'Waste management'],
          recentChanges: [],
          pendingChanges: []
        }
      ],
      marketDynamics: {
        marketStructure: {
          concentration: 'MODERATELY_CONCENTRATED',
          marketSize: 2300000000000, // $2.3T
          growthRate: 0.04,
          maturityStage: 'MATURE',
          barriersToEntry: 'HIGH'
        },
        competitiveLandscape: {
          majorPlayers: 15,
          marketShareDistribution: 'MODERATE',
          competitiveIntensity: 'MEDIUM',
          differentiationFactors: ['Quality', 'Cost', 'Technology', 'Service'],
          switchingCosts: 'HIGH'
        },
        growthDrivers: [
          'Automation adoption',
          'Reshoring trends',
          'Infrastructure investment',
          'Industry 4.0'
        ],
        marketRisks: [
          {
            type: 'Economic cyclicality',
            probability: 'HIGH',
            impact: 'HIGH',
            mitigationStrategies: ['Diversification', 'Countercyclical products']
          }
        ],
        cyclicality: {
          cyclical: true,
          cycleLength: 7,
          currentPosition: 'RECOVERY',
          economicSensitivity: 'HIGH',
          seasonalPatterns: false
        }
      }
    };
  }

  /**
   * Healthcare industry configuration
   */
  private static getHealthcareConfig(): IndustryAnalysisConfig {
    return {
      industry: 'HEALTHCARE',
      keyMetrics: {
        primaryMetrics: [
          {
            name: 'Revenue per Patient',
            description: 'Average revenue generated per patient',
            formula: 'Total Revenue / Number of Patients',
            typicalRanges: {
              excellent: [8000, 15000],
              good: [5000, 8000],
              average: [3000, 5000],
              poor: [1000, 3000]
            },
            industryBenchmarks: {
              median: 5500,
              p25: 3800,
              p75: 7200,
              topQuartile: 9000
            },
            criticalThresholds: {
              redFlag: 2000,
              concern: 3000
            }
          },
          {
            name: 'Days in A/R',
            description: 'Average days to collect accounts receivable',
            formula: 'Accounts Receivable / (Daily Revenue)',
            typicalRanges: {
              excellent: [30, 45],
              good: [45, 60],
              average: [60, 90],
              poor: [90, 150]
            },
            industryBenchmarks: {
              median: 65,
              p25: 50,
              p75: 85,
              topQuartile: 40
            },
            criticalThresholds: {
              redFlag: 120,
              concern: 90
            }
          }
        ],
        secondaryMetrics: [
          {
            name: 'Patient Satisfaction Score',
            description: 'Patient satisfaction rating (typically 1-10 scale)',
            formula: 'Average patient satisfaction rating',
            typicalRanges: {
              excellent: [8.5, 10.0],
              good: [7.5, 8.5],
              average: [6.5, 7.5],
              poor: [4.0, 6.5]
            },
            industryBenchmarks: {
              median: 7.2,
              p25: 6.8,
              p75: 7.8,
              topQuartile: 8.3
            },
            criticalThresholds: {
              redFlag: 6.0,
              concern: 6.5
            }
          }
        ],
        industryRatios: [
          {
            name: 'Operating Margin',
            numerator: 'Operating Income',
            denominator: 'Total Revenue',
            interpretation: 'Measures operational efficiency after all operating expenses',
            industryConsiderations: [
              'Healthcare margins typically lower than other industries',
              'Reimbursement pressures affect margins',
              'Mix of payers impacts profitability'
            ]
          }
        ],
        benchmarks: [
          {
            metric: 'Operating Margin',
            source: 'Healthcare Industry Report 2024',
            sampleSize: 200,
            timePeriod: '2023-2024',
            geography: 'United States',
            values: {
              mean: 0.08,
              median: 0.06,
              standardDeviation: 0.04,
              percentiles: {
                '10': 0.02,
                '25': 0.04,
                '50': 0.06,
                '75': 0.10,
                '90': 0.14
              }
            }
          }
        ]
      },
      valuationBenchmarks: {
        primaryMultiples: ['EV/EBITDA', 'EV/Revenue', 'P/E'],
        multipleRanges: {
          'EV/EBITDA': {
            multiple: 'EV/EBITDA',
            low: 8.0,
            high: 18.0,
            median: 12.0,
            performanceCriteria: ['Stable patient base', 'Diverse payer mix', 'Quality outcomes']
          }
        },
        growthAdjustedMultiples: [
          {
            baseMultiple: 'EV/EBITDA',
            growthRanges: [
              { growthRate: [0, 0.05], multipleAdjustment: -0.15 },
              { growthRate: [0.05, 0.10], multipleAdjustment: 0 },
              { growthRate: [0.10, 0.20], multipleAdjustment: 0.2 }
            ],
            adjustmentFormula: 'Base Multiple × (1 + Growth Adjustment)'
          }
        ],
        marginAdjustedMultiples: [
          {
            baseMultiple: 'EV/EBITDA',
            marginType: 'EBITDA',
            marginRanges: [
              { marginRange: [0, 0.08], multipleAdjustment: -0.2 },
              { marginRange: [0.08, 0.15], multipleAdjustment: 0 },
              { marginRange: [0.15, 0.25], multipleAdjustment: 0.15 }
            ]
          }
        ],
        marketConditionsImpact: {
          bullMarket: 0.15,
          bearMarket: -0.25,
          creditImpact: {
            tight: -0.1,
            loose: 0.05
          },
          activityImpact: {
            high: 0.05,
            low: -0.1
          }
        }
      },
      commonRedFlags: [
        {
          type: 'HIGH_DAYS_IN_AR',
          threshold: 90,
          severity: 'HIGH',
          context: 'Days in A/R >90 indicates collection issues or payer problems',
          detectionCriteria: {
            metricThresholds: { 'daysInAR': 90 },
            patternIndicators: ['Increasing A/R aging', 'Payer disputes'],
            timeCriteria: {
              lookbackPeriod: 6,
              trendDirection: 'DETERIORATING'
            }
          }
        },
        {
          type: 'REGULATORY_VIOLATIONS',
          threshold: 1,
          severity: 'CRITICAL',
          context: 'Any significant regulatory violations pose serious risks',
          detectionCriteria: {
            metricThresholds: { 'regulatoryViolations': 1 },
            patternIndicators: ['FDA warnings', 'License suspensions'],
            timeCriteria: {
              lookbackPeriod: 24,
              trendDirection: 'STABLE'
            }
          }
        }
      ],
      dueDiligenceFocus: [
        {
          area: 'Regulatory and Compliance',
          priority: 'HIGH',
          items: [
            {
              description: 'Review regulatory compliance and quality certifications',
              requiredDocs: ['FDA records', 'Joint Commission reports', 'State licenses'],
              analysisType: 'Compliance',
              timeAllocation: 35
            }
          ],
          industryRisks: ['Regulatory changes', 'Quality violations', 'License issues'],
          expertRequirements: ['Healthcare regulatory specialist', 'Quality assurance expert']
        },
        {
          area: 'Reimbursement and Payer Relations',
          priority: 'HIGH',
          items: [
            {
              description: 'Analyze payer mix and reimbursement trends',
              requiredDocs: ['Payer contracts', 'Reimbursement data', 'A/R aging'],
              analysisType: 'Financial',
              timeAllocation: 30
            }
          ],
          industryRisks: ['Reimbursement cuts', 'Payer concentration', 'Bad debt'],
          expertRequirements: ['Healthcare finance specialist', 'Revenue cycle expert']
        }
      ],
      regulatoryConsiderations: [
        {
          area: 'Healthcare Quality and Safety',
          governingBodies: ['CMS', 'FDA', 'Joint Commission', 'State health departments'],
          keyRegulations: [
            {
              name: 'Conditions of Participation',
              effectiveDate: new Date('1965-07-01'),
              keyProvisions: ['Quality standards', 'Patient safety', 'Staff qualifications'],
              complianceCost: 'HIGH',
              businessImpact: 'Ongoing operational requirements and quality monitoring'
            }
          ],
          complianceRequirements: ['Quality reporting', 'Patient safety protocols', 'Staff credentialing'],
          recentChanges: [],
          pendingChanges: []
        }
      ],
      marketDynamics: {
        marketStructure: {
          concentration: 'MODERATELY_CONCENTRATED',
          marketSize: 4300000000000, // $4.3T
          growthRate: 0.06,
          maturityStage: 'MATURE',
          barriersToEntry: 'HIGH'
        },
        competitiveLandscape: {
          majorPlayers: 25,
          marketShareDistribution: 'MODERATE',
          competitiveIntensity: 'MEDIUM',
          differentiationFactors: ['Quality outcomes', 'Cost efficiency', 'Patient experience', 'Technology'],
          switchingCosts: 'HIGH'
        },
        growthDrivers: [
          'Aging population',
          'Technology adoption',
          'Value-based care',
          'Chronic disease management'
        ],
        marketRisks: [
          {
            type: 'Regulatory changes',
            probability: 'HIGH',
            impact: 'HIGH',
            mitigationStrategies: ['Compliance monitoring', 'Regulatory expertise']
          }
        ],
        cyclicality: {
          cyclical: false,
          economicSensitivity: 'LOW',
          seasonalPatterns: true
        }
      }
    };
  }

  /**
   * Fintech industry configuration
   */
  private static getFintechConfig(): IndustryAnalysisConfig {
    // Implementation would be similar to other industries
    return this.getGenericConfig();
  }

  /**
   * Retail industry configuration
   */
  private static getRetailConfig(): IndustryAnalysisConfig {
    // Implementation would be similar to other industries
    return this.getGenericConfig();
  }

  /**
   * Generic industry configuration for unsupported industries
   */
  private static getGenericConfig(): IndustryAnalysisConfig {
    return {
      industry: 'TECHNOLOGY',
      keyMetrics: {
        primaryMetrics: [],
        secondaryMetrics: [],
        industryRatios: [],
        benchmarks: []
      },
      valuationBenchmarks: {
        primaryMultiples: ['EV/EBITDA', 'EV/Revenue', 'P/E'],
        multipleRanges: {},
        growthAdjustedMultiples: [],
        marginAdjustedMultiples: [],
        marketConditionsImpact: {
          bullMarket: 0.2,
          bearMarket: -0.3,
          creditImpact: { tight: -0.15, loose: 0.1 },
          activityImpact: { high: 0.1, low: -0.1 }
        }
      },
      commonRedFlags: [],
      dueDiligenceFocus: [],
      regulatoryConsiderations: [],
      marketDynamics: {
        marketStructure: {
          concentration: 'MODERATELY_CONCENTRATED',
          marketSize: 0,
          growthRate: 0.05,
          maturityStage: 'MATURE',
          barriersToEntry: 'MEDIUM'
        },
        competitiveLandscape: {
          majorPlayers: 10,
          marketShareDistribution: 'MODERATE',
          competitiveIntensity: 'MEDIUM',
          differentiationFactors: [],
          switchingCosts: 'MEDIUM'
        },
        growthDrivers: [],
        marketRisks: [],
        cyclicality: {
          cyclical: false,
          economicSensitivity: 'MEDIUM',
          seasonalPatterns: false
        }
      }
    };
  }

  /**
   * Validate metrics against industry benchmarks
   */
  static validateIndustryMetrics(
    metrics: FinancialMetrics, 
    industry: IndustryType,
    customMetrics?: any
  ): IndustryValidationResult {
    const config = this.getIndustryConfig(industry);
    const validationResults: MetricValidationResult[] = [];

    // Validate each key metric
    config.keyMetrics.primaryMetrics.forEach(metricDef => {
      const result = this.validateMetric(metrics, metricDef, customMetrics);
      validationResults.push(result);
    });

    // Calculate overall score
    const averageScore = validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;

    return {
      industry,
      overallScore: averageScore,
      metricResults: validationResults,
      industryBenchmarkComparison: this.compareToIndustryBenchmarks(metrics, config),
      recommendations: this.generateIndustryRecommendations(validationResults, config)
    };
  }

  private static validateMetric(
    metrics: FinancialMetrics, 
    metricDef: MetricDefinition, 
    customMetrics?: any
  ): MetricValidationResult {
    // This would extract the actual metric value based on the metric definition
    // For now, returning a placeholder result
    const actualValue = this.extractMetricValue(metrics, metricDef, customMetrics);
    
    let score = 50; // Default score
    let performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' = 'AVERAGE';
    
    if (actualValue !== null) {
      // Determine performance level
      if (actualValue >= metricDef.typicalRanges.excellent[0] && actualValue <= metricDef.typicalRanges.excellent[1]) {
        performance = 'EXCELLENT';
        score = 90;
      } else if (actualValue >= metricDef.typicalRanges.good[0] && actualValue <= metricDef.typicalRanges.good[1]) {
        performance = 'GOOD';
        score = 75;
      } else if (actualValue >= metricDef.typicalRanges.average[0] && actualValue <= metricDef.typicalRanges.average[1]) {
        performance = 'AVERAGE';
        score = 60;
      } else {
        performance = 'POOR';
        score = 30;
      }
    }

    return {
      metricName: metricDef.name,
      actualValue,
      industryMedian: metricDef.industryBenchmarks.median,
      percentile: this.calculatePercentile(actualValue, metricDef.industryBenchmarks),
      performance,
      score,
      redFlag: actualValue !== null && actualValue < metricDef.criticalThresholds.redFlag,
      concern: actualValue !== null && actualValue < metricDef.criticalThresholds.concern
    };
  }

  private static extractMetricValue(
    metrics: FinancialMetrics, 
    metricDef: MetricDefinition, 
    customMetrics?: any
  ): number | null {
    // This would implement logic to extract the actual metric value
    // based on the metric definition formula and available data
    // For now, returning null as placeholder
    return null;
  }

  private static calculatePercentile(value: number | null, benchmarks: any): number {
    if (value === null) return 50;
    
    // Simple percentile calculation based on benchmarks
    if (value >= benchmarks.p75) return 75;
    if (value >= benchmarks.median) return 50;
    if (value >= benchmarks.p25) return 25;
    return 10;
  }

  private static compareToIndustryBenchmarks(
    metrics: FinancialMetrics, 
    config: IndustryAnalysisConfig
  ): BenchmarkComparison {
    // Implementation for benchmark comparison
    return {
      revenueGrowthComparison: 0,
      marginComparison: 0,
      efficiencyComparison: 0,
      overallRanking: 'AVERAGE'
    };
  }

  private static generateIndustryRecommendations(
    results: MetricValidationResult[], 
    config: IndustryAnalysisConfig
  ): string[] {
    const recommendations: string[] = [];
    
    results.forEach(result => {
      if (result.redFlag) {
        recommendations.push(`Address critical issue with ${result.metricName} - performance well below industry standards`);
      } else if (result.concern) {
        recommendations.push(`Improve ${result.metricName} to meet industry benchmarks`);
      }
    });

    return recommendations;
  }
}

/**
 * Industry validation result
 */
export interface IndustryValidationResult {
  industry: IndustryType;
  overallScore: number;
  metricResults: MetricValidationResult[];
  industryBenchmarkComparison: BenchmarkComparison;
  recommendations: string[];
}

/**
 * Metric validation result
 */
export interface MetricValidationResult {
  metricName: string;
  actualValue: number | null;
  industryMedian: number;
  percentile: number;
  performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  score: number;
  redFlag: boolean;
  concern: boolean;
}

/**
 * Benchmark comparison result
 */
export interface BenchmarkComparison {
  revenueGrowthComparison: number;
  marginComparison: number;
  efficiencyComparison: number;
  overallRanking: 'TOP_QUARTILE' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE' | 'BOTTOM_QUARTILE';
}