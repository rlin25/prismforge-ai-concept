/**
 * Preprocessing prompts for Haiku 3.5 cost optimization
 * Handles document parsing, content extraction, and initial processing
 */

import { DocumentType, IndustryType, Document } from '../types/core';

export interface PreprocessingResult {
  extractedContent: ExtractedContent;
  documentSummary: DocumentSummary;
  keyMetrics: KeyMetric[];
  structuredData: StructuredData;
  processingMetadata: ProcessingMetadata;
}

export interface ExtractedContent {
  executiveSummary: string;
  financialHighlights: string[];
  businessOverview: string;
  marketAnalysis: string;
  riskFactors: string[];
  appendices: string[];
}

export interface DocumentSummary {
  overview: string;
  keyTakeaways: string[];
  criticalIssues: string[];
  dataQualityAssessment: string;
  completenessScore: number;
}

export interface KeyMetric {
  name: string;
  value: string | number;
  unit: string;
  timeFrame: string;
  source: string;
  confidence: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';
}

export interface StructuredData {
  company: CompanyData;
  financial: FinancialData;
  market: MarketData;
  operational: OperationalData;
  legal: LegalData;
}

export interface CompanyData {
  name: string;
  industry: string;
  foundedYear?: number;
  headquarters: string;
  employeeCount?: number;
  businessModel: string;
  keyProducts: string[];
}

export interface FinancialData {
  revenue: MetricSeries[];
  ebitda: MetricSeries[];
  netIncome: MetricSeries[];
  cashFlow: MetricSeries[];
  debt: MetricSeries[];
  workingCapital: MetricSeries[];
}

export interface MetricSeries {
  year: number;
  value: number;
  unit: string;
  source: string;
}

export interface MarketData {
  tam: number;
  sam: number;
  som: number;
  marketGrowthRate: number;
  competitivePosition: string;
  marketShare: number;
}

export interface OperationalData {
  facilities: string[];
  keyCustomers: string[];
  suppliers: string[];
  technology: string[];
  processes: string[];
}

export interface LegalData {
  corporateStructure: string;
  jurisdiction: string;
  materialContracts: string[];
  litigation: string[];
  intellectualProperty: string[];
}

export interface ProcessingMetadata {
  processingTime: number;
  tokensUsed: number;
  confidence: number;
  extractionMethod: string;
  qualityFlags: string[];
}

/**
 * Haiku 3.5 Document Preprocessing Prompts
 */
export class PreprocessingPrompts {
  
  /**
   * Initial document analysis and content extraction
   */
  static getDocumentExtractionPrompt(documentType: DocumentType): string {
    return `
    You are a specialized document analysis AI optimized for M&A due diligence. Your task is to extract and structure key information from a ${documentType} document.

    EXTRACTION OBJECTIVES:
    1. Extract all quantitative data (financial metrics, dates, percentages, etc.)
    2. Identify key qualitative themes and narratives
    3. Structure information for downstream AI agent analysis
    4. Flag data quality issues and missing information
    5. Assess document completeness and reliability

    OUTPUT FORMAT (JSON):
    {
      "document_type": "${documentType}",
      "extraction_summary": {
        "total_sections": number,
        "data_rich_sections": number,
        "quality_score": number (0-100),
        "completeness_score": number (0-100)
      },
      "extracted_content": {
        "executive_summary": "string",
        "key_financials": [
          {
            "metric": "string",
            "value": "string|number",
            "timeframe": "string",
            "source_page": number
          }
        ],
        "business_overview": "string",
        "market_analysis": "string",
        "risk_factors": ["string"],
        "growth_drivers": ["string"]
      },
      "structured_data": {
        // Document-type specific structured data
      },
      "quality_flags": [
        {
          "issue": "string",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "string"
        }
      ]
    }

    EXTRACTION RULES:
    - Be precise and conservative with quantitative data
    - Preserve original context for qualitative statements
    - Flag inconsistencies, gaps, or unclear information
    - Maintain source references for all extracted data
    - Focus on M&A relevant information
    - Exclude boilerplate and standard legal language

    ${this.getDocumentSpecificInstructions(documentType)}
    `;
  }

