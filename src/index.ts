/**
 * PrismForge AI - Multi-agent validation platform for M&A due diligence
 * 
 * Main entry point providing a unified API for the entire system
 */

// Core Types
export * from './types/core';

// Agent System
export * from './agents/agent-profiles';
export * from './agents/conflict-resolution';
export * from './agents/scoring-weights';

// Knowledge Base
export * from './knowledge/financial-terms';
export * from './knowledge/validation-frameworks';
export * from './knowledge/red-flags';
export * from './knowledge/industry-specifics';
export * from './knowledge/deal-structures';

// Prompt Engineering
export * from './prompts';

// State Management & Orchestration
export * from './state/orchestration';

// Resilience & Error Recovery
export * from './resilience';

// Examples and Usage Patterns
export * from './examples/usage-patterns';

/**
 * Main PrismForge AI class that coordinates all system components
 */
export class PrismForgeAI {
  private orchestrationService: import('./state/orchestration').OrchestrationService;
  private resilienceManager: import('./resilience').ResilienceManager;
  private isInitialized = false;

  constructor() {
    this.orchestrationService = new (require('./state/orchestration').OrchestrationService)();
    this.resilienceManager = new (require('./resilience').ResilienceManager)();
  }

  /**
   * Initialize the PrismForge AI system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('PrismForge AI is already initialized');
    }

    try {
      // Start orchestration service
      this.orchestrationService.start();
      
      // Initialize resilience components
      await this.resilienceManager.initialize();
      
      this.isInitialized = true;
      console.log('🎯 PrismForge AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize PrismForge AI:', error);
      throw error;
    }
  }

  /**
   * Shutdown the PrismForge AI system gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Stop orchestration service
      this.orchestrationService.stop();
      
      // Shutdown resilience components
      await this.resilienceManager.shutdown();
      
      this.isInitialized = false;
      console.log('🔄 PrismForge AI shutdown completed');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Analyze a document using the multi-agent validation system
   */
  async analyzeDocument(
    document: import('./types/core').Document,
    options?: Partial<import('./types/core').AnalysisConfiguration>
  ): Promise<import('./types/core').ValidationResult> {
    if (!this.isInitialized) {
      throw new Error('PrismForge AI must be initialized before use');
    }

    const request: import('./types/core').AnalysisRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentId: document.id,
      requestedBy: 'api',
      priority: 'MEDIUM',
      configuration: {
        agents: [
          { type: 'CHALLENGE', enabled: true, weight: 0.3, timeout: 30000 },
          { type: 'EVIDENCE', enabled: true, weight: 0.4, timeout: 30000 },
          { type: 'RISK', enabled: true, weight: 0.3, timeout: 30000 },
          { type: 'JUDGE', enabled: true, weight: 1.0, timeout: 45000 }
        ],
        consensusThreshold: 0.7,
        maxRetries: 2,
        enableSecondRound: true,
        outputFormat: 'MARKDOWN',
        ...options
      },
      createdAt: new Date(),
      timeout: 120000
    };

    return this.orchestrationService.startAnalysis(request, document);
  }

  /**
   * Get system health and metrics
   */
  getSystemHealth(): {
    initialized: boolean;
    orchestrationMetrics: any;
    resilienceMetrics: any;
  } {
    return {
      initialized: this.isInitialized,
      orchestrationMetrics: this.isInitialized ? this.orchestrationService.getMetrics() : null,
      resilienceMetrics: this.isInitialized ? this.resilienceManager.getSystemHealth() : null
    };
  }

  /**
   * Get version information
   */
  static getVersion(): string {
    return '1.0.0';
  }

  /**
   * Get system capabilities
   */
  static getCapabilities(): {
    documentTypes: import('./types/core').DocumentType[];
    industries: import('./types/core').IndustryType[];
    agentTypes: import('./types/core').AgentType[];
    outputFormats: import('./types/core').OutputFormat[];
  } {
    return {
      documentTypes: ['CIM', 'FINANCIAL_MODEL', 'LOI', 'SPA', 'DD_REPORT', 'VALUATION', 'PITCH_DECK', 'MANAGEMENT_PRESENTATION'],
      industries: ['SAAS', 'MANUFACTURING', 'HEALTHCARE', 'FINTECH', 'RETAIL', 'ENERGY', 'REAL_ESTATE', 'TECHNOLOGY', 'OTHER'],
      agentTypes: ['CHALLENGE', 'EVIDENCE', 'RISK', 'JUDGE'],
      outputFormats: ['MARKDOWN', 'JSON', 'PDF', 'HTML']
    };
  }
}

// Default export
export default PrismForgeAI;

/**
 * Quick start function for simple use cases
 */
export async function quickAnalysis(
  documentContent: string,
  documentType: import('./types/core').DocumentType,
  industry?: import('./types/core').IndustryType
): Promise<import('./types/core').ValidationResult> {
  const prismforge = new PrismForgeAI();
  
  try {
    await prismforge.initialize();
    
    const document: import('./types/core').Document = {
      id: `doc-quick-${Date.now()}`,
      type: documentType,
      content: documentContent,
      metadata: {
        fileName: `quick-analysis.${documentType.toLowerCase()}`,
        fileSize: documentContent.length,
        mimeType: 'text/plain',
        language: 'en',
        industry
      },
      uploadedAt: new Date()
    };

    return await prismforge.analyzeDocument(document);
  } finally {
    await prismforge.shutdown();
  }
}

/**
 * Health check function for monitoring
 */
export function healthCheck(): { status: 'ok' | 'error'; timestamp: Date; version: string } {
  return {
    status: 'ok',
    timestamp: new Date(),
    version: PrismForgeAI.getVersion()
  };
}