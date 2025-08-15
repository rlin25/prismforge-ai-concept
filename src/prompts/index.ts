/**
 * PrismForge AI Prompt Engineering System
 * Comprehensive prompt management and generation for M&A due diligence agents
 */

// Core prompt components
export { 
  SystemPromptManager,
  CHALLENGE_AGENT_PROMPT,
  EVIDENCE_AGENT_PROMPT,
  RISK_AGENT_PROMPT,
  JUDGE_AGENT_PROMPT,
  type SystemPrompt,
  type AgentPromptConfig,
  type PromptExample
} from './system-prompts';

export {
  DynamicPromptBuilder,
  DOCUMENT_TYPE_CONFIGS,
  INDUSTRY_MODIFIERS,
  type DynamicPromptContext,
  type DocumentTypePromptConfig
} from './dynamic-prompts';

export {
  ContextInjector,
  ContextUtils,
  type KnowledgeContext,
  type IndustryBenchmark,
  type MarketDataPoint,
  type HistoricalPrecedent,
  type ExpertInsight,
  type RiskDatabase
} from './context-injection';

export {
  PreprocessingPrompts,
  PreprocessingPipeline,
  type PreprocessingResult,
  type ExtractedContent,
  type DocumentSummary,
  type KeyMetric,
  type StructuredData
} from './preprocessing';

export {
  MarkdownFormatter,
  JSONFormatter,
  PDFFormatter,
  type FormattingOptions,
  type BrandingOptions,
  type MarkdownSection
} from './formatters';

// Additional types and interfaces
import { 
  AgentType, 
  DocumentType, 
  IndustryType, 
  Document, 
  ValidationResult,
  AnalysisConfiguration 
} from '../types/core';

/**
 * Master Prompt Engine - Central orchestrator for all prompt operations
 */
export class PromptEngine {
  private systemPromptManager: SystemPromptManager;
  private dynamicBuilder: DynamicPromptBuilder;
  private contextInjector: ContextInjector;

  constructor() {
    this.systemPromptManager = SystemPromptManager.getInstance();
    this.dynamicBuilder = new DynamicPromptBuilder();
    this.contextInjector = new ContextInjector();
  }

  /**
   * Generate complete prompt for agent analysis
   */
  async generateAgentPrompt(
    agentType: AgentType,
    document: Document,
    analysisConfig: AnalysisConfiguration,
    isSecondRound: boolean = false,
    previousFindings?: string[],
    conflicts?: string[]
  ): Promise<string> {
    // Build dynamic context
    const context: import('./dynamic-prompts').DynamicPromptContext = {
      documentType: document.type,
      industry: document.metadata.industry,
      dealStage: document.metadata.dealStage,
      dealValue: document.metadata.dealValue,
      metadata: document.metadata,
      analysisConfig,
      previousFindings,
      isSecondRound
    };

    // Get base prompt with document-specific adaptations
    const basePrompt = isSecondRound && previousFindings && conflicts ?
      this.dynamicBuilder.buildSecondRoundPrompt(agentType, context, previousFindings, conflicts) :
      this.dynamicBuilder.buildDocumentPrompt(agentType, context);

    // Inject domain knowledge and context
    const knowledgeContext = this.contextInjector.injectContext(
      agentType,
      document.type,
      document.metadata.industry || 'OTHER',
      document.metadata.dealValue,
      context
    );

    // Combine all components
    return this.assemblePrompt(basePrompt, knowledgeContext, document.content);
  }

  /**
   * Generate preprocessing prompt for document analysis
   */
  generatePreprocessingPrompt(document: Document): string {
    return PreprocessingPrompts.getDocumentExtractionPrompt(document.type);
  }

  /**
   * Generate metrics extraction prompt
   */
  generateMetricsPrompt(industry: IndustryType): string {
    return PreprocessingPrompts.getMetricsExtractionPrompt(industry);
  }

  /**
   * Generate data validation prompt
   */
  generateValidationPrompt(): string {
    return PreprocessingPrompts.getDataValidationPrompt();
  }

  /**
   * Generate risk identification prompt
   */
  generateRiskPrompt(documentType: DocumentType): string {
    return PreprocessingPrompts.getRiskIdentificationPrompt(documentType);
  }