  /**
   * Content summarization for efficient processing
   */
  static getContentSummarizationPrompt(documentType: DocumentType): string {
    return `
    Create a comprehensive but concise summary of this ${documentType} document for M&A analysis.

    SUMMARIZATION FOCUS:
    1. Investment thesis and strategic rationale
    2. Key financial metrics and performance trends
    3. Market position and competitive advantages
    4. Major risks and concerns
    5. Critical assumptions and projections

    OUTPUT FORMAT:
    {
      "executive_summary": "2-3 paragraph overview",
      "key_highlights": [
        "Most important positive points (max 5)"
      ],
      "major_concerns": [
        "Significant risks or red flags (max 5)"
      ],
      "critical_metrics": [
        {
          "metric": "string",
          "current_value": "string",
          "trend": "string",
          "benchmark_comparison": "string"
        }
      ],
      "assumptions_to_validate": [
        "Key assumptions requiring verification"
      ]
    }

    SUMMARIZATION PRINCIPLES:
    - Maintain objectivity - present facts without editorial bias
    - Highlight both positive and negative aspects equally
    - Focus on material information that impacts deal value
    - Preserve specific numbers and percentages
    - Flag unsubstantiated claims or weak evidence
    - Identify gaps in information or analysis
    `;
  }

  /**
   * Data validation and quality assessment
   */
  static getDataValidationPrompt(): string {
    return `
    Perform comprehensive data validation and quality assessment on the extracted information.

    VALIDATION CHECKLIST:
    1. Numerical Consistency:
       - Do calculations add up correctly?
       - Are percentages and ratios mathematically sound?
       - Are growth rates calculated properly?

    2. Temporal Consistency:
       - Are historical data points sequential?
       - Do projections align with historical trends?
       - Are time periods consistently defined?

    3. Logical Consistency:
       - Do qualitative statements match quantitative data?
       - Are market size claims reasonable?
       - Do financial projections follow business logic?

    4. Completeness Assessment:
       - What critical information is missing?
       - Are key sections incomplete or unclear?
       - What additional data is needed for analysis?

    OUTPUT FORMAT:
    {
      "validation_summary": {
        "overall_quality": "EXCELLENT|GOOD|FAIR|POOR",
        "data_completeness": number (0-100),
        "internal_consistency": number (0-100),
        "external_benchmarking": number (0-100)
      },
      "identified_issues": [
        {
          "category": "CALCULATION|TEMPORAL|LOGICAL|COMPLETENESS",
          "description": "string",
          "severity": "LOW|MEDIUM|HIGH|CRITICAL",
          "impact": "string",
          "recommendation": "string"
        }
      ],
      "missing_information": [
        {
          "information_type": "string",
          "importance": "LOW|MEDIUM|HIGH|CRITICAL",
          "impact_on_analysis": "string"
        }
      ],
      "quality_score": number (0-100),
      "processing_notes": ["Any additional observations"]
    }

    VALIDATION STANDARDS:
    - Apply industry-standard benchmarks where available
    - Use conservative assumptions for missing data
    - Flag outliers and anomalies for further investigation
    - Assess reliability of information sources
    - Consider document age and market conditions
    `;
  }

