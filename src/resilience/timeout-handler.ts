/**
 * Timeout Handler for PrismForge AI Agents
 * Manages agent execution timeouts, cancellation, and resource cleanup
 */

import { AgentType, AgentStatus, AgentError, ErrorCode } from '../types/core.js';

export interface TimeoutConfig {
  defaultTimeout: number;
  hardTimeout: number;
  gracefulShutdownTimeout: number;
  warningThreshold: number;
}

export interface AgentExecution {
  id: string;
  agentType: AgentType;
  startTime: Date;
  timeout: number;
  abortController: AbortController;
  promise: Promise<any>;
  warningTimer?: NodeJS.Timeout;
  timeoutTimer?: NodeJS.Timeout;
  onTimeout?: (execution: AgentExecution) => void;
  onWarning?: (execution: AgentExecution) => void;
  onCancel?: (execution: AgentExecution) => void;
}

export interface TimeoutMetrics {
  totalExecutions: number;
  timeoutCount: number;
  cancelledCount: number;
  averageExecutionTime: number;
  timeoutRate: number;
  agentTimeoutRates: Record<AgentType, number>;
}

export class TimeoutHandler {
  private activeExecutions = new Map<string, AgentExecution>();
  private completedExecutions: AgentExecution[] = [];
  private config: TimeoutConfig;
  private metrics: TimeoutMetrics;

  constructor(config: Partial<TimeoutConfig> = {}) {
    this.config = {
      defaultTimeout: 30000, // 30 seconds
      hardTimeout: 60000,   // 60 seconds hard limit
      gracefulShutdownTimeout: 5000, // 5 seconds for cleanup
      warningThreshold: 0.8, // Warn at 80% of timeout
      ...config
    };

    this.metrics = {
      totalExecutions: 0,
      timeoutCount: 0,
      cancelledCount: 0,
      averageExecutionTime: 0,
      timeoutRate: 0,
      agentTimeoutRates: {
        'CHALLENGE': 0,
        'EVIDENCE': 0,
        'RISK': 0,
        'JUDGE': 0
      }
    };
  }

  /**
   * Start tracking an agent execution with timeout handling
   */
  public startExecution<T>(
    id: string,
    agentType: AgentType,
    promise: Promise<T>,
    timeout?: number
  ): Promise<T> {
    const effectiveTimeout = Math.min(
      timeout || this.config.defaultTimeout,
      this.config.hardTimeout
    );

    const abortController = new AbortController();
    const execution: AgentExecution = {
      id,
      agentType,
      startTime: new Date(),
      timeout: effectiveTimeout,
      abortController,
      promise
    };

    this.activeExecutions.set(id, execution);
    this.metrics.totalExecutions++;

    // Set warning timer
    const warningTime = effectiveTimeout * this.config.warningThreshold;
    execution.warningTimer = setTimeout(() => {
      this.handleWarning(execution);
    }, warningTime);

    // Set timeout timer
    execution.timeoutTimer = setTimeout(() => {
      this.handleTimeout(execution);
    }, effectiveTimeout);

    // Wrap the promise with timeout and cleanup
    return this.wrapPromiseWithTimeout(execution, promise);
  }

  /**
   * Cancel a specific agent execution
   */
  public cancelExecution(id: string, reason?: string): boolean {
    const execution = this.activeExecutions.get(id);
    if (!execution) {
      return false;
    }

    this.cancelExecutionInternal(execution, reason);
    return true;
  }

  /**
   * Cancel all active executions
   */
  public cancelAllExecutions(reason: string = 'System shutdown'): void {
    const executions = Array.from(this.activeExecutions.values());
    
    executions.forEach(execution => {
      this.cancelExecutionInternal(execution, reason);
    });
  }

  /**
   * Get active execution status
   */
  public getActiveExecutions(): AgentExecution[] {
    return Array.from(this.activeExecutions.values()).map(execution => ({
      ...execution,
      // Don't expose internal timers and controllers
      warningTimer: undefined,
      timeoutTimer: undefined,
      abortController: undefined as any,
      promise: undefined as any
    }));
  }

