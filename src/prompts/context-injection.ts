/**
 * Context injection patterns for PrismForge AI
 * Integrates domain knowledge, benchmarks, and historical data into prompts
 */

import { 
  AgentType, 
  DocumentType, 
  IndustryType, 
  Finding,
  Evidence,
  EvidenceType 
} from '../types/core';

export interface KnowledgeContext {
  industryBenchmarks: IndustryBenchmark[];
  marketData: MarketDataPoint[];
  regulatoryGuidelines: RegulatoryContext[];
  historicalPrecedents: HistoricalPrecedent[];
  expertInsights: ExpertInsight[];
  riskDatabases: RiskDatabase[];
}

export interface IndustryBenchmark {
  industry: IndustryType;
  metric: string;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  unit: string;
  source: string;
  lastUpdated: Date;
  sampleSize: number;
}

export interface MarketDataPoint {
  metric: string;
  value: number;
  unit: string;
  timeFrame: string;
  source: string;
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  applicableIndustries: IndustryType[];
  lastUpdated: Date;
}

export interface RegulatoryContext {
  jurisdiction: string;
  regulationType: string;
  requirements: string[];
  penalties: string[];
  complianceThreshold: number;
  applicableIndustries: IndustryType[];
  effectiveDate: Date;
  source: string;
}

export interface HistoricalPrecedent {
  id: string;
  dealType: string;
  industry: IndustryType;
  dealValue: number;
  outcome: 'SUCCESS' | 'PARTIAL' | 'FAILURE';
  keyFactors: string[];
  lessonsLearned: string[];
  applicableScenarios: string[];
  source: string;
  dealDate: Date;
}

export interface ExpertInsight {
  expertId: string;
  credentials: string;
  industry: IndustryType;
  insight: string;
  context: string;
  confidence: number;
  publicationDate: Date;
  source: string;
}

export interface RiskDatabase {
  riskCategory: string;
  industry: IndustryType;
  commonRisks: RiskPattern[];
  mitigationStrategies: MitigationPattern[];
  historicalFrequency: number;
  averageImpact: number;
  lastUpdated: Date;
}

export interface RiskPattern {
  description: string;
  triggers: string[];
  earlyWarningSignals: string[];
  typicalImpact: string;
  frequency: number;
}

export interface MitigationPattern {
  strategy: string;
  effectiveness: number;
  cost: 'LOW' | 'MEDIUM' | 'HIGH';
  timeToImplement: string;
  applicableRisks: string[];
}

/**
 * Context injection strategies for different agent types
 */
