/**
 * Usage patterns and examples for PrismForge AI
 * Demonstrates common workflows and integration patterns
 */

import { 
  Document, 
  AnalysisRequest, 
  ValidationResult, 
  AgentType, 
  DocumentType,
  IndustryType,
  Priority 
} from '../types/core';
import { OrchestrationService } from '../state/orchestration';
import { FinancialMetrics, calculateEBITDAMultiple, validateFinancialModel } from '../knowledge/financial-terms';
import { DCFValidationFramework, ComparableCompaniesFramework } from '../knowledge/validation-frameworks';
import { RedFlagDetector } from '../knowledge/red-flags';
import { IndustryAnalyzer } from '../knowledge/industry-specifics';
import { AgentProfileManager } from '../agents/agent-profiles';
import { ConflictResolver } from '../agents/conflict-resolution';
import { PromptOrchestrator } from '../prompts';
import { ResilienceManager } from '../resilience';

/**
 * Example 1: Basic CIM Analysis
 * Demonstrates standard workflow for analyzing a Confidential Information Memorandum
 */
export async function analyzeCIM(): Promise<ValidationResult> {
  // 1. Create document instance
  const document: Document = {
    id: 'doc-cim-001',
    type: 'CIM',
    content: `
      Target Company: TechFlow Solutions
      Industry: SaaS
      Revenue (LTM): $25M
      EBITDA (LTM): $8M
      Growth Rate: 45% YoY
      Customer Count: 500+
      Retention Rate: 95%
      Annual Recurring Revenue: $22M
    `,
    metadata: {
      fileName: 'techflow-cim.pdf',
      fileSize: 2048000,
      mimeType: 'application/pdf',
      pages: 45,
      language: 'en',
      industry: 'SAAS',
      dealValue: 100000000,
      dealStage: 'INITIAL_REVIEW'
    },
    uploadedAt: new Date(),
    processedAt: new Date()
  };

  // 2. Configure analysis request
  const request: AnalysisRequest = {
    id: 'req-001',
    documentId: document.id,
    requestedBy: 'deal-team-alpha',
    priority: 'HIGH',
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
      outputFormat: 'MARKDOWN'
    },
    createdAt: new Date(),
    timeout: 120000
  };

  // 3. Initialize orchestration service
  const orchestrationService = new OrchestrationService();
  orchestrationService.start();

  try {
    // 4. Run analysis
    const result = await orchestrationService.startAnalysis(request, document);
    
    console.log('CIM Analysis Results:');
    console.log(`Overall Assessment: ${result.finalAnalysis.overallAssessment}`);
    console.log(`Key Findings: ${result.finalAnalysis.keyFindings.length}`);
    console.log(`Risk Level: ${result.finalAnalysis.riskProfile.overall}`);
    
    return result;
  } finally {
    orchestrationService.stop();
  }
}

/**
 * Example 2: Financial Model Validation
 * Deep dive validation of financial projections and assumptions
 */
export async function validateFinancialProjections(): Promise<void> {
  // Sample financial data
  const financialMetrics: FinancialMetrics = {
    revenue: {
      current: 25000000,
      projected: [30000000, 42000000, 58000000],
      growth: [0.20, 0.40, 0.38],
      recurring: 0.88,
      breakdown: {
        subscription: 22000000,
        professional_services: 2500000,
        other: 500000
      }
    },
    ebitda: {
      current: 8000000,
      projected: [10500000, 16800000, 24650000],
      margin: [0.35, 0.40, 0.425],
      adjustments: [
        { type: 'stock_compensation', amount: 1200000 },
        { type: 'one_time_expenses', amount: 800000 }
      ]
    },
    freeCashFlow: {
      current: 6500000,
      projected: [8750000, 14200000, 21200000],
      conversion: [0.83, 0.845, 0.86],
      capexRatio: 0.03
    },
    workingCapital: {
      current: 2100000,
      asPercentOfRevenue: 0.084,
      daysReceivable: 45,
      daysPayable: 30
    },
    debt: {
      total: 5000000,
      senior: 5000000,
      subordinated: 0,
      interestRate: 0.065
    }
  };

  // 1. Validate financial model structure
  const validationResult = validateFinancialModel(financialMetrics);
  console.log('Financial Model Validation:', validationResult);

  // 2. DCF Analysis Framework
  const dcfFramework = new DCFValidationFramework();
  const dcfAnalysis = await dcfFramework.validateDCF({
    financialMetrics,
    assumptions: {
      discountRate: 0.12,
      terminalGrowthRate: 0.025,
      projectionYears: 5
    },
    sensitivityRanges: {
      discountRate: [0.10, 0.14],
      terminalGrowthRate: [0.02, 0.03],
      revenueGrowth: [-0.05, 0.05]
    }
  });

  console.log('DCF Validation Score:', dcfAnalysis.score);
  console.log('Key Issues:', dcfAnalysis.issues);

  // 3. Red flag detection
  const redFlagDetector = new RedFlagDetector();
  const redFlags = redFlagDetector.analyzeFinancialModel(financialMetrics);
  
  if (redFlags.length > 0) {
    console.log('Red Flags Detected:');
    redFlags.forEach(flag => {
      console.log(`- ${flag.category}: ${flag.description} (Severity: ${flag.severity})`);
    });
  }

  // 4. Calculate key multiples
  const ebitdaMultiple = calculateEBITDAMultiple(100000000, financialMetrics.ebitda.current);
  console.log(`EBITDA Multiple: ${ebitdaMultiple.toFixed(1)}x`);
}