  /**
   * Key metrics extraction optimized for Haiku
   */
  static getMetricsExtractionPrompt(industry: IndustryType): string {
    const industryMetrics = this.getIndustrySpecificMetrics(industry);
    
    return `
    Extract and organize key performance metrics relevant to M&A analysis in the ${industry} industry.

    TARGET METRICS:
    ${industryMetrics.core.map(metric => `- ${metric}`).join('\n')}

    ${industry}-SPECIFIC METRICS:
    ${industryMetrics.specific.map(metric => `- ${metric}`).join('\n')}

    OUTPUT FORMAT:
    {
      "financial_metrics": [
        {
          "name": "string",
          "values": [
            {
              "period": "string (e.g., '2023', 'Q4 2023', 'LTM')",
              "value": number,
              "unit": "string",
              "growth_rate": number,
              "source": "string"
            }
          ],
          "trend_analysis": "IMPROVING|STABLE|DECLINING",
          "benchmark_comparison": "ABOVE_AVERAGE|AVERAGE|BELOW_AVERAGE"
        }
      ],
      "operational_metrics": [
        // Similar structure for operational KPIs
      ],
      "market_metrics": [
        // Similar structure for market-related metrics
      ]
    }

    EXTRACTION PRIORITIES:
    1. Revenue and growth metrics (highest priority)
    2. Profitability and margin metrics
    3. Cash flow and liquidity metrics
    4. Industry-specific operational metrics
    5. Market position and competitive metrics

    QUALITY REQUIREMENTS:
    - Verify all calculations independently
    - Provide growth rates where possible
    - Note data source and reliability
    - Flag estimated or projected values
    - Include both absolute values and ratios
    `;
  }

  /**
   * Risk factor identification prompt
   */
  static getRiskIdentificationPrompt(documentType: DocumentType): string {
    return `
    Identify and categorize potential risk factors from this ${documentType} document.

    RISK CATEGORIES TO ANALYZE:
    1. Financial Risks:
       - Revenue concentration, volatility, sustainability
       - Profitability pressures and margin compression
       - Cash flow timing and working capital issues
       - Debt levels and covenant compliance

    2. Operational Risks:
       - Key person dependencies
       - Technology and system vulnerabilities
       - Supply chain and vendor concentration
       - Regulatory and compliance exposures

    3. Market Risks:
       - Competitive threats and market disruption
       - Customer retention and satisfaction
       - Market cyclicality and secular trends
       - Pricing power and margin pressure

    4. Strategic Risks:
       - Integration complexity and execution
       - Cultural alignment and change management
       - Synergy realization challenges
       - Strategic option limitation

    OUTPUT FORMAT:
    {
      "risk_summary": {
        "overall_risk_profile": "LOW|MODERATE|HIGH|VERY_HIGH",
        "primary_risk_drivers": ["Top 3-5 risk factors"],
        "risk_mitigation_quality": "POOR|FAIR|GOOD|EXCELLENT"
      },
      "identified_risks": [
        {
          "category": "FINANCIAL|OPERATIONAL|MARKET|STRATEGIC",
          "risk_factor": "string",
          "description": "string",
          "potential_impact": "MINIMAL|MODERATE|SIGNIFICANT|SEVERE",
          "likelihood": "UNLIKELY|POSSIBLE|LIKELY|HIGHLY_LIKELY",
          "evidence": "string",
          "current_mitigation": "string",
          "additional_mitigation": "string"
        }
      ],
      "red_flags": [
        {
          "flag": "string",
          "severity": "MEDIUM|HIGH|CRITICAL",
          "explanation": "string"
        }
      ]
    }

    RISK IDENTIFICATION PRINCIPLES:
    - Focus on material risks that could impact deal value
    - Consider both disclosed and undisclosed risks
    - Assess current risk management effectiveness
    - Look for risk factor interconnections and correlations
    - Consider deal-specific and integration risks
    `;
  }

