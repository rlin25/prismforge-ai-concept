/**
 * M&A Domain Knowledge Base - Central Export Module
 * Comprehensive TypeScript modules for M&A due diligence and analysis
 */

// Financial terminology and calculations
export * from './financial-terms';

// Validation frameworks for financial analysis
export * from './validation-frameworks';

// Red flag detection and pattern analysis
export * from './red-flags';

// Industry-specific analysis frameworks
export * from './industry-specifics';

// Deal structure templates and analysis
export * from './deal-structures';

/**
 * Knowledge base configuration and utilities
 */
export interface KnowledgeBaseConfig {
  /** Enabled modules */
  enabledModules: KnowledgeModule[];
  /** Default industry for analysis */
  defaultIndustry: string;
  /** Validation thresholds */
  validationThresholds: ValidationThresholds;
  /** Red flag sensitivity */
  redFlagSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export type KnowledgeModule = 
  | 'FINANCIAL_TERMS'
  | 'VALIDATION_FRAMEWORKS'
  | 'RED_FLAGS'
  | 'INDUSTRY_SPECIFICS'
  | 'DEAL_STRUCTURES';

/**
 * Validation threshold configuration
 */
export interface ValidationThresholds {
  /** DCF validation minimum score */
  dcfMinScore: number;
  /** Comparable companies minimum sample size */
  compMinSampleSize: number;
  /** Precedent transactions minimum sample size */
  precedentMinSampleSize: number;
  /** Red flag critical threshold */
  redFlagCriticalThreshold: number;
  /** Industry metric variance tolerance */
  industryVarianceTolerance: number;
}

/**
 * Default knowledge base configuration
 */
export const DEFAULT_KNOWLEDGE_CONFIG: KnowledgeBaseConfig = {
  enabledModules: [
    'FINANCIAL_TERMS',
    'VALIDATION_FRAMEWORKS', 
    'RED_FLAGS',
    'INDUSTRY_SPECIFICS',
    'DEAL_STRUCTURES'
  ],
  defaultIndustry: 'TECHNOLOGY',
  validationThresholds: {
    dcfMinScore: 70,
    compMinSampleSize: 5,
    precedentMinSampleSize: 3,
    redFlagCriticalThreshold: 80,
    industryVarianceTolerance: 0.20
  },
  redFlagSensitivity: 'MEDIUM'
};

/**
 * Knowledge base utility functions
 */
export class KnowledgeBaseUtils {
  
  /**
   * Get all available financial metrics definitions
   */
  static getFinancialMetricsDefinitions(): Record<string, string> {
    return {
      'Revenue Growth Rate': 'Year-over-year percentage change in total revenue',
      'EBITDA Margin': 'EBITDA as a percentage of revenue',
      'Free Cash Flow Margin': 'Free cash flow as a percentage of revenue',
      'Return on Invested Capital': 'NOPAT divided by invested capital',
      'Debt-to-EBITDA Ratio': 'Total debt divided by EBITDA',
      'Working Capital Turnover': 'Revenue divided by working capital',
      'Asset Turnover': 'Revenue divided by total assets',
      'Inventory Turnover': 'Cost of goods sold divided by average inventory',
      'Days Sales Outstanding': 'Accounts receivable divided by daily sales',
      'Customer Acquisition Cost': 'Sales and marketing spend divided by new customers',
      'Customer Lifetime Value': 'Average revenue per customer times retention period',
      'Annual Recurring Revenue': 'Predictable revenue from subscriptions',
      'Net Revenue Retention': 'Revenue retention including expansion from existing customers',
      'Gross Revenue Retention': 'Revenue retention excluding expansion',
      'Rule of 40': 'Sum of revenue growth rate and free cash flow margin'
    };
  }

  /**
   * Get validation framework checklist
   */
  static getValidationChecklist(): ValidationChecklistItem[] {
    return [
      {
        category: 'DCF Analysis',
        items: [
          'Discount rate reasonableness (6-20%)',
          'Terminal growth rate conservatism (<4%)',
          'Revenue growth sustainability',
          'Margin progression realism',
          'Terminal value percentage (<75%)',
          'Sensitivity analysis completeness'
        ]
      },
      {
        category: 'Comparable Companies',
        items: [
          'Sample size adequacy (≥5 companies)',
          'Industry relevance (≥80%)',
          'Size comparability (≤10x revenue range)',
          'Business model similarity',
          'Geographic relevance',
          'Trading liquidity'
        ]
      },
      {
        category: 'Precedent Transactions',
        items: [
          'Sample size adequacy (≥3 transactions)',
          'Time relevance (≤3 years)',
          'Industry relevance',
          'Deal size comparability',
          'Market conditions similarity',
          'Data quality and completeness'
        ]
      }
    ];
  }