  /**
   * Format analysis results into specified output format
   */
  formatResults(
    validationResult: ValidationResult,
    options: import('./formatters').FormattingOptions
  ): string {
    switch (options.outputFormat) {
      case 'MARKDOWN':
        return MarkdownFormatter.generateComprehensiveReport(validationResult, options);
      case 'JSON':
        return JSON.stringify(JSONFormatter.formatValidationResult(validationResult), null, 2);
      case 'HTML':
      case 'PDF':
        return PDFFormatter.generatePDFContent(validationResult, options);
      default:
        return MarkdownFormatter.generateComprehensiveReport(validationResult, options);
    }
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(validationResult: ValidationResult): string {
    return MarkdownFormatter.generateExecutiveSummary(validationResult);
  }

  /**
   * Validate prompt configuration
   */
  validatePromptConfiguration(
    agentType: AgentType,
    documentType: DocumentType,
    industry?: IndustryType
  ): boolean {
    try {
      // Check if system prompt exists
      const systemPrompt = this.systemPromptManager.getSystemPrompt(agentType);
      if (!this.systemPromptManager.validatePrompt(systemPrompt)) {
        return false;
      }

      // Check if document type configuration exists
      const docConfig = DOCUMENT_TYPE_CONFIGS[documentType];
      if (!docConfig) {
        return false;
      }

      // Check if industry modifier exists (if industry specified)
      if (industry && !INDUSTRY_MODIFIERS[industry]) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Prompt validation error: ${error}`);
      return false;
    }
  }

  /**
   * Get prompt statistics and metrics
   */
  getPromptMetrics(): {
    systemPrompts: number;
    documentTypes: number;
    industryModifiers: number;
    totalCombinations: number;
  } {
    return {
      systemPrompts: 4, // CHALLENGE, EVIDENCE, RISK, JUDGE
      documentTypes: Object.keys(DOCUMENT_TYPE_CONFIGS).length,
      industryModifiers: Object.keys(INDUSTRY_MODIFIERS).length,
      totalCombinations: 4 * Object.keys(DOCUMENT_TYPE_CONFIGS).length * Object.keys(INDUSTRY_MODIFIERS).length
    };
  }

  // Private helper methods

  private assemblePrompt(
    systemPrompt: import('./system-prompts').SystemPrompt,
    knowledgeContext: string,
    documentContent: string
  ): string {
    return `
${systemPrompt.role}

CONTEXT:
${systemPrompt.context}

${knowledgeContext}

INSTRUCTIONS:
${systemPrompt.instructions}

OUTPUT FORMAT:
${systemPrompt.outputFormat}

CONSTRAINTS:
${systemPrompt.constraints.map(constraint => `- ${constraint}`).join('\n')}

DOCUMENT TO ANALYZE:
${documentContent.slice(0, 10000)}${documentContent.length > 10000 ? '\n\n[Document truncated for prompt length...]' : ''}
`;
  }
}

/**
 * Prompt validation utilities
 */
export class PromptValidator {
  
  /**
   * Validate prompt token count for model limits
   */
  static validateTokenCount(prompt: string, maxTokens: number = 100000): boolean {
    // Rough estimation: 4 characters per token
    const estimatedTokens = Math.ceil(prompt.length / 4);
    return estimatedTokens <= maxTokens;
  }

  /**
   * Validate prompt structure and completeness
   */
  static validatePromptStructure(prompt: string): {
    isValid: boolean;
    missingComponents: string[];
    warnings: string[];
  } {
    const missingComponents: string[] = [];
    const warnings: string[] = [];

    // Check for essential components
    if (!prompt.includes('INSTRUCTIONS:')) {
      missingComponents.push('Instructions section');
    }
    
    if (!prompt.includes('OUTPUT FORMAT:')) {
      missingComponents.push('Output format specification');
    }
    
    if (!prompt.includes('CONSTRAINTS:')) {
      warnings.push('No constraints specified');
    }

    // Check for potential issues
    if (prompt.length < 500) {
      warnings.push('Prompt may be too short for comprehensive analysis');
    }
    
    if (prompt.length > 50000) {
      warnings.push('Prompt may be too long for optimal processing');
    }

    return {
      isValid: missingComponents.length === 0,
      missingComponents,
      warnings
    };
  }
}

/**
 * Prompt testing and optimization utilities
 */
export class PromptOptimizer {
  
  /**
   * Generate A/B test variations of prompts
   */
  static generatePromptVariations(
    basePrompt: import('./system-prompts').SystemPrompt,
    variationType: 'CONSERVATIVE' | 'AGGRESSIVE' | 'BALANCED'
  ): import('./system-prompts').SystemPrompt[] {
    const variations: import('./system-prompts').SystemPrompt[] = [];
    
    switch (variationType) {
      case 'CONSERVATIVE':
        variations.push({
          ...basePrompt,
          instructions: basePrompt.instructions + '\n\nApply conservative assumptions and err on the side of caution.',
          constraints: [...basePrompt.constraints, 'Use conservative estimates when data is ambiguous']
        });
        break;
        
      case 'AGGRESSIVE':
        variations.push({
          ...basePrompt,
          instructions: basePrompt.instructions + '\n\nApply thorough scrutiny and challenge all assumptions aggressively.',
          constraints: [...basePrompt.constraints, 'Question every claim and assumption']
        });
        break;
        
      case 'BALANCED':
        variations.push({
          ...basePrompt,
          instructions: basePrompt.instructions + '\n\nMaintain balanced perspective considering both risks and opportunities.',
          constraints: [...basePrompt.constraints, 'Present both positive and negative aspects equally']
        });
        break;
    }
    
    return variations;
  }

  /**
   * Optimize prompt for specific use cases
   */
  static optimizeForUseCase(
    prompt: import('./system-prompts').SystemPrompt,
    useCase: 'SPEED' | 'ACCURACY' | 'COMPREHENSIVENESS'
  ): import('./system-prompts').SystemPrompt {
    switch (useCase) {
      case 'SPEED':
        return {
          ...prompt,
          instructions: prompt.instructions + '\n\nPrioritize key findings and provide concise analysis.',
          constraints: [...prompt.constraints, 'Focus on material issues only', 'Limit analysis to top 5 findings']
        };
        
      case 'ACCURACY':
        return {
          ...prompt,
          instructions: prompt.instructions + '\n\nVerify all claims with multiple sources and provide detailed evidence.',
          constraints: [...prompt.constraints, 'Require multiple source verification', 'Include confidence levels for all findings']
        };
        
      case 'COMPREHENSIVENESS':
        return {
          ...prompt,
          instructions: prompt.instructions + '\n\nProvide exhaustive analysis covering all relevant aspects.',
          constraints: [...prompt.constraints, 'Address all risk categories', 'Include both quantitative and qualitative analysis']
        };
        
      default:
        return prompt;
    }
  }
}

// Export the main prompt engine instance
export const promptEngine = new PromptEngine();

export default PromptEngine;