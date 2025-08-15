/**
 * PrismForge AI Resilience Module
 * Comprehensive error recovery and fallback strategies
 */

// Timeout Handler exports
export {
  TimeoutHandler,
  defaultTimeoutHandler,
  withTimeout,
  addTimeout,
  type TimeoutConfig,
  type AgentExecution,
  type TimeoutMetrics
} from './timeout-handler.js';

// Fallback Strategies exports
export {
  FallbackStrategies,
  defaultFallbackStrategies,
  requiresFallback,
  assessPartialSeverity,
  type FallbackConfig,
  type PartialAnalysisContext,
  type FallbackMetrics,
  type FallbackMode
} from './fallback-strategies.js';

// Retry Logic exports
export {
  RetryHandler,
  defaultRetryHandler,
  RetryConfigurations,
  retryable,
  retry,
  withRetry,
  retryBatch,
  retryIf,
  type RetryConfig,
  type RetryContext,
  type RetryMetrics
} from './retry-logic.js';

// Circuit Breaker exports
export {
  CircuitBreaker,
  CircuitBreakerManager,
  defaultCircuitBreakerManager,
  CircuitBreakerConfigurations,
  createServiceCircuitBreaker,
  withCircuitBreaker,
  type CircuitState,
  type CircuitBreakerConfig,
  type CircuitMetrics,
  type CallResult,
  type CircuitBreakerState
} from './circuit-breaker.js';

// Consensus System exports
export {
  ConsensusSystem,
  defaultConsensusSystem,
  isConsensusSufficient,
  getStrongestAgreement,
  prioritizeConflicts,
  type ConsensusConfig,
  type ConsensusMetrics,
  type WeightedVote,
  type ConsensusContext
} from './consensus-system.js';

/**
 * Resilience Module Configuration
 */
export interface ResilienceConfig {
  timeout?: Partial<import('./timeout-handler.js').TimeoutConfig>;
  fallback?: Partial<import('./fallback-strategies.js').FallbackConfig>;
  retry?: Partial<import('./retry-logic.js').RetryConfig>;
  circuitBreaker?: Partial<import('./circuit-breaker.js').CircuitBreakerConfig>;
  consensus?: Partial<import('./consensus-system.js').ConsensusConfig>;
}

/**
 * Comprehensive resilience metrics
 */