  /**
   * Get red flag detection rules
   */
  static getRedFlagRules(): RedFlagRule[] {
    return [
      {
        category: 'Revenue Quality',
        rules: [
          { metric: 'Customer Concentration', threshold: 30, operator: '>', severity: 'HIGH' },
          { metric: 'Related Party Revenue %', threshold: 10, operator: '>', severity: 'MEDIUM' },
          { metric: 'Q4 Revenue Concentration %', threshold: 40, operator: '>', severity: 'MEDIUM' }
        ]
      },
      {
        category: 'Profitability',
        rules: [
          { metric: 'EBITDA Add-backs %', threshold: 20, operator: '>', severity: 'HIGH' },
          { metric: 'Gross Margin Decline', threshold: 5, operator: '>', severity: 'MEDIUM' },
          { metric: 'EBITDA vs Gross Margin', threshold: 0, operator: '>', severity: 'CRITICAL' }
        ]
      },
      {
        category: 'Growth Patterns',
        rules: [
          { metric: 'Hockey Stick Growth Ratio', threshold: 2.0, operator: '>', severity: 'HIGH' },
          { metric: 'Margin Expansion Rate', threshold: 15, operator: '>', severity: 'MEDIUM' },
          { metric: 'Revenue Growth Acceleration', threshold: 3.0, operator: '>', severity: 'MEDIUM' }
        ]
      },
      {
        category: 'Cash Flow',
        rules: [
          { metric: 'FCF vs EBITDA Variance', threshold: -20, operator: '<', severity: 'MEDIUM' },
          { metric: 'Working Capital % Change', threshold: 10, operator: '>', severity: 'MEDIUM' },
          { metric: 'Capex % of Revenue', threshold: 15, operator: '>', severity: 'LOW' }
        ]
      }
    ];
  }

  /**
   * Get industry-specific focus areas
   */
  static getIndustryFocusAreas(industry: string): IndustryFocusArea[] {
    const commonAreas = [
      {
        area: 'Financial Analysis',
        priority: 'HIGH' as const,
        timeAllocation: 40,
        keyMetrics: ['Revenue Growth', 'EBITDA Margin', 'Cash Flow']
      },
      {
        area: 'Market Position',
        priority: 'HIGH' as const,
        timeAllocation: 30,
        keyMetrics: ['Market Share', 'Competitive Position', 'Customer Satisfaction']
      },
      {
        area: 'Operational Efficiency',
        priority: 'MEDIUM' as const,
        timeAllocation: 20,
        keyMetrics: ['Asset Turnover', 'Productivity Metrics', 'Cost Structure']
      }
    ];

    // Add industry-specific areas
    switch (industry.toUpperCase()) {
      case 'SAAS':
        return [
          ...commonAreas,
          {
            area: 'SaaS Metrics',
            priority: 'HIGH' as const,
            timeAllocation: 50,
            keyMetrics: ['ARR Growth', 'LTV/CAC', 'Churn Rate', 'NRR']
          }
        ];
      case 'MANUFACTURING':
        return [
          ...commonAreas,
          {
            area: 'Manufacturing Operations',
            priority: 'HIGH' as const,
            timeAllocation: 45,
            keyMetrics: ['Capacity Utilization', 'OEE', 'Inventory Turnover']
          }
        ];
      case 'HEALTHCARE':
        return [
          ...commonAreas,
          {
            area: 'Regulatory Compliance',
            priority: 'HIGH' as const,
            timeAllocation: 35,
            keyMetrics: ['Compliance Score', 'Quality Metrics', 'Reimbursement Rates']
          }
        ];
      default:
        return commonAreas;
    }
  }

  /**
   * Get deal structure recommendations
   */
  static getDealStructureRecommendations(
    dealSize: number,
    taxObjectives: string[],
    riskProfile: string
  ): DealStructureRecommendation[] {
    const recommendations: DealStructureRecommendation[] = [];

    // Size-based recommendations
    if (dealSize < 50000000) { // Under $50M
      recommendations.push({
        structure: 'ASSET_PURCHASE',
        rationale: 'Asset purchase allows for step-up in basis and selective liability assumption',
        advantages: ['Tax benefits', 'Risk mitigation', 'Flexibility'],
        considerations: ['Transfer requirements', 'Third-party consents']
      });
    } else if (dealSize > 500000000) { // Over $500M
      recommendations.push({
        structure: 'MERGER',
        rationale: 'Merger structure provides efficiency for large, complex transactions',
        advantages: ['Operational efficiency', 'Automatic transfer', 'Shareholder approval'],
        considerations: ['Regulatory approval', 'Appraisal rights', 'Integration complexity']
      });
    } else {
      recommendations.push({
        structure: 'STOCK_PURCHASE',
        rationale: 'Stock purchase balances simplicity with comprehensive acquisition',
        advantages: ['Simplicity', 'Speed', 'Comprehensive acquisition'],
        considerations: ['Unknown liabilities', 'Tax elections', 'Due diligence scope']
      });
    }

    // Tax objective-based recommendations
    if (taxObjectives.includes('DEFERRAL')) {
      recommendations.push({
        structure: 'MERGER',
        rationale: 'Stock consideration in merger can provide tax deferral for sellers',
        advantages: ['Tax deferral', 'Continued ownership', 'Earnout potential'],
        considerations: ['Market risk', 'Liquidity constraints', 'Collar provisions']
      });
    }

    // Risk profile-based recommendations
    if (riskProfile === 'LOW_RISK') {
      recommendations.push({
        structure: 'ASSET_PURCHASE',
        rationale: 'Asset purchase minimizes unknown liability exposure',
        advantages: ['Known liabilities', 'Selective assumptions', 'Clean ownership'],
        considerations: ['Higher complexity', 'Transfer costs', 'Excluded assets']
      });
    }

    return recommendations;
  }
}

/**
 * Validation checklist item
 */
export interface ValidationChecklistItem {
  category: string;
  items: string[];
}

/**
 * Red flag rule definition
 */
export interface RedFlagRule {
  category: string;
  rules: RedFlagRuleDetail[];
}

/**
 * Red flag rule detail
 */
export interface RedFlagRuleDetail {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Industry focus area
 */
export interface IndustryFocusArea {
  area: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timeAllocation: number;
  keyMetrics: string[];
}

/**
 * Deal structure recommendation
 */
export interface DealStructureRecommendation {
  structure: string;
  rationale: string;
  advantages: string[];
  considerations: string[];
}