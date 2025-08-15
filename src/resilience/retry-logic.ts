/**
 * Retry Logic with Exponential Backoff and Jitter for PrismForge AI
 * Implements sophisticated retry strategies for handling transient failures
 */

import { AgentError, ErrorCode } from '../types/core.js';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBase: number;
  jitterType: 'none' | 'full' | 'equal' | 'decorrelated';
  backoffType: 'exponential' | 'linear' | 'polynomial';
  retryableErrors: ErrorCode[];
  deadlineMs?: number;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
  onMaxAttemptsReached?: (error: Error, attempts: number) => void;
}

export interface RetryContext {
  attempt: number;
  totalElapsed: number;
  lastDelay: number;
  errors: Error[];
  startTime: Date;
  operationId: string;
}

export interface RetryMetrics {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  averageAttempts: number;
  averageSuccessTime: number;
  errorTypeRetryRates: Record<string, number>;
  jitterEffectiveness: number;
}

export class RetryHandler {
  private config: RetryConfig;
  private metrics: RetryMetrics;
  private activeRetries = new Map<string, RetryContext>();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      exponentialBase: 2,
      jitterType: 'full',
      backoffType: 'exponential',
      retryableErrors: [
        'TIMEOUT',
        'RATE_LIMIT',
        'MODEL_ERROR',
        'NETWORK_ERROR'
      ],
      ...config
    };

    this.metrics = {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      averageAttempts: 0,
      averageSuccessTime: 0,
      errorTypeRetryRates: {},
      jitterEffectiveness: 0
    };
  }

  /**
   * Execute an operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string = `retry-${Date.now()}`,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const effectiveConfig = { ...this.config, ...config };
    const context: RetryContext = {
      attempt: 0,
      totalElapsed: 0,
      lastDelay: 0,
      errors: [],
      startTime: new Date(),
      operationId
    };

    this.activeRetries.set(operationId, context);
    this.metrics.totalRetries++;

    try {
      const result = await this.executeWithContext(operation, context, effectiveConfig);
      this.handleSuccess(context);
      return result;
    } catch (error) {
      this.handleFailure(context, error as Error);
      throw error;
    } finally {
      this.activeRetries.delete(operationId);
    }
  }

  /**
   * Check if an error is retryable
   */
  public isRetryableError(error: Error | AgentError): boolean {
    if ('code' in error && error.code) {
      return this.config.retryableErrors.includes(error.code);
    }

    // Check for common retryable error patterns
    const message = error.message.toLowerCase();
    const retryablePatterns = [
      'timeout',
      'rate limit',
      'throttled',
      'service unavailable',
      'connection reset',
      'network error',
      'temporary failure',
      'server error'
    ];

    return retryablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Calculate the next delay with jitter
   */
  public calculateDelay(attempt: number, context?: RetryContext): number {
    let delay: number;

    switch (this.config.backoffType) {
      case 'linear':
        delay = this.config.baseDelayMs * attempt;
        break;
      case 'polynomial':
        delay = this.config.baseDelayMs * Math.pow(attempt, 2);
        break;
      case 'exponential':
      default:
        delay = this.config.baseDelayMs * Math.pow(this.config.exponentialBase, attempt - 1);
        break;
    }

    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxDelayMs);

    // Apply jitter
    delay = this.applyJitter(delay, attempt, context);

    return Math.max(0, Math.floor(delay));
  }

  /**
   * Get current retry metrics
   */
  public getMetrics(): RetryMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get active retry contexts
   */
  public getActiveRetries(): RetryContext[] {
    return Array.from(this.activeRetries.values());
  }

  /**
   * Cancel a specific retry operation
   */
  public cancelRetry(operationId: string): boolean {
    return this.activeRetries.delete(operationId);
  }

  /**
   * Cancel all active retries
   */
  public cancelAllRetries(): void {
    this.activeRetries.clear();
  }

  /**
   * Create a retry-aware version of a function
   */
  public wrap<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    config?: Partial<RetryConfig>
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
      const operationId = `wrapped-${fn.name}-${Date.now()}`;
      return this.executeWithRetry(() => fn(...args), operationId, config);
    };
  }

  /**
   * Create a circuit breaker compatible retry function
   */
  public createRetryFunction<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): () => Promise<T> {
    return () => this.executeWithRetry(operation, undefined, config);
  }

  private async executeWithContext<T>(
    operation: () => Promise<T>,
    context: RetryContext,
    config: RetryConfig
  ): Promise<T> {
    while (context.attempt < config.maxAttempts) {
      context.attempt++;

      // Check deadline
      if (config.deadlineMs) {
        const elapsed = Date.now() - context.startTime.getTime();
        if (elapsed >= config.deadlineMs) {
          throw new Error(`Operation deadline exceeded: ${elapsed}ms >= ${config.deadlineMs}ms`);
        }
      }

      try {
        const result = await operation();
        return result;
      } catch (error) {
        const err = error as Error;
        context.errors.push(err);

        console.warn(
          `Attempt ${context.attempt}/${config.maxAttempts} failed for ${context.operationId}:`,
          err.message
        );

        // Check if error is retryable
        if (!this.isRetryableError(err)) {
          console.error(`Non-retryable error for ${context.operationId}:`, err.message);
          throw err;
        }

        // If this was the last attempt, throw the error
        if (context.attempt >= config.maxAttempts) {
          if (config.onMaxAttemptsReached) {
            config.onMaxAttemptsReached(err, context.attempt);
          }
          throw new Error(
            `Operation failed after ${context.attempt} attempts. Last error: ${err.message}`
          );
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(context.attempt, context);
        context.lastDelay = delay;
        context.totalElapsed += delay;

        if (config.onRetry) {
          config.onRetry(context.attempt, err, delay);
        }

        console.info(
          `Retrying ${context.operationId} in ${delay}ms (attempt ${context.attempt + 1}/${config.maxAttempts})`
        );

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    throw new Error('Unexpected end of retry loop');
  }

  private applyJitter(delay: number, attempt: number, context?: RetryContext): number {
    switch (this.config.jitterType) {
      case 'none':
        return delay;

      case 'full':
        // Random jitter between 0 and delay
        return Math.random() * delay;

      case 'equal':
        // Half fixed delay, half random
        return delay * 0.5 + Math.random() * delay * 0.5;

      case 'decorrelated':
        // Decorrelated jitter - uses previous delay
        const prevDelay = context?.lastDelay || this.config.baseDelayMs;
        const minDelay = this.config.baseDelayMs;
        const maxDelay = Math.min(delay * 3, this.config.maxDelayMs);
        return Math.random() * (maxDelay - minDelay) + minDelay;

      default:
        return delay;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleSuccess(context: RetryContext): void {
    const totalTime = Date.now() - context.startTime.getTime();
    
    this.metrics.successfulRetries++;
    
    if (context.attempt > 1) {
      console.info(
        `Operation ${context.operationId} succeeded on attempt ${context.attempt} after ${totalTime}ms`
      );
    }

    this.updateAverageSuccessTime(totalTime);
  }

  private handleFailure(context: RetryContext, error: Error): void {
    const totalTime = Date.now() - context.startTime.getTime();
    
    this.metrics.failedRetries++;
    
    console.error(
      `Operation ${context.operationId} failed permanently after ${context.attempt} attempts and ${totalTime}ms:`,
      error.message
    );

    // Update error type metrics
    const errorType = this.getErrorType(error);
    this.metrics.errorTypeRetryRates[errorType] = 
      (this.metrics.errorTypeRetryRates[errorType] || 0) + 1;
  }

  private getErrorType(error: Error): string {
    if ('code' in error && error.code) {
      return (error as AgentError).code;
    }

    // Classify by message patterns
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('rate limit')) return 'RATE_LIMIT';
    if (message.includes('network')) return 'NETWORK_ERROR';
    if (message.includes('model')) return 'MODEL_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  private updateMetrics(): void {
    const totalOperations = this.metrics.successfulRetries + this.metrics.failedRetries;
    
    if (totalOperations > 0) {
      this.metrics.averageAttempts = this.metrics.totalRetries / totalOperations;
    }
  }

  private updateAverageSuccessTime(time: number): void {
    const currentAvg = this.metrics.averageSuccessTime;
    const count = this.metrics.successfulRetries;
    
    this.metrics.averageSuccessTime = 
      (currentAvg * (count - 1) + time) / count;
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      averageAttempts: 0,
      averageSuccessTime: 0,
      errorTypeRetryRates: {},
      jitterEffectiveness: 0
    };
  }
}

/**
 * Specialized retry configurations for different scenarios
 */
export const RetryConfigurations = {
  // Quick operations that should retry fast
  FAST: {
    maxAttempts: 3,
    baseDelayMs: 100,
    maxDelayMs: 2000,
    exponentialBase: 2,
    jitterType: 'full' as const,
    deadlineMs: 10000 // 10 seconds
  },

  // Standard operations
  STANDARD: {
    maxAttempts: 5,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    exponentialBase: 2,
    jitterType: 'equal' as const,
    deadlineMs: 300000 // 5 minutes
  },

  // Long-running operations
  LONG_RUNNING: {
    maxAttempts: 10,
    baseDelayMs: 5000,
    maxDelayMs: 120000, // 2 minutes
    exponentialBase: 1.5,
    jitterType: 'decorrelated' as const,
    deadlineMs: 1800000 // 30 minutes
  },

  // Rate limit specific
  RATE_LIMITED: {
    maxAttempts: 8,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    exponentialBase: 1.8,
    jitterType: 'decorrelated' as const,
    retryableErrors: ['RATE_LIMIT', 'TIMEOUT']
  },

  // Network operations
  NETWORK: {
    maxAttempts: 6,
    baseDelayMs: 500,
    maxDelayMs: 15000,
    exponentialBase: 2.5,
    jitterType: 'full' as const,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
  }
};

/**
 * Default retry handler instance
 */
export const defaultRetryHandler = new RetryHandler();

/**
 * Utility function to create a retryable version of any async function
 */
export function retryable<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config?: Partial<RetryConfig>
): (...args: TArgs) => Promise<TReturn> {
  const retryHandler = new RetryHandler(config);
  return retryHandler.wrap(fn, config);
}

/**
 * Utility function for simple retry with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  attempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  const handler = new RetryHandler({
    maxAttempts: attempts,
    baseDelayMs: baseDelay,
    jitterType: 'full'
  });

  return handler.executeWithRetry(operation);
}

/**
 * Utility function to add retry capability to existing promises
 */
export function withRetry<T>(
  promiseFactory: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const handler = new RetryHandler(config);
  return handler.executeWithRetry(promiseFactory);
}

/**
 * Batch retry utility for multiple operations
 */
export async function retryBatch<T>(
  operations: (() => Promise<T>)[],
  config?: Partial<RetryConfig>
): Promise<T[]> {
  const handler = new RetryHandler(config);
  
  const promises = operations.map((operation, index) => 
    handler.executeWithRetry(operation, `batch-${index}`)
  );

  return Promise.all(promises);
}

/**
 * Conditional retry - only retry if condition is met
 */
export async function retryIf<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  config?: Partial<RetryConfig>
): Promise<T> {
  const handler = new RetryHandler({
    ...config,
    onRetry: (attempt, error, delay) => {
      if (!shouldRetry(error, attempt)) {
        throw error;
      }
      config?.onRetry?.(attempt, error, delay);
    }
  });

  return handler.executeWithRetry(operation);
}