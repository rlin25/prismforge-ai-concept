/**
 * Dynamic prompt construction for PrismForge AI
 * Generates document-type specific prompts and context-aware instructions
 */

import { 
  AgentType, 
  DocumentType, 
  IndustryType, 
  DealStage, 
  DocumentMetadata,
  AnalysisConfiguration 
} from '../types/core';
import { SystemPrompt, SystemPromptManager } from './system-prompts';

export interface DynamicPromptContext {
  documentType: DocumentType;
  industry?: IndustryType;
  dealStage?: DealStage;
  dealValue?: number;
  metadata: DocumentMetadata;
  analysisConfig: AnalysisConfiguration;
  previousFindings?: string[];
  isSecondRound?: boolean;
}

export interface DocumentTypePromptConfig {
  focusAreas: string[];
  keyMetrics: string[];
  specificInstructions: string;
  riskFactors: string[];
  validationCriteria: string[];
}

/**
 * Document-type specific prompt configurations
 */
export const DOCUMENT_TYPE_CONFIGS: Record<DocumentType, DocumentTypePromptConfig> = {
  CIM: {
    focusAreas: [
      'Business model and revenue streams',
      'Market position and competitive advantages', 
      'Financial performance and projections',
      'Management team and organizational structure',
      'Growth strategy and market opportunities'
    ],
    keyMetrics: [
      'Revenue growth rates',
      'EBITDA margins',
      'Customer acquisition cost',
      'Customer lifetime value',
      'Market share and TAM'
    ],
    specificInstructions: `
      CIM ANALYSIS FOCUS:
      - Evaluate the investment thesis and strategic rationale
      - Assess market positioning claims and competitive differentiation
      - Validate growth projections and underlying assumptions
      - Analyze management team experience and track record
      - Review customer base quality and concentration risks
      - Examine operational scalability and margin sustainability
    `,
    riskFactors: [
      'Revenue concentration risks',
      'Management team dependencies', 
      'Market saturation concerns',
      'Competitive threats',
      'Regulatory compliance'
    ],
    validationCriteria: [
      'Independent market research verification',
      'Financial statement consistency',
      'Management claims substantiation',
      'Customer reference validation',
      'Competitive analysis accuracy'
    ]
  },

  FINANCIAL_MODEL: {
    focusAreas: [
      'Revenue forecasting methodology',
      'Cost structure and expense projections',
      'Cash flow analysis and working capital',
      'Sensitivity analysis and scenario planning',
      'Valuation methodology and assumptions'
    ],
    keyMetrics: [
      'Revenue CAGR assumptions',
      'Margin expansion projections',
      'Capex and depreciation',
      'Working capital requirements',
      'Terminal value assumptions'
    ],
    specificInstructions: `
      FINANCIAL MODEL ANALYSIS FOCUS:
      - Validate formula accuracy and calculation logic
      - Assess reasonableness of growth assumptions
      - Review sensitivity analysis comprehensiveness
      - Evaluate scenario planning and stress testing
      - Analyze cash flow timing and working capital impacts
      - Verify valuation multiples and benchmarking
    `,
    riskFactors: [
      'Aggressive growth assumptions',
      'Margin expansion optimism',
      'Working capital volatility',
      'Capital intensity requirements',
      'Valuation multiple risks'
    ],
    validationCriteria: [
      'Historical trend analysis',
      'Industry benchmark comparison',
      'Formula and logic verification',
      'Scenario analysis robustness',
      'Market multiple validation'
    ]
  },

  LOI: {
    focusAreas: [
      'Valuation and pricing structure',
      'Deal terms and conditions',
      'Due diligence requirements',
      'Closing conditions and timeline',
      'Post-closing governance and integration'
    ],
    keyMetrics: [
      'Purchase price multiples',
      'Earnout provisions',
      'Working capital adjustments',
      'Indemnification limits',
      'Escrow arrangements'
    ],
    specificInstructions: `
      LOI ANALYSIS FOCUS:
      - Evaluate valuation reasonableness vs market comps
      - Assess deal structure and risk allocation
      - Review due diligence scope and timeline
      - Analyze closing conditions and execution risk
      - Examine post-closing governance provisions
      - Validate earnout structures and performance metrics
    `,
    riskFactors: [
      'Valuation stretch vs comps',
      'Aggressive earnout targets',
      'Limited due diligence scope',
      'Tight closing timeline',
      'Insufficient buyer protections'
    ],
    validationCriteria: [
      'Market multiple benchmarking',
      'Earnout achievability analysis',
      'Due diligence adequacy assessment',
      'Closing condition feasibility',
      'Legal term market standards'
    ]
  },

  SPA: {
    focusAreas: [
      'Purchase price and adjustment mechanisms',
      'Representations and warranties scope',
      'Indemnification and escrow provisions',
      'Closing conditions and termination rights',
      'Post-closing covenants and restrictions'
    ],
    keyMetrics: [
      'Working capital baseline',
      'Indemnification caps and baskets',
      'Escrow amount and duration',
      'Earnout payment terms',
      'Termination fee provisions'
    ],
    specificInstructions: `
      SPA ANALYSIS FOCUS:
      - Validate purchase price calculation methodology
      - Assess comprehensiveness of reps and warranties
      - Evaluate indemnification terms vs market standards
      - Review closing condition achievability
      - Analyze termination rights and remedies
      - Examine post-closing covenant reasonableness
    `,
    riskFactors: [
      'Inadequate buyer protections',
      'Aggressive working capital targets',
      'Limited indemnification coverage',
      'Challenging closing conditions',
      'Restrictive post-closing covenants'
    ],
    validationCriteria: [
      'Market standard term comparison',
      'Working capital normalization analysis',
      'Indemnification adequacy assessment',
      'Closing condition feasibility review',
      'Legal enforceability validation'
    ]
  },

  DD_REPORT: {
    focusAreas: [
      'Due diligence findings summary',
      'Risk assessment and mitigation',
      'Valuation impact analysis',
      'Integration planning considerations',
      'Post-closing action items'
    ],
    keyMetrics: [
      'Risk quantification estimates',
      'Valuation adjustment recommendations',
      'Integration cost projections',
      'Timeline to value realization',
      'Success probability assessments'
    ],
    specificInstructions: `
      DD REPORT ANALYSIS FOCUS:
      - Evaluate completeness of due diligence scope
      - Assess risk identification and quantification
      - Review management response adequacy
      - Analyze integration planning thoroughness
      - Validate actionability of recommendations
      - Examine follow-up item prioritization
    `,
    riskFactors: [
      'Incomplete due diligence scope',
      'Unquantified risk exposures',
      'Inadequate management responses',
      'Complex integration requirements',
      'Unclear action item ownership'
    ],
    validationCriteria: [
      'Due diligence scope benchmarking',
      'Risk quantification methodology',
      'Management response quality',
      'Integration plan feasibility',
      'Recommendation prioritization logic'
    ]
  },

  VALUATION: {
    focusAreas: [
      'Valuation methodology selection',
      'Comparable company analysis',
      'Discounted cash flow assumptions',
      'Precedent transaction analysis',
      'Valuation reconciliation and weighting'
    ],
    keyMetrics: [
      'EV/Revenue multiples',
      'EV/EBITDA multiples', 
      'P/E ratios',
      'DCF discount rates',
      'Terminal value assumptions'
    ],
    specificInstructions: `
      VALUATION ANALYSIS FOCUS:
      - Evaluate appropriateness of valuation methods
      - Assess comparable company selection criteria
      - Validate DCF assumptions and sensitivities
      - Review precedent transaction relevance
      - Analyze valuation range reasonableness
      - Examine methodology weighting rationale
    `,
    riskFactors: [
      'Inappropriate comparable selection',
      'Aggressive DCF assumptions',
      'Limited transaction precedents',
      'Narrow valuation range',
      'Methodology selection bias'
    ],
    validationCriteria: [
      'Comparable company relevance',
      'DCF assumption benchmarking',
      'Transaction precedent quality',
      'Valuation range market context',
      'Methodology appropriateness'
    ]
  },

  PITCH_DECK: {
    focusAreas: [
      'Investment thesis clarity',
      'Market opportunity sizing',
      'Competitive positioning claims',
      'Financial highlights and projections',
      'Strategic rationale and synergies'
    ],
    keyMetrics: [
      'TAM/SAM/SOM estimates',
      'Market growth rates',
      'Competitive market share',
      'Financial performance highlights',
      'Synergy value estimates'
    ],
    specificInstructions: `
      PITCH DECK ANALYSIS FOCUS:
      - Evaluate investment thesis coherence
      - Assess market opportunity validation
      - Challenge competitive positioning claims
      - Verify financial highlight accuracy
      - Analyze synergy case feasibility
      - Review strategic rationale strength
    `,
    riskFactors: [
      'Overstated market opportunity',
      'Weak competitive differentiation',
      'Cherry-picked financial metrics',
      'Unrealistic synergy expectations',
      'Unclear value creation thesis'
    ],
    validationCriteria: [
      'Market research independence',
      'Competitive analysis objectivity',
      'Financial metric context',
      'Synergy case precedents',
      'Strategic logic validation'
    ]
  },

  MANAGEMENT_PRESENTATION: {
    focusAreas: [
      'Management team credibility',
      'Business strategy articulation',
      'Operational performance claims',
      'Growth initiative feasibility',
      'Financial guidance reliability'
    ],
    keyMetrics: [
      'Management track record',
      'Historical guidance accuracy',
      'Operational KPI trends',
      'Growth investment ROI',
      'Strategic milestone achievement'
    ],
    specificInstructions: `
      MANAGEMENT PRESENTATION ANALYSIS FOCUS:
      - Assess management team credibility and track record
      - Evaluate business strategy clarity and execution capability
      - Validate operational performance claims
      - Analyze growth initiative resource requirements
      - Review historical guidance accuracy and reliability
      - Examine strategic vision feasibility
    `,
    riskFactors: [
      'Limited management track record',
      'Unclear strategy execution',
      'Inconsistent operational metrics',
      'Resource-intensive growth plans',
      'Poor historical guidance accuracy'
    ],
    validationCriteria: [
      'Management background verification',
      'Strategy execution benchmarking',
      'Operational metric validation',
      'Growth plan resource analysis',
      'Guidance accuracy assessment'
    ]
  }
};