export class ContextInjector {
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
  }

  /**
   * Inject relevant context for specific agent analysis
   */
  injectContext(
    agentType: AgentType,
    documentType: DocumentType,
    industry: IndustryType,
    dealValue?: number,
    context?: any
  ): string {
    switch (agentType) {
      case 'CHALLENGE':
        return this.buildChallengeContext(documentType, industry, dealValue, context);
      case 'EVIDENCE':
        return this.buildEvidenceContext(documentType, industry, dealValue, context);
      case 'RISK':
        return this.buildRiskContext(documentType, industry, dealValue, context);
      case 'JUDGE':
        return this.buildJudgeContext(documentType, industry, dealValue, context);
      default:
        return '';
    }
  }

  /**
   * Build context for Challenge Agent
   */
  private buildChallengeContext(
    documentType: DocumentType,
    industry: IndustryType,
    dealValue?: number,
    context?: any
  ): string {
    const benchmarks = this.getIndustryBenchmarks(industry);
    const precedents = this.getFailedDealPrecedents(industry, documentType);
    const commonPitfalls = this.getCommonDealPitfalls(documentType, industry);

    return `
    CHALLENGE AGENT KNOWLEDGE CONTEXT:

    INDUSTRY BENCHMARKS (${industry}):
    ${this.formatBenchmarks(benchmarks)}

    FAILED DEAL PRECEDENTS:
    ${this.formatFailedPrecedents(precedents)}

    COMMON DEAL PITFALLS FOR ${documentType}:
    ${commonPitfalls.map(pitfall => `- ${pitfall.description}: ${pitfall.frequency}% occurrence rate`).join('\n')}

    RED FLAGS TO WATCH FOR:
    ${this.getRedFlags(industry, documentType).map(flag => `- ${flag}`).join('\n')}

    AGGRESSIVE QUESTIONING FRAMEWORKS:
    1. Revenue Quality Framework: Challenge recurring revenue assumptions, customer stickiness, and pricing power
    2. Market Position Framework: Question competitive advantages, market share sustainability, and barrier heights
    3. Management Execution Framework: Challenge track record, execution capability, and strategic vision
    4. Financial Health Framework: Question cash generation, capital efficiency, and working capital trends

    BENCHMARK-BASED CHALLENGES:
    - If growth rates exceed 75th percentile benchmarks, demand extraordinary evidence
    - If margins exceed 90th percentile, challenge sustainability and competitive response
    - If valuation multiples exceed market norms, require compelling differentiation story
    `;
  }

  /**
   * Build context for Evidence Agent
   */
  private buildEvidenceContext(
    documentType: DocumentType,
    industry: IndustryType,
    dealValue?: number,
    context?: any
  ): string {
    const benchmarks = this.getIndustryBenchmarks(industry);
    const dataSources = this.getReliableDataSources(industry);
    const validationCriteria = this.getValidationCriteria(documentType);

    return `
    EVIDENCE AGENT KNOWLEDGE CONTEXT:

    INDUSTRY BENCHMARKS FOR VALIDATION (${industry}):
    ${this.formatBenchmarks(benchmarks)}

    RELIABLE DATA SOURCES:
    ${dataSources.map(source => `- ${source.name}: ${source.reliability} reliability, ${source.coverage}`).join('\n')}

    VALIDATION HIERARCHY:
    1. PRIMARY SOURCES (Highest Reliability):
       - Audited financial statements
       - SEC filings and regulatory reports
       - Independent third-party research
       - Customer contracts and agreements

    2. SECONDARY SOURCES (Medium Reliability):
       - Management presentations and reports
       - Industry association data
       - Trade publications and analysis
       - Market research reports

    3. TERTIARY SOURCES (Require Corroboration):
       - Company-provided marketing materials
       - Press releases and media coverage
       - Social media and informal channels
       - Anecdotal evidence and testimonials

    VALIDATION CRITERIA FOR ${documentType}:
    ${validationCriteria.map(criteria => `- ${criteria.requirement}: ${criteria.threshold}`).join('\n')}

    CROSS-REFERENCE REQUIREMENTS:
    - Financial data must be validated against at least 2 independent sources
    - Market claims require third-party research corroboration
    - Management assertions need track record verification
    - Growth projections must align with historical patterns and industry trends

    EVIDENCE STRENGTH SCORING:
    - VERY_STRONG: 3+ independent, reliable sources with consistent findings
    - STRONG: 2 independent, reliable sources with consistent findings  
    - MODERATE: 1 reliable source or 2+ sources with minor inconsistencies
    - WEAK: Single source or significant inconsistencies across sources
    `;
  }

  /**
   * Build context for Risk Agent
   */
  private buildRiskContext(
    documentType: DocumentType,
    industry: IndustryType,
    dealValue?: number,
    context?: any
  ): string {
    const riskDatabase = this.getRiskDatabase(industry);
    const regulatoryRisks = this.getRegulatoryRisks(industry);
    const marketRisks = this.getMarketRisks(industry);

    return `
    RISK AGENT KNOWLEDGE CONTEXT:

    INDUSTRY-SPECIFIC RISK DATABASE (${industry}):
    ${this.formatRiskDatabase(riskDatabase)}

    REGULATORY RISK LANDSCAPE:
    ${regulatoryRisks.map(risk => `- ${risk.type}: ${risk.probability}% likelihood, ${risk.impact} impact`).join('\n')}

    MARKET RISK FACTORS:
    ${marketRisks.map(risk => `- ${risk.factor}: ${risk.cyclicality}, ${risk.volatility} volatility`).join('\n')}

    RISK ASSESSMENT FRAMEWORK:
    1. FINANCIAL RISKS:
       - Cash flow volatility and predictability
       - Debt capacity and covenant compliance
       - Working capital requirements and seasonality
       - Foreign exchange and interest rate exposure

    2. OPERATIONAL RISKS:
       - Key person dependencies and succession planning
       - Supply chain vulnerabilities and concentration
       - Technology dependencies and obsolescence
       - Quality control and operational scalability

    3. MARKET RISKS:
       - Customer concentration and retention
       - Competitive positioning and differentiation
       - Market cyclicality and secular trends
       - Pricing power and margin sustainability

    4. STRATEGIC RISKS:
       - Integration complexity and execution
       - Cultural alignment and change management
       - Synergy realization and value capture
       - Strategic option value and flexibility

    RISK QUANTIFICATION METHODOLOGIES:
    - Monte Carlo simulation for financial risks
    - Scenario analysis for market risks
    - Decision tree analysis for strategic risks
    - Historical frequency analysis for operational risks

    EARLY WARNING INDICATORS:
    ${this.getEarlyWarningIndicators(industry).map(indicator => `- ${indicator.metric}: ${indicator.threshold}`).join('\n')}
    `;
  }

  /**
   * Build context for Judge Agent
   */
  private buildJudgeContext(
    documentType: DocumentType,
    industry: IndustryType,
    dealValue?: number,
    context?: any
  ): string {
    const successfulDeals = this.getSuccessfulDealPrecedents(industry, dealValue);
    const valuationBenchmarks = this.getValuationBenchmarks(industry);
    const decisionFrameworks = this.getDecisionFrameworks(documentType);

    return `
    JUDGE AGENT KNOWLEDGE CONTEXT:

    SUCCESSFUL DEAL PRECEDENTS (${industry}):
    ${this.formatSuccessfulPrecedents(successfulDeals)}

    VALUATION BENCHMARKS:
    ${this.formatValuationBenchmarks(valuationBenchmarks)}

    DECISION FRAMEWORKS FOR ${documentType}:
    ${decisionFrameworks.map(framework => `- ${framework.name}: ${framework.description}`).join('\n')}

    SYNTHESIS METHODOLOGY:
    1. WEIGHT AGENT FINDINGS:
       - Evidence Agent: 35% weight (fact verification)
       - Risk Agent: 30% weight (downside protection)
       - Challenge Agent: 25% weight (assumption testing)
       - Judge Agent: 10% weight (synthesis and experience)

    2. CONFLICT RESOLUTION HIERARCHY:
       - Strong evidence trumps speculation
       - Quantified risks outweigh general concerns
       - Historical precedents inform current decisions
       - Conservative assumptions in case of uncertainty

    3. DECISION CRITERIA:
       - Risk-adjusted returns vs alternatives
       - Strategic fit and synergy potential
       - Management capability and execution risk
       - Market position and competitive dynamics
       - Financial health and cash generation

    INVESTMENT DECISION MATRIX:
    - STRONG_BUY: >20% IRR, low execution risk, strong strategic fit
    - BUY: 15-20% IRR, moderate risk, good strategic alignment
    - HOLD: 10-15% IRR, acceptable risk profile, limited synergies
    - PASS: <10% IRR, high risk, poor strategic fit
    - STRONG_PASS: Negative returns, critical risks, strategic misalignment

    CONSENSUS REQUIREMENTS:
    - 80%+ agreement required for STRONG_BUY/STRONG_PASS recommendations
    - 70%+ agreement required for BUY/PASS recommendations
    - <70% agreement triggers second round analysis with refined prompts
    `;
  }

  // Mock data generators for demonstration purposes
  private initializeKnowledgeBase(): void {
    // Initialize with sample data - in production, this would load from actual databases
    this.knowledgeBase.set('benchmarks', this.generateSampleBenchmarks());
    this.knowledgeBase.set('precedents', this.generateSamplePrecedents());
    this.knowledgeBase.set('risks', this.generateSampleRisks());
  }

  private getIndustryBenchmarks(industry: IndustryType): IndustryBenchmark[] {
    // Mock implementation - returns sample benchmarks
    const baseBenchmarks: IndustryBenchmark[] = [
      {
        industry,
        metric: 'Revenue Growth Rate (%)',
        percentile25: 5,
        percentile50: 15,
        percentile75: 25,
        percentile90: 40,
        unit: 'percentage',
        source: 'Industry Database',
        lastUpdated: new Date(),
        sampleSize: 100
      },
      {
        industry,
        metric: 'EBITDA Margin (%)',
        percentile25: 10,
        percentile50: 18,
        percentile75: 28,
        percentile90: 35,
        unit: 'percentage',
        source: 'Industry Database',
        lastUpdated: new Date(),
        sampleSize: 100
      }
    ];

    // Add industry-specific benchmarks
    switch (industry) {
      case 'SAAS':
        baseBenchmarks.push({
          industry,
          metric: 'Net Revenue Retention (%)',
          percentile25: 100,
          percentile50: 110,
          percentile75: 120,
          percentile90: 130,
          unit: 'percentage',
          source: 'SaaS Benchmarks DB',
          lastUpdated: new Date(),
          sampleSize: 50
        });
        break;
      case 'MANUFACTURING':
        baseBenchmarks.push({
          industry,
          metric: 'Capacity Utilization (%)',
          percentile25: 70,
          percentile50: 80,
          percentile75: 90,
          percentile90: 95,
          unit: 'percentage',
          source: 'Manufacturing Index',
          lastUpdated: new Date(),
          sampleSize: 75
        });
        break;
    }

    return baseBenchmarks;
  }

  private getFailedDealPrecedents(industry: IndustryType, documentType: DocumentType): HistoricalPrecedent[] {
    return [
      {
        id: 'failed-001',
        dealType: 'Strategic Acquisition',
        industry,
        dealValue: 500000000,
        outcome: 'FAILURE',
        keyFactors: ['Overestimated synergies', 'Cultural mismatch', 'Integration complexity'],
        lessonsLearned: ['Validate synergy assumptions with bottom-up analysis', 'Assess cultural fit early'],
        applicableScenarios: ['Large acquisitions', 'Cross-cultural deals'],
        source: 'Deal Database',
        dealDate: new Date('2022-01-01')
      }
    ];
  }

  private getCommonDealPitfalls(documentType: DocumentType, industry: IndustryType): any[] {
    const basePitfalls = [
      { description: 'Overoptimistic revenue projections', frequency: 65 },
      { description: 'Underestimated integration costs', frequency: 55 },
      { description: 'Unrealistic synergy assumptions', frequency: 70 }
    ];

    // Add document-specific pitfalls
    if (documentType === 'CIM') {
      basePitfalls.push(
        { description: 'Cherry-picked financial metrics', frequency: 45 },
        { description: 'Overstated market opportunity', frequency: 50 }
      );
    }

    return basePitfalls;
  }

  private getRedFlags(industry: IndustryType, documentType: DocumentType): string[] {
    const baseFlags = [
      'Customer concentration >30%',
      'Declining gross margins',
      'High management turnover',
      'Regulatory investigations'
    ];

    // Add industry-specific red flags
    switch (industry) {
      case 'SAAS':
        baseFlags.push('Increasing churn rate', 'Declining NPS scores', 'High CAC:LTV ratio');
        break;
      case 'MANUFACTURING':
        baseFlags.push('Environmental violations', 'Aging equipment', 'Supply chain single points of failure');
        break;
    }

    return baseFlags;
  }

  // Additional helper methods for formatting and data generation
  private formatBenchmarks(benchmarks: IndustryBenchmark[]): string {
    return benchmarks.map(b => 
      `- ${b.metric}: P25=${b.percentile25}${b.unit === 'percentage' ? '%' : ''}, P50=${b.percentile50}${b.unit === 'percentage' ? '%' : ''}, P75=${b.percentile75}${b.unit === 'percentage' ? '%' : ''}, P90=${b.percentile90}${b.unit === 'percentage' ? '%' : ''}`
    ).join('\n');
  }

  private formatFailedPrecedents(precedents: HistoricalPrecedent[]): string {
    return precedents.map(p => 
      `- ${p.dealType} (${p.dealDate.getFullYear()}): ${p.keyFactors.join(', ')} → Lessons: ${p.lessonsLearned.join(', ')}`
    ).join('\n');
  }

  private formatSuccessfulPrecedents(precedents: HistoricalPrecedent[]): string {
    return precedents.map(p => 
      `- ${p.dealType} ($${(p.dealValue/1000000).toFixed(0)}M): Success factors - ${p.keyFactors.join(', ')}`
    ).join('\n');
  }

  private formatRiskDatabase(risks: any[]): string {
    return risks.map(r => 
      `- ${r.category}: ${r.frequency}% occurrence, ${r.impact} average impact`
    ).join('\n');
  }

  private formatValuationBenchmarks(benchmarks: any[]): string {
    return benchmarks.map(b => 
      `- ${b.metric}: ${b.median}x median (${b.range}x range)`
    ).join('\n');
  }

  // Sample data generators
  private generateSampleBenchmarks(): any[] {
    return []; // Implementation would load real benchmark data
  }

  private generateSamplePrecedents(): any[] {
    return []; // Implementation would load real precedent data
  }

  private generateSampleRisks(): any[] {
    return []; // Implementation would load real risk data
  }

  // Additional mock methods
  private getReliableDataSources(industry: IndustryType): any[] {
    return [
      { name: 'PitchBook', reliability: 'HIGH', coverage: 'Private equity data' },
      { name: 'CapitalIQ', reliability: 'HIGH', coverage: 'Public company financials' },
      { name: 'IBISWorld', reliability: 'MEDIUM', coverage: 'Industry research' }
    ];
  }

  private getValidationCriteria(documentType: DocumentType): any[] {
    return [
      { requirement: 'Financial data accuracy', threshold: '>95% consistency' },
      { requirement: 'Market size validation', threshold: '3+ independent sources' },
      { requirement: 'Management claims verification', threshold: 'Track record confirmation' }
    ];
  }

  private getRiskDatabase(industry: IndustryType): any[] {
    return [
      { category: 'Customer Concentration', frequency: 35, impact: 'HIGH' },
      { category: 'Technology Disruption', frequency: 25, impact: 'MEDIUM' },
      { category: 'Regulatory Changes', frequency: 20, impact: 'HIGH' }
    ];
  }

  private getRegulatoryRisks(industry: IndustryType): any[] {
    return [
      { type: 'Data Privacy Compliance', probability: 30, impact: 'MEDIUM' },
      { type: 'Industry Regulation Changes', probability: 15, impact: 'HIGH' }
    ];
  }

  private getMarketRisks(industry: IndustryType): any[] {
    return [
      { factor: 'Economic Downturn', cyclicality: 'HIGH', volatility: 'HIGH' },
      { factor: 'Competitive Pressure', cyclicality: 'MEDIUM', volatility: 'MEDIUM' }
    ];
  }

  private getEarlyWarningIndicators(industry: IndustryType): any[] {
    return [
      { metric: 'Customer Churn Rate', threshold: '>5% monthly' },
      { metric: 'Gross Margin Decline', threshold: '>200bps YoY' },
      { metric: 'Cash Burn Rate', threshold: '>12 months runway' }
    ];
  }

  private getSuccessfulDealPrecedents(industry: IndustryType, dealValue?: number): HistoricalPrecedent[] {
    return [
      {
        id: 'success-001',
        dealType: 'Strategic Acquisition',
        industry,
        dealValue: dealValue || 300000000,
        outcome: 'SUCCESS',
        keyFactors: ['Strong management retention', 'Validated synergies', 'Cultural alignment'],
        lessonsLearned: ['Early integration planning crucial', 'Communication transparency key'],
        applicableScenarios: ['Similar industry deals', 'Management-led transactions'],
        source: 'Success Database',
        dealDate: new Date('2021-06-01')
      }
    ];
  }

  private getValuationBenchmarks(industry: IndustryType): any[] {
    return [
      { metric: 'EV/Revenue', median: 3.5, range: '2.0-6.0' },
      { metric: 'EV/EBITDA', median: 12.0, range: '8.0-18.0' },
      { metric: 'P/E Ratio', median: 18.0, range: '12.0-25.0' }
    ];
  }

  private getDecisionFrameworks(documentType: DocumentType): any[] {
    return [
      { name: 'Risk-Adjusted NPV', description: 'DCF with probability-weighted scenarios' },
      { name: 'Strategic Option Value', description: 'Real options valuation for growth opportunities' },
      { name: 'Competitive Position Analysis', description: 'Porter Five Forces assessment' }
    ];
  }
}

/**
 * Context injection utility functions
 */
export class ContextUtils {
  /**
   * Extract relevant context based on document content
   */
  static extractDocumentContext(content: string, documentType: DocumentType): any {
    // Implementation would use NLP to extract key context from document
    return {
      keyMetrics: [],
      businessModel: '',
      marketPosition: '',
      financialHighlights: []
    };
  }

  /**
   * Build semantic similarity context
   */
  static buildSimilarityContext(documentVector: number[], threshold: number = 0.8): any {
    // Implementation would find similar documents and extract relevant insights
    return {
      similarDocuments: [],
      commonPatterns: [],
      comparativeInsights: []
    };
  }

  /**
   * Inject real-time market context
   */
  static injectMarketContext(industry: IndustryType): any {
    // Implementation would pull current market conditions and trends
    return {
      marketConditions: 'NEUTRAL',
      recentTrends: [],
      competitiveDynamics: [],
      regulatoryChanges: []
    };
  }
}

export default ContextInjector;