  /**
   * Get document-specific extraction instructions
   */
  private static getDocumentSpecificInstructions(documentType: DocumentType): string {
    const instructions: Record<DocumentType, string> = {
      CIM: `
      CIM-SPECIFIC EXTRACTION:
      - Investment highlights and thesis
      - Management team bios and experience
      - Business model and revenue streams
      - Market opportunity and positioning
      - Financial performance and projections
      - Growth strategy and initiatives
      - Competitive advantages and moats
      `,
      FINANCIAL_MODEL: `
      FINANCIAL MODEL EXTRACTION:
      - Historical financial statements (3-5 years)
      - Detailed projections and assumptions
      - Sensitivity analysis and scenarios
      - Key driver assumptions and logic
      - Valuation methodology and multiples
      - Cash flow and debt capacity analysis
      `,
      LOI: `
      LOI-SPECIFIC EXTRACTION:
      - Purchase price and structure
      - Key deal terms and conditions
      - Due diligence requirements and timeline
      - Closing conditions and contingencies
      - Post-closing arrangements
      - Termination and break-up provisions
      `,
      SPA: `
      SPA-SPECIFIC EXTRACTION:
      - Purchase price adjustment mechanisms
      - Representations, warranties, and indemnities
      - Closing conditions and deliverables
      - Post-closing covenants and restrictions
      - Dispute resolution procedures
      - Termination and remedy provisions
      `,
      DD_REPORT: `
      DD REPORT EXTRACTION:
      - Due diligence scope and methodology
      - Key findings by functional area
      - Risk assessment and quantification
      - Management responses and action plans
      - Recommendations and next steps
      - Outstanding issues and follow-ups
      `,
      VALUATION: `
      VALUATION EXTRACTION:
      - Valuation methodologies used
      - Comparable company analysis
      - Precedent transaction analysis
      - DCF assumptions and sensitivities
      - Sum-of-the-parts analysis
      - Valuation range and recommendation
      `,
      PITCH_DECK: `
      PITCH DECK EXTRACTION:
      - Investment thesis and rationale
      - Company overview and history
      - Market opportunity and trends
      - Competitive landscape analysis
      - Financial highlights and projections
      - Strategic benefits and synergies
      `,
      MANAGEMENT_PRESENTATION: `
      MANAGEMENT PRESENTATION EXTRACTION:
      - Leadership team and governance
      - Strategic vision and initiatives
      - Operational performance metrics
      - Market position and differentiation
      - Growth plans and capital allocation
      - Q&A responses and clarifications
      `
    };

    return instructions[documentType] || '';
  }

  /**
   * Get industry-specific metrics for extraction
   */
  private static getIndustrySpecificMetrics(industry: IndustryType): { core: string[], specific: string[] } {
    const coreMetrics = [
      'Revenue',
      'EBITDA', 
      'Net Income',
      'Cash Flow from Operations',
      'Working Capital',
      'Total Debt',
      'Market Share'
    ];

    const industrySpecific: Record<IndustryType, string[]> = {
      SAAS: [
        'Monthly Recurring Revenue (MRR)',
        'Annual Recurring Revenue (ARR)',
        'Customer Acquisition Cost (CAC)',
        'Customer Lifetime Value (LTV)',
        'Churn Rate',
        'Net Revenue Retention',
        'Gross Revenue Retention'
      ],
      MANUFACTURING: [
        'Capacity Utilization',
        'Inventory Turnover',
        'Order Backlog',
        'Production Volume',
        'Raw Material Costs',
        'Labor Productivity',
        'Equipment Utilization'
      ],
      HEALTHCARE: [
        'Patient Volume',
        'Revenue per Patient',
        'Payor Mix',
        'Length of Stay',
        'Readmission Rates',
        'Staff Productivity',
        'Regulatory Compliance Score'
      ],
      FINTECH: [
        'Transaction Volume',
        'Take Rate',
        'Active Users',
        'Payment Volume',
        'Processing Fees',
        'Fraud Rate',
        'Regulatory Capital Ratio'
      ],
      RETAIL: [
        'Same Store Sales',
        'Inventory Turnover',
        'Gross Margin per Category',
        'Customer Traffic',
        'Average Transaction Value',
        'Store Productivity',
        'E-commerce Penetration'
      ],
      ENERGY: [
        'Production Volume',
        'Proven Reserves',
        'Reserve Replacement Ratio',
        'Finding and Development Costs',
        'Netback per Unit',
        'Decline Rate',
        'Environmental Compliance'
      ],
      REAL_ESTATE: [
        'Occupancy Rate',
        'Net Operating Income',
        'Revenue per Square Foot',
        'Capitalization Rate',
        'Lease Renewal Rate',
        'Tenant Retention',
        'Development Pipeline'
      ],
      TECHNOLOGY: [
        'Research and Development Spend',
        'Patent Portfolio Value',
        'Product Development Cycle',
        'Market Share by Product',
        'Customer Satisfaction Score',
        'Technology Refresh Rate',
        'Talent Retention Rate'
      ],
      OTHER: [
        'Industry-Specific KPIs',
        'Market Position Metrics',
        'Operational Efficiency Ratios',
        'Customer Metrics',
        'Financial Ratios'
      ]
    };

    return {
      core: coreMetrics,
      specific: industrySpecific[industry] || industrySpecific.OTHER
    };
  }
}