/**
 * Industry-specific prompt modifiers
 */
export const INDUSTRY_MODIFIERS: Record<IndustryType, Partial<DocumentTypePromptConfig>> = {
  SAAS: {
    keyMetrics: ['MRR/ARR', 'Churn rate', 'CAC/LTV ratio', 'Net revenue retention', 'Gross margin'],
    riskFactors: ['Customer concentration', 'Competitive threats', 'Technology obsolescence', 'Subscription model sustainability']
  },
  MANUFACTURING: {
    keyMetrics: ['Capacity utilization', 'Inventory turns', 'Gross margin', 'Capex intensity', 'Working capital cycle'],
    riskFactors: ['Supply chain disruption', 'Raw material cost volatility', 'Regulatory compliance', 'Environmental liabilities']
  },
  HEALTHCARE: {
    keyMetrics: ['Patient outcomes', 'Reimbursement rates', 'Regulatory compliance', 'R&D efficiency', 'Market access'],
    riskFactors: ['Regulatory changes', 'Reimbursement pressure', 'Clinical trial risks', 'FDA approval dependencies']
  },
  FINTECH: {
    keyMetrics: ['Transaction volume', 'Take rate', 'Regulatory capital', 'Fraud rates', 'User acquisition'],
    riskFactors: ['Regulatory scrutiny', 'Cybersecurity threats', 'Market volatility', 'Competitive disruption']
  },
  RETAIL: {
    keyMetrics: ['Same-store sales', 'Inventory turnover', 'Customer acquisition', 'Margin trends', 'Store productivity'],
    riskFactors: ['Consumer demand shifts', 'E-commerce competition', 'Real estate exposure', 'Supply chain disruption']
  },
  ENERGY: {
    keyMetrics: ['Production volumes', 'Reserve life', 'Finding costs', 'Netback margins', 'Regulatory compliance'],
    riskFactors: ['Commodity price volatility', 'Environmental regulations', 'Stranded assets', 'ESG concerns']
  },
  REAL_ESTATE: {
    keyMetrics: ['Occupancy rates', 'Rent growth', 'NOI margins', 'Cap rates', 'Development pipeline'],
    riskFactors: ['Interest rate sensitivity', 'Market cycle timing', 'Regulatory changes', 'Construction risks']
  },
  TECHNOLOGY: {
    keyMetrics: ['R&D intensity', 'Innovation pipeline', 'IP portfolio', 'Market share', 'Time to market'],
    riskFactors: ['Technology disruption', 'Talent retention', 'IP infringement', 'Rapid obsolescence']
  },
  OTHER: {
    keyMetrics: ['Industry-specific KPIs', 'Market position', 'Operational efficiency', 'Growth drivers'],
    riskFactors: ['Industry-specific risks', 'Competitive dynamics', 'Regulatory environment', 'Market cyclicality']
  }
};

