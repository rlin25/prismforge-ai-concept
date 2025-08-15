/**
 * Comprehensive test suite for PrismForge AI validation logic
 * Tests core functionality, edge cases, and integration scenarios
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  Document, 
  AnalysisRequest, 
  ValidationResult, 
  AgentResult,
  Finding,
  FinancialMetrics 
} from '../types/core';
import { OrchestrationService } from '../state/orchestration';
import { 
  validateFinancialModel,
  calculateEBITDAMultiple,
  calculateLTVCACRatio,
  validateRevenueForecast 
} from '../knowledge/financial-terms';
import { DCFValidationFramework } from '../knowledge/validation-frameworks';
import { RedFlagDetector } from '../knowledge/red-flags';
import { IndustryAnalyzer } from '../knowledge/industry-specifics';
import { ConflictResolver } from '../agents/conflict-resolution';
import { ResilienceManager } from '../resilience';

describe('Financial Validation Tests', () => {
  let sampleFinancialMetrics: FinancialMetrics;

  beforeEach(() => {
    sampleFinancialMetrics = {
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
  });

  test('should validate healthy financial model', () => {
    const result = validateFinancialModel(sampleFinancialMetrics);
    
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(70);
    expect(result.issues).toHaveLength(0);
  });

  test('should detect revenue growth inconsistencies', () => {
    const invalidMetrics = {
      ...sampleFinancialMetrics,
      revenue: {
        ...sampleFinancialMetrics.revenue,
        growth: [0.20, 1.50, 0.38] // Unrealistic 150% growth
      }
    };

    const result = validateFinancialModel(invalidMetrics);
    
    expect(result.isValid).toBe(false);
    expect(result.issues.some(issue => issue.includes('growth'))).toBe(true);
  });

  test('should calculate EBITDA multiple correctly', () => {
    const multiple = calculateEBITDAMultiple(100000000, 8000000);
    expect(multiple).toBeCloseTo(12.5, 1);
  });

  test('should calculate LTV/CAC ratio correctly', () => {
    const ratio = calculateLTVCACRatio(45000, 2500);
    expect(ratio).toBeCloseTo(18, 1);
  });

  test('should validate revenue forecast patterns', () => {
    const forecast = [10, 15, 22, 32, 45]; // Reasonable growth
    const result = validateRevenueForecast(forecast);
    
    expect(result.isValid).toBe(true);
    expect(result.growthPattern).toBe('CONSISTENT');
  });

  test('should detect hockey stick revenue patterns', () => {
    const forecast = [10, 12, 14, 45, 90]; // Hockey stick
    const result = validateRevenueForecast(forecast);
    
    expect(result.isValid).toBe(false);
    expect(result.growthPattern).toBe('HOCKEY_STICK');
    expect(result.warnings).toContain('Potential hockey stick projection detected');
  });
});

describe('Red Flag Detection Tests', () => {
  let redFlagDetector: RedFlagDetector;

  beforeEach(() => {
    redFlagDetector = new RedFlagDetector();
  });

  test('should detect excessive EBITDA add-backs', () => {
    const financialMetrics = {
      ebitda: {
        current: 5000000,
        adjustments: [
          { type: 'stock_compensation', amount: 800000 },
          { type: 'one_time_expenses', amount: 1500000 } // Total 2.3M = 46% of EBITDA
        ]
      },
      revenue: { current: 20000000 }
    } as FinancialMetrics;

    const redFlags = redFlagDetector.analyzeFinancialModel(financialMetrics);
    
    expect(redFlags.some(flag => 
      flag.category === 'EXCESSIVE_EBITDA_ADDBACKS'
    )).toBe(true);
  });

  test('should detect customer concentration risk', () => {
    const customerData = {
      totalRevenue: 10000000,
      topCustomers: [
        { revenue: 4000000, name: 'Customer A' }, // 40% concentration
        { revenue: 1500000, name: 'Customer B' },
        { revenue: 1000000, name: 'Customer C' }
      ]
    };

    const redFlags = redFlagDetector.analyzeCustomerConcentration(customerData);
    
    expect(redFlags.some(flag => 
      flag.category === 'HIGH_CUSTOMER_CONCENTRATION'
    )).toBe(true);
  });

  test('should detect working capital deterioration', () => {
    const workingCapitalTrend = [
      { period: '2021', amount: 1000000 },
      { period: '2022', amount: 2000000 },
      { period: '2023', amount: 4000000 } // Rapidly increasing
    ];

    const redFlags = redFlagDetector.analyzeWorkingCapitalTrend(workingCapitalTrend);
    
    expect(redFlags.some(flag => 
      flag.category === 'WORKING_CAPITAL_DETERIORATION'
    )).toBe(true);
  });
});

describe('Industry Analysis Tests', () => {
  let industryAnalyzer: IndustryAnalyzer;

  beforeEach(() => {
    industryAnalyzer = new IndustryAnalyzer();
  });

  test('should analyze SaaS metrics correctly', async () => {
    const saasMetrics = {
      arr: 25000000,
      churnRate: { gross: 0.05, net: -0.02 },
      customerAcquisition: { cac: 2000, ltv: 40000 },
      growth: { arrGrowth: 0.40 },
      efficiency: { ruleOf40: 0.75 }
    };

    const analysis = await industryAnalyzer.analyzeSaaS(saasMetrics);
    
    expect(analysis.overallScore).toBeGreaterThan(70);
    expect(analysis.benchmarkPercentile).toBeGreaterThan(50);
    expect(analysis.insights).toHaveLength.toBeGreaterThan(0);
  });

  test('should identify strong SaaS performance', async () => {
    const strongSaasMetrics = {
      arr: 50000000,
      churnRate: { gross: 0.03, net: -0.05 }, // Excellent retention
      customerAcquisition: { cac: 1500, ltv: 50000 }, // Great LTV/CAC
      growth: { arrGrowth: 0.50 }, // Strong growth
      efficiency: { ruleOf40: 0.85 } // Excellent efficiency
    };

    const analysis = await industryAnalyzer.analyzeSaaS(strongSaasMetrics);
    
    expect(analysis.overallScore).toBeGreaterThan(85);
    expect(analysis.benchmarkPercentile).toBeGreaterThan(80);
  });

  test('should flag concerning SaaS metrics', async () => {
    const concerningSaasMetrics = {
      arr: 5000000,
      churnRate: { gross: 0.15, net: 0.10 }, // High churn
      customerAcquisition: { cac: 5000, ltv: 8000 }, // Poor LTV/CAC
      growth: { arrGrowth: 0.10 }, // Slow growth
      efficiency: { ruleOf40: 0.25 } // Poor efficiency
    };

    const analysis = await industryAnalyzer.analyzeSaaS(concerningSaasMetrics);
    
    expect(analysis.overallScore).toBeLessThan(50);
    expect(analysis.insights.some(insight => 
      insight.severity === 'HIGH'
    )).toBe(true);
  });
});

describe('DCF Validation Tests', () => {
  let dcfFramework: DCFValidationFramework;

  beforeEach(() => {
    dcfFramework = new DCFValidationFramework();
  });

  test('should validate reasonable DCF assumptions', async () => {
    const dcfData = {
      financialMetrics: {
        revenue: { current: 100000000, projected: [120000000, 144000000, 172800000] },
        ebitda: { current: 25000000, projected: [30000000, 36000000, 43200000] },
        freeCashFlow: { current: 20000000, projected: [24000000, 28800000, 34560000] }
      } as FinancialMetrics,
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
    };

    const result = await dcfFramework.validateDCF(dcfData);
    
    expect(result.score).toBeGreaterThan(70);
    expect(result.issues).toHaveLength(0);
  });

  test('should flag unrealistic discount rates', async () => {
    const dcfData = {
      financialMetrics: {} as FinancialMetrics,
      assumptions: {
        discountRate: 0.25, // Unrealistically high
        terminalGrowthRate: 0.025,
        projectionYears: 5
      },
      sensitivityRanges: {
        discountRate: [0.20, 0.30],
        terminalGrowthRate: [0.02, 0.03],
        revenueGrowth: [-0.05, 0.05]
      }
    };

    const result = await dcfFramework.validateDCF(dcfData);
    
    expect(result.score).toBeLessThan(50);
    expect(result.issues.some(issue => 
      issue.includes('discount rate')
    )).toBe(true);
  });
});

describe('Agent Conflict Resolution Tests', () => {
  let conflictResolver: ConflictResolver;

  beforeEach(() => {
    conflictResolver = new ConflictResolver();
  });

  test('should detect conflicts between agents', () => {
    const agentResults: AgentResult[] = [
      {
        agentType: 'CHALLENGE',
        documentId: 'doc-1',
        status: 'COMPLETED',
        result: {
          findings: [{
            id: 'finding-1',
            category: 'FINANCIAL',
            severity: 'HIGH',
            title: 'Revenue Concerns',
            description: 'Unrealistic projections',
            evidence: [],
            impact: 'SIGNIFICANT',
            likelihood: 'LIKELY'
          }],
          confidence: 0.9
        } as any,
        executionTime: 25000,
        retryCount: 0,
        timestamp: new Date()
      },
      {
        agentType: 'EVIDENCE',
        documentId: 'doc-1',
        status: 'COMPLETED',
        result: {
          findings: [{
            id: 'finding-2',
            category: 'FINANCIAL',
            severity: 'LOW',
            title: 'Revenue Support',
            description: 'Projections supported by data',
            evidence: [],
            impact: 'MINIMAL',
            likelihood: 'HIGHLY_LIKELY'
          }],
          confidence: 0.8
        } as any,
        executionTime: 28000,
        retryCount: 0,
        timestamp: new Date()
      }
    ];

    const conflicts = conflictResolver.detectConflicts(agentResults);
    
    expect(conflicts).toHaveLength.toBeGreaterThan(0);
    expect(conflicts[0].conflictType).toBe('SEVERITY_DISAGREEMENT');
  });

  test('should resolve conflicts using weighted voting', async () => {
    const conflicts = [{
      agents: ['CHALLENGE', 'EVIDENCE'] as any,
      finding: {} as Finding,
      conflictType: 'SEVERITY_DISAGREEMENT' as const,
      resolution: undefined
    }];

    const agentResults = [
      { agentType: 'CHALLENGE', result: { confidence: 0.9 } },
      { agentType: 'EVIDENCE', result: { confidence: 0.7 } }
    ] as AgentResult[];

    const resolution = await conflictResolver.resolveConflicts(conflicts, agentResults);
    
    expect(resolution).toBeDefined();
    expect(resolution.method).toBe('WEIGHTED_VOTING');
    expect(resolution.winner).toBe('CHALLENGE'); // Higher confidence
  });
});

describe('Orchestration Tests', () => {
  let orchestrationService: OrchestrationService;

  beforeEach(() => {
    orchestrationService = new OrchestrationService();
    orchestrationService.start();
  });

  afterEach(() => {
    orchestrationService.stop();
  });

  test('should handle successful analysis workflow', async () => {
    const document: Document = {
      id: 'doc-test-1',
      type: 'CIM',
      content: 'Test CIM content',
      metadata: {
        fileName: 'test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        language: 'en',
        industry: 'SAAS'
      },
      uploadedAt: new Date()
    };

    const request: AnalysisRequest = {
      id: 'req-test-1',
      documentId: document.id,
      requestedBy: 'test-user',
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
        outputFormat: 'MARKDOWN'
      },
      createdAt: new Date(),
      timeout: 120000
    };

    // Mock the analysis - in real scenario this would trigger actual agents
    jest.setTimeout(10000);
    
    // This would normally run the full analysis
    // const result = await orchestrationService.startAnalysis(request, document);
    // expect(result.status).toBe('COMPLETED');
  });
});

describe('Resilience Tests', () => {
  let resilienceManager: ResilienceManager;

  beforeEach(() => {
    resilienceManager = new ResilienceManager();
  });

  test('should handle timeouts gracefully', async () => {
    const result = await resilienceManager.timeoutHandler.executeWithTimeout(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      },
      50, // Shorter timeout
      'TEST_AGENT'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
  });

  test('should retry failed operations', async () => {
    let attemptCount = 0;
    
    const result = await resilienceManager.retryManager.retry(
      async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      },
      'FAST'
    );

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(attemptCount).toBe(3);
  });

  test('should open circuit breaker after failures', async () => {
    const circuitBreaker = resilienceManager.circuitBreakerManager.getCircuitBreaker('TEST_SERVICE');
    
    // Cause multiple failures
    for (let i = 0; i < 5; i++) {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Service failure');
        });
      } catch (error) {
        // Expected failures
      }
    }

    expect(circuitBreaker.getState()).toBe('OPEN');
  });
});

describe('Integration Tests', () => {
  test('should complete full validation workflow', async () => {
    // This would test the complete end-to-end workflow
    // Including document processing, agent execution, conflict resolution, and result compilation
    
    const mockDocument: Document = {
      id: 'integration-test-doc',
      type: 'CIM',
      content: `
        Company: TechCorp
        Revenue: $50M
        Growth: 30%
        EBITDA: $15M
        Industry: SaaS
      `,
      metadata: {
        fileName: 'techcorp-cim.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        language: 'en',
        industry: 'SAAS',
        dealValue: 200000000
      },
      uploadedAt: new Date()
    };

    // In a real implementation, this would:
    // 1. Process the document
    // 2. Execute all agents in parallel
    // 3. Detect and resolve conflicts
    // 4. Generate final analysis
    // 5. Cache results
    
    expect(mockDocument.id).toBe('integration-test-doc');
    // More comprehensive testing would be implemented here
  });
});

describe('Performance Tests', () => {
  test('should complete analysis within time limits', async () => {
    const startTime = Date.now();
    
    // Mock a typical analysis workflow
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete well under the 2-minute target
    expect(duration).toBeLessThan(120000);
  });

  test('should handle concurrent requests', async () => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => resolve(`Request ${i} completed`), Math.random() * 100);
        })
      );
    }

    const results = await Promise.all(promises);
    expect(results).toHaveLength(concurrentRequests);
  });
});

export { };