  /**
   * Get execution metrics
   */
  public getMetrics(): TimeoutMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Check if an execution is active
   */
  public isExecutionActive(id: string): boolean {
    return this.activeExecutions.has(id);
  }

  /**
   * Get remaining time for an execution
   */
  public getRemainingTime(id: string): number | null {
    const execution = this.activeExecutions.get(id);
    if (!execution) {
      return null;
    }

    const elapsed = Date.now() - execution.startTime.getTime();
    return Math.max(0, execution.timeout - elapsed);
  }

  /**
   * Create a timeout-aware fetch function
   */
  public createTimeoutAwareFetch(id: string): typeof fetch {
    const execution = this.activeExecutions.get(id);
    if (!execution) {
      throw new Error(`No active execution found for id: ${id}`);
    }

    return (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController();
      
      // Chain abort signals
      execution.abortController.signal.addEventListener('abort', () => {
        controller.abort();
      });

      return fetch(input, {
        ...init,
        signal: controller.signal
      });
    };
  }

  /**
   * Create a timeout error
   */
  public createTimeoutError(execution: AgentExecution): AgentError {
    const elapsed = Date.now() - execution.startTime.getTime();
    
    return {
      code: 'TIMEOUT' as ErrorCode,
      message: `Agent ${execution.agentType} execution timed out after ${elapsed}ms (limit: ${execution.timeout}ms)`,
      details: {
        agentType: execution.agentType,
        executionId: execution.id,
        timeout: execution.timeout,
        elapsed,
        startTime: execution.startTime
      },
      retryable: true,
      timestamp: new Date()
    };
  }