/**
 * Dynamic prompt builder class
 */
export class DynamicPromptBuilder {
  private promptManager: SystemPromptManager;

  constructor() {
    this.promptManager = SystemPromptManager.getInstance();
  }

  /**
   * Build document-type specific prompt
   */
  buildDocumentPrompt(
    agentType: AgentType,
    context: DynamicPromptContext
  ): SystemPrompt {
    const basePrompt = this.promptManager.getSystemPrompt(agentType);
    const documentConfig = DOCUMENT_TYPE_CONFIGS[context.documentType];
    const industryModifier = context.industry ? INDUSTRY_MODIFIERS[context.industry] : {};

    // Merge configurations
    const mergedConfig = this.mergeConfigurations(documentConfig, industryModifier);

    // Build enhanced instructions
    const enhancedInstructions = this.buildEnhancedInstructions(
      basePrompt.instructions,
      mergedConfig,
      context
    );

    // Build context-aware constraints
    const enhancedConstraints = this.buildEnhancedConstraints(
      basePrompt.constraints,
      context
    );

    return {
      ...basePrompt,
      instructions: enhancedInstructions,
      constraints: enhancedConstraints,
      context: this.buildEnhancedContext(basePrompt.context, context)
    };
  }

  /**
   * Build second-round prompt with refinements
   */
  buildSecondRoundPrompt(
    agentType: AgentType,
    context: DynamicPromptContext,
    previousFindings: string[],
    conflicts: string[]
  ): SystemPrompt {
    const basePrompt = this.buildDocumentPrompt(agentType, context);

    const secondRoundInstructions = `
    ${basePrompt.instructions}

    SECOND ROUND ANALYSIS - CONFLICT RESOLUTION:
    You are conducting a second round of analysis to resolve conflicts and refine findings.

    PREVIOUS FINDINGS TO CONSIDER:
    ${previousFindings.map(finding => `- ${finding}`).join('\n')}

    CONFLICTS TO RESOLVE:
    ${conflicts.map(conflict => `- ${conflict}`).join('\n')}

    SECOND ROUND OBJECTIVES:
    1. Address specific conflicts identified in the first round
    2. Provide additional evidence to support or refute previous findings
    3. Refine analysis with more nuanced perspectives
    4. Focus on areas where agents disagreed
    5. Provide more definitive conclusions where possible

    ADDITIONAL INSTRUCTIONS:
    - Directly address each conflict with specific evidence
    - Explain why your second round analysis differs (if it does) from the first round
    - Provide more granular analysis of disputed areas
    - Increase confidence levels where additional analysis supports conclusions
    - Flag areas where uncertainty remains despite additional analysis
    `;

    return {
      ...basePrompt,
      instructions: secondRoundInstructions
    };
  }