/**
 * Example 3: Industry-Specific Analysis
 * Demonstrates SaaS-specific metrics validation
 */
export async function analyzeSaaSMetrics(): Promise<void> {
  const industryAnalyzer = new IndustryAnalyzer();
  
  const saasMetrics = {
    arr: 22000000,
    mrr: 1833333,
    churnRate: {
      gross: 0.05,
      net: -0.02, // Negative due to expansion
      logo: 0.08
    },
    customerAcquisition: {
      cac: 2500,
      ltv: 45000,
      paybackPeriod: 14,
      ltvCacRatio: 18
    },
    growth: {
      arrGrowth: 0.45,
      ndrr: 1.12,
      newArrGrowth: 0.38,
      expansionRate: 0.25
    },
    efficiency: {
      ruleOf40: 0.77, // Growth rate + profit margin
      magicNumber: 1.8,
      salesEfficiency: 2.2
    }
  };

  const analysis = await industryAnalyzer.analyzeSaaS(saasMetrics);
  
  console.log('SaaS Analysis Results:');
  console.log(`Overall Score: ${analysis.overallScore}/100`);
  console.log(`Benchmark Percentile: ${analysis.benchmarkPercentile}th`);
  
  analysis.insights.forEach(insight => {
    console.log(`${insight.category}: ${insight.message}`);
  });
}

/**
 * Example 4: Multi-Agent Conflict Resolution
 * Demonstrates handling disagreements between agents
 */
export async function demonstrateConflictResolution(): Promise<void> {
  const agentProfileManager = new AgentProfileManager();
  const conflictResolver = new ConflictResolver();

  // Simulate conflicting agent results
  const challengeResult = {
    agentType: 'CHALLENGE' as AgentType,
    documentId: 'doc-001',
    status: 'COMPLETED' as const,
    result: {
      summary: 'Significant concerns about growth sustainability',
      findings: [{
        id: 'finding-1',
        category: 'FINANCIAL' as const,
        severity: 'HIGH' as const,
        title: 'Unsustainable Growth Assumptions',
        description: 'Revenue growth projections exceed industry benchmarks',
        evidence: [],
        impact: 'SIGNIFICANT' as const,
        likelihood: 'LIKELY' as const
      }],
      confidence: 0.85,
      evidenceStrength: 'STRONG' as const,
      recommendations: [],
      metadata: {
        processingTime: 25000,
        modelUsed: 'claude-3-sonnet',
        tokensUsed: 2500,
        cost: 0.05,
        cacheHit: false,
        dataQuality: 'GOOD' as const
      }
    },
    executionTime: 25000,
    retryCount: 0,
    timestamp: new Date()
  };

  const evidenceResult = {
    agentType: 'EVIDENCE' as AgentType,
    documentId: 'doc-001',
    status: 'COMPLETED' as const,
    result: {
      summary: 'Growth projections supported by historical data',
      findings: [{
        id: 'finding-2',
        category: 'FINANCIAL' as const,
        severity: 'MEDIUM' as const,
        title: 'Historical Growth Pattern',
        description: 'Company has demonstrated consistent 40%+ growth',
        evidence: [],
        impact: 'MODERATE' as const,
        likelihood: 'HIGHLY_LIKELY' as const
      }],
      confidence: 0.78,
      evidenceStrength: 'MODERATE' as const,
      recommendations: [],
      metadata: {
        processingTime: 28000,
        modelUsed: 'claude-3-sonnet',
        tokensUsed: 2800,
        cost: 0.056,
        cacheHit: false,
        dataQuality: 'GOOD' as const
      }
    },
    executionTime: 28000,
    retryCount: 0,
    timestamp: new Date()
  };

  // Detect conflicts
  const conflicts = conflictResolver.detectConflicts([challengeResult, evidenceResult]);
  
  if (conflicts.length > 0) {
    console.log('Conflicts detected between agents:');
    conflicts.forEach(conflict => {
      console.log(`- ${conflict.conflictType}: ${conflict.agents.join(' vs ')}`);
    });

    // Resolve conflicts
    const resolution = await conflictResolver.resolveConflicts(conflicts, [challengeResult, evidenceResult]);
    console.log(`Conflict resolved using: ${resolution.method}`);
    console.log(`Winner: ${resolution.winner}`);
    console.log(`Justification: ${resolution.justification}`);
  }
}

/**
 * Example 5: Prompt Engineering Workflow
 * Shows dynamic prompt generation and optimization
 */