/**
 * Preprocessing pipeline for optimal Haiku 3.5 usage
 */
export class PreprocessingPipeline {
  
  /**
   * Execute complete preprocessing pipeline
   */
  static async processDocument(document: Document): Promise<PreprocessingResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Extract structured content
      const extractedContent = await this.extractContent(document);
      
      // Step 2: Generate document summary
      const documentSummary = await this.generateSummary(document, extractedContent);
      
      // Step 3: Extract key metrics
      const keyMetrics = await this.extractMetrics(document, extractedContent);
      
      // Step 4: Structure data for agent consumption
      const structuredData = await this.structureData(extractedContent, keyMetrics);
      
      // Step 5: Generate processing metadata
      const processingMetadata: ProcessingMetadata = {
        processingTime: Date.now() - startTime,
        tokensUsed: this.estimateTokenUsage(document.content),
        confidence: this.calculateConfidence(extractedContent, keyMetrics),
        extractionMethod: 'Haiku_3.5_Optimized',
        qualityFlags: this.identifyQualityFlags(extractedContent)
      };

      return {
        extractedContent,
        documentSummary,
        keyMetrics,
        structuredData,
        processingMetadata
      };
    } catch (error) {
      throw new Error(`Preprocessing failed: ${error}`);
    }
  }

  // Private helper methods for preprocessing pipeline
  private static async extractContent(document: Document): Promise<ExtractedContent> {
    // Implementation would use Haiku 3.5 with extraction prompt
    // This is a mock implementation
    return {
      executiveSummary: '',
      financialHighlights: [],
      businessOverview: '',
      marketAnalysis: '',
      riskFactors: [],
      appendices: []
    };
  }

  private static async generateSummary(document: Document, content: ExtractedContent): Promise<DocumentSummary> {
    // Implementation would use Haiku 3.5 with summarization prompt
    return {
      overview: '',
      keyTakeaways: [],
      criticalIssues: [],
      dataQualityAssessment: '',
      completenessScore: 85
    };
  }

  private static async extractMetrics(document: Document, content: ExtractedContent): Promise<KeyMetric[]> {
    // Implementation would use Haiku 3.5 with metrics extraction prompt
    return [];
  }

  private static async structureData(content: ExtractedContent, metrics: KeyMetric[]): Promise<StructuredData> {
    // Implementation would structure data for downstream processing
    return {
      company: {
        name: '',
        industry: '',
        headquarters: '',
        businessModel: '',
        keyProducts: []
      },
      financial: {
        revenue: [],
        ebitda: [],
        netIncome: [],
        cashFlow: [],
        debt: [],
        workingCapital: []
      },
      market: {
        tam: 0,
        sam: 0,
        som: 0,
        marketGrowthRate: 0,
        competitivePosition: '',
        marketShare: 0
      },
      operational: {
        facilities: [],
        keyCustomers: [],
        suppliers: [],
        technology: [],
        processes: []
      },
      legal: {
        corporateStructure: '',
        jurisdiction: '',
        materialContracts: [],
        litigation: [],
        intellectualProperty: []
      }
    };
  }

  private static estimateTokenUsage(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  private static calculateConfidence(content: ExtractedContent, metrics: KeyMetric[]): number {
    // Implementation would calculate confidence based on extraction completeness
    return 85;
  }

  private static identifyQualityFlags(content: ExtractedContent): string[] {
    // Implementation would identify data quality issues
    return [];
  }
}

export default PreprocessingPrompts;