  /**
   * Build agent-specific prompt variations based on document characteristics
   */
  buildAgentVariation(
    agentType: AgentType,
    context: DynamicPromptContext
  ): SystemPrompt {
    const basePrompt = this.buildDocumentPrompt(agentType, context);
    
    // Apply agent-specific variations based on document characteristics
    switch (agentType) {
      case 'CHALLENGE':
        return this.buildChallengeVariation(basePrompt, context);
      case 'EVIDENCE':
        return this.buildEvidenceVariation(basePrompt, context);
      case 'RISK':
        return this.buildRiskVariation(basePrompt, context);
      case 'JUDGE':
        return this.buildJudgeVariation(basePrompt, context);
      default:
        return basePrompt;
    }
  }

  // Private helper methods

  private mergeConfigurations(
    documentConfig: DocumentTypePromptConfig,
    industryModifier: Partial<DocumentTypePromptConfig>
  ): DocumentTypePromptConfig {
    return {
      focusAreas: documentConfig.focusAreas,
      keyMetrics: [...documentConfig.keyMetrics, ...(industryModifier.keyMetrics || [])],
      specificInstructions: documentConfig.specificInstructions,
      riskFactors: [...documentConfig.riskFactors, ...(industryModifier.riskFactors || [])],
      validationCriteria: documentConfig.validationCriteria
    };
  }