export async function demonstratePromptEngineering(): Promise<void> {
  const promptOrchestrator = new PromptOrchestrator();

  // Generate document-specific prompts
  const document: Document = {
    id: 'doc-loi-001',
    type: 'LOI',
    content: 'Letter of Intent for acquisition...',
    metadata: {
      fileName: 'acquisition-loi.pdf',
      fileSize: 512000,
      mimeType: 'application/pdf',
      language: 'en',
      industry: 'MANUFACTURING',
      dealValue: 50000000,
      dealStage: 'LOI_SIGNED'
    },
    uploadedAt: new Date()
  };

  // Generate agent-specific prompts
  const challengePrompt = promptOrchestrator.generatePrompt('CHALLENGE', document);
  const evidencePrompt = promptOrchestrator.generatePrompt('EVIDENCE', document);

  console.log('Generated Challenge Agent Prompt:');
  console.log(challengePrompt.substring(0, 200) + '...');

  // Demonstrate preprocessing with Haiku
  const preprocessingPrompt = promptOrchestrator.generatePreprocessingPrompt(document);
  console.log('\nPreprocessing prompt for cost optimization:');
  console.log(preprocessingPrompt.substring(0, 200) + '...');

  // Format output
  const sampleResult = {
    overallAssessment: 'BUY' as const,
    keyFindings: [],
    dealBreakers: [],
    opportunities: [],
    riskProfile: { overall: 'MODERATE' as const, categories: [], mitigationStrategies: [] },
    recommendedActions: [],
    executiveSummary: 'Recommended acquisition with moderate risk profile',
    confidence: 0.82
  };

  const markdownReport = promptOrchestrator.formatOutput(sampleResult, 'MARKDOWN');
  console.log('\nFormatted Markdown Report:');
  console.log(markdownReport.substring(0, 300) + '...');
}

/**
 * Example 6: Error Recovery and Resilience
 * Demonstrates handling of various failure scenarios
 */
export async function demonstrateErrorRecovery(): Promise<void> {
  const resilienceManager = new ResilienceManager();

  // Simulate agent timeout scenario
  console.log('Testing timeout handling...');
  const timeoutResult = await resilienceManager.timeoutHandler.executeWithTimeout(
    async () => {
      // Simulate slow operation
      await new Promise(resolve => setTimeout(resolve, 35000));
      return 'Success';
    },
    30000, // 30 second timeout
    'CHALLENGE'
  );

  if (timeoutResult.success) {
    console.log('Operation completed:', timeoutResult.result);
  } else {
    console.log('Operation timed out:', timeoutResult.error);
  }

  // Test circuit breaker
  console.log('\nTesting circuit breaker...');
  const circuitBreaker = resilienceManager.circuitBreakerManager.getCircuitBreaker('LLM_API');
  
  try {
    const result = await circuitBreaker.execute(async () => {
      // Simulate API call
      throw new Error('Service unavailable');
    });
  } catch (error) {
    console.log('Circuit breaker caught error:', error.message);
  }

  // Test retry logic with exponential backoff
  console.log('\nTesting retry logic...');
  const retryResult = await resilienceManager.retryManager.retry(
    async () => {
      // Simulate intermittent failure
      if (Math.random() < 0.7) {
        throw new Error('Temporary failure');
      }
      return 'Success after retries';
    },
    'STANDARD'
  );

  console.log('Retry result:', retryResult);
}

/**
 * Example 7: Complete End-to-End Workflow
 * Demonstrates full analysis pipeline with all components
 */
export async function completeWorkflowExample(): Promise<void> {
  console.log('Starting complete PrismForge AI workflow...\n');

  try {
    // Step 1: Analyze CIM
    console.log('1. Analyzing CIM document...');
    const cimResult = await analyzeCIM();
    console.log(`✓ CIM analysis completed with ${cimResult.finalAnalysis.keyFindings.length} findings\n`);

    // Step 2: Validate financial model
    console.log('2. Validating financial projections...');
    await validateFinancialProjections();
    console.log('✓ Financial validation completed\n');

    // Step 3: Industry-specific analysis
    console.log('3. Running SaaS-specific analysis...');
    await analyzeSaaSMetrics();
    console.log('✓ Industry analysis completed\n');

    // Step 4: Test conflict resolution
    console.log('4. Testing conflict resolution...');
    await demonstrateConflictResolution();
    console.log('✓ Conflict resolution demonstrated\n');

    // Step 5: Prompt engineering
    console.log('5. Demonstrating prompt engineering...');
    await demonstratePromptEngineering();
    console.log('✓ Prompt engineering demonstrated\n');

    // Step 6: Error recovery
    console.log('6. Testing error recovery...');
    await demonstrateErrorRecovery();
    console.log('✓ Error recovery tested\n');

    console.log('🎉 Complete workflow demonstration finished successfully!');

  } catch (error) {
    console.error('❌ Workflow error:', error.message);
  }
}

// Export all examples for easy access
export const examples = {
  analyzeCIM,
  validateFinancialProjections,
  analyzeSaaSMetrics,
  demonstrateConflictResolution,
  demonstratePromptEngineering,
  demonstrateErrorRecovery,
  completeWorkflowExample
};

export default examples;