  private wrapPromiseWithTimeout<T>(
    execution: AgentExecution,
    promise: Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let settled = false;

      // Handle promise resolution/rejection
      promise
        .then((result) => {
          if (!settled) {
            settled = true;
            this.handleCompletion(execution, true);
            resolve(result);
          }
        })
        .catch((error) => {
          if (!settled) {
            settled = true;
            this.handleCompletion(execution, false, error);
            reject(error);
          }
        });

      // Handle abort signal
      execution.abortController.signal.addEventListener('abort', () => {
        if (!settled) {
          settled = true;
          const reason = execution.abortController.signal.reason || 'Execution cancelled';
          this.handleCompletion(execution, false, new Error(reason));
          reject(new Error(reason));
        }
      });
    });
  }

  private handleWarning(execution: AgentExecution): void {
    const elapsed = Date.now() - execution.startTime.getTime();
    const remaining = execution.timeout - elapsed;

    console.warn(
      `Agent ${execution.agentType} (${execution.id}) approaching timeout. ` +
      `Elapsed: ${elapsed}ms, Remaining: ${remaining}ms`
    );

    if (execution.onWarning) {
      execution.onWarning(execution);
    }
  }

  private handleTimeout(execution: AgentExecution): void {
    if (!this.activeExecutions.has(execution.id)) {
      return; // Already completed or cancelled
    }

    const elapsed = Date.now() - execution.startTime.getTime();
    
    console.error(
      `Agent ${execution.agentType} (${execution.id}) timed out after ${elapsed}ms`
    );

    this.metrics.timeoutCount++;
    
    // Cancel the execution
    this.cancelExecutionInternal(execution, 'Timeout exceeded');

    if (execution.onTimeout) {
      execution.onTimeout(execution);
    }
  }

  private cancelExecutionInternal(execution: AgentExecution, reason?: string): void {
    // Abort the execution
    execution.abortController.abort(reason);

    // Clear timers
    if (execution.warningTimer) {
      clearTimeout(execution.warningTimer);
    }
    if (execution.timeoutTimer) {
      clearTimeout(execution.timeoutTimer);
    }

    this.metrics.cancelledCount++;

    if (execution.onCancel) {
      execution.onCancel(execution);
    }

    // Move to completed executions for metrics
    this.completedExecutions.push(execution);
    this.activeExecutions.delete(execution.id);

    console.info(
      `Agent ${execution.agentType} (${execution.id}) cancelled: ${reason || 'No reason provided'}`
    );
  }

  private handleCompletion(
    execution: AgentExecution,
    success: boolean,
    error?: Error
  ): void {
    // Clear timers
    if (execution.warningTimer) {
      clearTimeout(execution.warningTimer);
    }
    if (execution.timeoutTimer) {
      clearTimeout(execution.timeoutTimer);
    }

    // Move to completed executions
    this.completedExecutions.push(execution);
    this.activeExecutions.delete(execution.id);

    const elapsed = Date.now() - execution.startTime.getTime();
    
    if (success) {
      console.info(
        `Agent ${execution.agentType} (${execution.id}) completed successfully in ${elapsed}ms`
      );
    } else {
      console.error(
        `Agent ${execution.agentType} (${execution.id}) failed after ${elapsed}ms:`,
        error?.message || 'Unknown error'
      );
    }
  }

  private updateMetrics(): void {
    if (this.completedExecutions.length === 0) {
      return;
    }

    // Calculate average execution time
    const totalTime = this.completedExecutions.reduce((sum, execution) => {
      const duration = execution.startTime ? 
        Date.now() - execution.startTime.getTime() : 0;
      return sum + duration;
    }, 0);

    this.metrics.averageExecutionTime = totalTime / this.completedExecutions.length;

    // Calculate timeout rate
    this.metrics.timeoutRate = this.metrics.timeoutCount / this.metrics.totalExecutions;

    // Calculate per-agent timeout rates
    const agentCounts: Record<AgentType, number> = {
      'CHALLENGE': 0,
      'EVIDENCE': 0,
      'RISK': 0,
      'JUDGE': 0
    };

    const agentTimeouts: Record<AgentType, number> = {
      'CHALLENGE': 0,
      'EVIDENCE': 0,
      'RISK': 0,
      'JUDGE': 0
    };

    this.completedExecutions.forEach(execution => {
      agentCounts[execution.agentType]++;
      // Check if this execution timed out (simplified check)
      if (execution.abortController.signal.aborted) {
        agentTimeouts[execution.agentType]++;
      }
    });

    Object.keys(agentCounts).forEach(agentType => {
      const type = agentType as AgentType;
      const count = agentCounts[type];
      const timeouts = agentTimeouts[type];
      this.metrics.agentTimeoutRates[type] = count > 0 ? timeouts / count : 0;
    });
  }

  /**
   * Reset metrics and completed executions
   */
  public resetMetrics(): void {
    this.completedExecutions = [];
    this.metrics = {
      totalExecutions: 0,
      timeoutCount: 0,
      cancelledCount: 0,
      averageExecutionTime: 0,
      timeoutRate: 0,
      agentTimeoutRates: {
        'CHALLENGE': 0,
        'EVIDENCE': 0,
        'RISK': 0,
        'JUDGE': 0
      }
    };
  }

  /**
   * Graceful shutdown with timeout
   */
  public async gracefulShutdown(): Promise<void> {
    const activeExecutions = Array.from(this.activeExecutions.values());
    
    if (activeExecutions.length === 0) {
      return;
    }

    console.info(`Initiating graceful shutdown for ${activeExecutions.length} active executions`);

    // Give executions a chance to complete
    const shutdownPromise = Promise.allSettled(
      activeExecutions.map(execution => execution.promise)
    );

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('Graceful shutdown timeout exceeded, forcing cancellation');
        this.cancelAllExecutions('Graceful shutdown timeout');
        resolve();
      }, this.config.gracefulShutdownTimeout);
    });

    await Promise.race([shutdownPromise, timeoutPromise]);
    
    console.info('Graceful shutdown completed');
  }
}

/**
 * Default timeout handler instance
 */
export const defaultTimeoutHandler = new TimeoutHandler();

/**
 * Utility function to create a timeout-aware promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Utility function to add timeout to any async function
 */
export function addTimeout<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  timeoutMs: number
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return withTimeout(fn(...args), timeoutMs);
  };
}