export interface ResilienceMetrics {
  timeout: import('./timeout-handler.js').TimeoutMetrics;
  fallback: import('./fallback-strategies.js').FallbackMetrics;
  retry: import('./retry-logic.js').RetryMetrics;
  circuitBreaker: Record<string, import('./circuit-breaker.js').CircuitMetrics>;
  consensus: import('./consensus-system.js').ConsensusMetrics;
  systemHealth: {
    overallHealthScore: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

/**
 * Main Resilience Manager
 * Coordinates all resilience mechanisms
 */
export class ResilienceManager {
  private timeoutHandler: import('./timeout-handler.js').TimeoutHandler;
  private fallbackStrategies: import('./fallback-strategies.js').FallbackStrategies;
  private retryHandler: import('./retry-logic.js').RetryHandler;
  private circuitBreakerManager: import('./circuit-breaker.js').CircuitBreakerManager;
  private consensusSystem: import('./consensus-system.js').ConsensusSystem;

  constructor(config: ResilienceConfig = {}) {
    this.timeoutHandler = new (require('./timeout-handler.js').TimeoutHandler)(config.timeout);
    this.fallbackStrategies = new (require('./fallback-strategies.js').FallbackStrategies)(config.fallback);
    this.retryHandler = new (require('./retry-logic.js').RetryHandler)(config.retry);
    this.circuitBreakerManager = new (require('./circuit-breaker.js').CircuitBreakerManager)(config.circuitBreaker);
    this.consensusSystem = new (require('./consensus-system.js').ConsensusSystem)(config.consensus);
  }

  /**
   * Execute an operation with full resilience protection
   */
  public async executeResilient<T>(
    operation: () => Promise<T>,
    options: {
      operationId: string;
      serviceName?: string;
      timeout?: number;
      retryConfig?: Partial<import('./retry-logic.js').RetryConfig>;
      circuitBreakerConfig?: Partial<import('./circuit-breaker.js').CircuitBreakerConfig>;
    }
  ): Promise<T> {
    const { operationId, serviceName = 'default', timeout, retryConfig, circuitBreakerConfig } = options;

    // Get or create circuit breaker for the service
    const circuitBreaker = this.circuitBreakerManager.getBreaker(serviceName, circuitBreakerConfig);

    // Create resilient operation
    const resilientOperation = async (): Promise<T> => {
      // Execute with circuit breaker protection
      return circuitBreaker.execute(async () => {
        // Execute with timeout protection
        return this.timeoutHandler.startExecution(
          operationId,
          'CHALLENGE', // Default agent type
          operation(),
          timeout
        );
      });
    };

    // Execute with retry logic
    return this.retryHandler.executeWithRetry(resilientOperation, operationId, retryConfig);
  }

  /**
   * Get comprehensive metrics from all resilience components
   */
  public getMetrics(): ResilienceMetrics {
    const timeoutMetrics = this.timeoutHandler.getMetrics();
    const fallbackMetrics = this.fallbackStrategies.getMetrics();
    const retryMetrics = this.retryHandler.getMetrics();
    const consensusMetrics = this.consensusSystem.getMetrics();

    // Get circuit breaker metrics for all breakers
    const circuitBreakerMetrics: Record<string, import('./circuit-breaker.js').CircuitMetrics> = {};
    const allBreakers = this.circuitBreakerManager.getAllBreakers();
    Object.entries(allBreakers).forEach(([name, breaker]) => {
      circuitBreakerMetrics[name] = breaker.getMetrics();
    });

    // Calculate system health
    const systemHealth = this.calculateSystemHealth({
      timeout: timeoutMetrics,
      fallback: fallbackMetrics,
      retry: retryMetrics,
      circuitBreaker: circuitBreakerMetrics,
      consensus: consensusMetrics,
      systemHealth: { overallHealthScore: 0, criticalIssues: [], recommendations: [] }
    });

    return {
      timeout: timeoutMetrics,
      fallback: fallbackMetrics,
      retry: retryMetrics,
      circuitBreaker: circuitBreakerMetrics,
      consensus: consensusMetrics,
      systemHealth
    };
  }

  /**
   * Perform health check on all resilience components
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check timeout handler
    const activeExecutions = this.timeoutHandler.getActiveExecutions();
    if (activeExecutions.length > 50) {
      issues.push(`High number of active executions: ${activeExecutions.length}`);
      recommendations.push('Consider increasing timeout limits or investigating slow operations');
    }

    // Check circuit breakers
    const breakerHealth = this.circuitBreakerManager.getHealthStatus();
    Object.entries(breakerHealth).forEach(([name, healthy]) => {
      if (!healthy) {
        issues.push(`Circuit breaker '${name}' is unhealthy`);
        recommendations.push(`Investigate and fix issues with service: ${name}`);
      }
    });

    // Check retry metrics
    const retryMetrics = this.retryHandler.getMetrics();
    if (retryMetrics.failedRetries / Math.max(1, retryMetrics.totalRetries) > 0.3) {
      issues.push(`High retry failure rate: ${(retryMetrics.failedRetries / retryMetrics.totalRetries * 100).toFixed(1)}%`);
      recommendations.push('Review and improve error handling or increase retry limits');
    }

    // Check consensus system
    const consensusMetrics = this.consensusSystem.getMetrics();
    if (consensusMetrics.averageAgreementLevel < 0.5) {
      issues.push(`Low consensus agreement level: ${(consensusMetrics.averageAgreementLevel * 100).toFixed(1)}%`);
      recommendations.push('Review agent configurations and consensus thresholds');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Reset all metrics across resilience components
   */
  public resetAllMetrics(): void {
    this.timeoutHandler.resetMetrics();
    this.retryHandler.resetMetrics();
    this.consensusSystem.resetMetrics();
    // Note: Fallback strategies and circuit breakers don't have reset methods in current implementation
  }

  /**
   * Graceful shutdown of all resilience components
   */
  public async gracefulShutdown(): Promise<void> {
    console.info('Initiating graceful shutdown of resilience manager');

    // Cancel all active timeouts
    this.timeoutHandler.cancelAllExecutions('System shutdown');

    // Cancel all active retries
    this.retryHandler.cancelAllRetries();

    // Perform timeout handler graceful shutdown
    await this.timeoutHandler.gracefulShutdown();

    console.info('Resilience manager shutdown completed');
  }

  private calculateSystemHealth(metrics: ResilienceMetrics): {
    overallHealthScore: number;
    criticalIssues: string[];
    recommendations: string[];
  } {
    let healthScore = 1.0;
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Evaluate timeout health
    if (metrics.timeout.timeoutRate > 0.1) {
      healthScore -= 0.2;
      criticalIssues.push(`High timeout rate: ${(metrics.timeout.timeoutRate * 100).toFixed(1)}%`);
      recommendations.push('Investigate slow operations and consider increasing timeout limits');
    }

    // Evaluate retry health
    if (metrics.retry.failedRetries / Math.max(1, metrics.retry.totalRetries) > 0.3) {
      healthScore -= 0.3;
      criticalIssues.push('High retry failure rate detected');
      recommendations.push('Review error handling and service reliability');
    }

    // Evaluate circuit breaker health
    Object.entries(metrics.circuitBreaker).forEach(([name, cbMetrics]) => {
      if (cbMetrics.errorRate > 50) {
        healthScore -= 0.2;
        criticalIssues.push(`Service '${name}' has high error rate`);
        recommendations.push(`Investigate and fix service issues for: ${name}`);
      }
    });

    // Evaluate consensus health
    if (metrics.consensus.averageAgreementLevel < 0.5) {
      healthScore -= 0.1;
      criticalIssues.push('Low consensus agreement levels');
      recommendations.push('Review agent performance and consensus configuration');
    }

    // Evaluate fallback usage
    if (metrics.fallback.fallbackSuccessRate < 0.7) {
      healthScore -= 0.1;
      criticalIssues.push('Low fallback success rate');
      recommendations.push('Improve fallback strategies and partial result handling');
    }

    return {
      overallHealthScore: Math.max(0, healthScore),
      criticalIssues,
      recommendations
    };
  }
}

/**
 * Default resilience manager instance
 */
export const defaultResilienceManager = new ResilienceManager();

/**
 * Utility function to create a resilient version of any async function
 */
export function makeResilient<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  serviceName: string,
  config?: ResilienceConfig
): (...args: TArgs) => Promise<TReturn> {
  const manager = config ? new ResilienceManager(config) : defaultResilienceManager;
  
  return async (...args: TArgs): Promise<TReturn> => {
    const operationId = `${serviceName}-${Date.now()}`;
    return manager.executeResilient(() => fn(...args), {
      operationId,
      serviceName
    });
  };
}