  private buildEnhancedInstructions(
    baseInstructions: string,
    config: DocumentTypePromptConfig,
    context: DynamicPromptContext
  ): string {
    return `
    ${baseInstructions}

    DOCUMENT-SPECIFIC FOCUS (${context.documentType}):
    ${config.specificInstructions}

    KEY FOCUS AREAS:
    ${config.focusAreas.map(area => `- ${area}`).join('\n')}

    CRITICAL METRICS TO ANALYZE:
    ${config.keyMetrics.map(metric => `- ${metric}`).join('\n')}

    ${context.industry ? `
    INDUSTRY-SPECIFIC CONSIDERATIONS (${context.industry}):
    ${INDUSTRY_MODIFIERS[context.industry]?.riskFactors?.map(risk => `- ${risk}`).join('\n') || ''}
    ` : ''}

    ${context.dealStage ? `
    DEAL STAGE CONTEXT (${context.dealStage}):
    Adjust analysis focus based on current deal stage requirements.
    ` : ''}

    ${context.dealValue ? `
    DEAL SIZE CONTEXT:
    Deal value: $${(context.dealValue / 1000000).toFixed(1)}M
    Apply appropriate level of scrutiny based on transaction size.
    ` : ''}
    `;
  }

  private buildEnhancedConstraints(
    baseConstraints: string[],
    context: DynamicPromptContext
  ): string[] {
    const documentConfig = DOCUMENT_TYPE_CONFIGS[context.documentType];
    
    return [
      ...baseConstraints,
      `Focus analysis on ${context.documentType}-specific validation criteria`,
      `Apply industry standards and benchmarks for ${context.industry || 'the relevant industry'}`,
      ...documentConfig.validationCriteria.map(criteria => `Ensure ${criteria}`)
    ];
  }

  private buildEnhancedContext(
    baseContext: string,
    context: DynamicPromptContext
  ): string {
    return `
    ${baseContext}

    CURRENT ANALYSIS CONTEXT:
    - Document Type: ${context.documentType}
    - Industry: ${context.industry || 'Not specified'}
    - Deal Stage: ${context.dealStage || 'Not specified'}
    - Deal Value: ${context.dealValue ? `$${(context.dealValue / 1000000).toFixed(1)}M` : 'Not specified'}
    - Analysis Round: ${context.isSecondRound ? 'Second Round (Conflict Resolution)' : 'Initial Analysis'}
    `;
  }

  private buildChallengeVariation(prompt: SystemPrompt, context: DynamicPromptContext): SystemPrompt {
    const aggressiveness = context.dealValue && context.dealValue > 100000000 ? 'highly aggressive' : 'moderately aggressive';
    
    return {
      ...prompt,
      instructions: `${prompt.instructions}\n\nCHALLENGE AGENT VARIATION:\nApply ${aggressiveness} challenging approach given deal characteristics.`
    };
  }

  private buildEvidenceVariation(prompt: SystemPrompt, context: DynamicPromptContext): SystemPrompt {
    const rigor = context.dealStage === 'DUE_DILIGENCE' ? 'maximum' : 'standard';
    
    return {
      ...prompt,
      instructions: `${prompt.instructions}\n\nEVIDENCE AGENT VARIATION:\nApply ${rigor} evidence validation rigor given current deal stage.`
    };
  }

  private buildRiskVariation(prompt: SystemPrompt, context: DynamicPromptContext): SystemPrompt {
    const riskConfig = DOCUMENT_TYPE_CONFIGS[context.documentType];
    
    return {
      ...prompt,
      instructions: `${prompt.instructions}\n\nRISK AGENT VARIATION:\nPrioritize risks specific to ${context.documentType} documents:\n${riskConfig.riskFactors.map(risk => `- ${risk}`).join('\n')}`
    };
  }

  private buildJudgeVariation(prompt: SystemPrompt, context: DynamicPromptContext): SystemPrompt {
    const decisionWeight = context.analysisConfig.consensusThreshold;
    
    return {
      ...prompt,
      instructions: `${prompt.instructions}\n\nJUDGE AGENT VARIATION:\nApply ${decisionWeight}% consensus threshold for final recommendations.`
    };
  }
}

export default DynamicPromptBuilder;