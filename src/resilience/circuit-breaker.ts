/**
 * Circuit Breaker Pattern Implementation for PrismForge AI
 * Protects external service calls and prevents cascade failures
 */

import { AgentError, ErrorCode } from '../types/core.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  monitoringWindowMs: number;
  successThreshold: number;
  volumeThreshold: number;
  errorThresholdPercentage: number;
  slowCallDurationThreshold?: number;
  slowCallRateThreshold?: number;
  maxConcurrentCalls?: number;
  onStateChange?: (oldState: CircuitState, newState: CircuitState, metrics: CircuitMetrics) => void;
  onCallSuccess?: (duration: number) => void;
  onCallFailure?: (error: Error, duration: number) => void;
  onCallRejected?: (reason: string) => void;
}

export interface CircuitMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  slowCalls: number;
  averageResponseTime: number;
  errorRate: number;
  slowCallRate: number;
  concurrentCalls: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  stateChanges: number;
  currentStreak: number; // Success or failure streak
}

export interface CallResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  duration: number;
  timestamp: Date;
  state: CircuitState;
}

export interface CircuitBreakerState {
  state: CircuitState;
  metrics: CircuitMetrics;
  failureCount: number;
  successCount: number;
  lastStateChange: Date;
  nextAttemptTime?: Date;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private callHistory: CallResult<any>[] = [];
  private activeCalls = new Set<string>();

  constructor(
    private name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeoutMs: 60000, // 1 minute
      monitoringWindowMs: 300000, // 5 minutes
      successThreshold: 3,
      volumeThreshold: 10,
      errorThresholdPercentage: 50,
      slowCallDurationThreshold: 10000, // 10 seconds
      slowCallRateThreshold: 50, // 50%
      maxConcurrentCalls: 100,
      ...config
    };

    this.state = {
      state: 'CLOSED',
      metrics: this.createEmptyMetrics(),
      failureCount: 0,
      successCount: 0,
      lastStateChange: new Date()
    };

    console.info(`Circuit breaker '${this.name}' initialized in CLOSED state`);
  }

  /**
   * Execute a function through the circuit breaker
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    const callId = `call-${Date.now()}-${Math.random()}`;
    
    // Check if call should be rejected
    const rejectionReason = this.shouldRejectCall();
    if (rejectionReason) {
      this.recordRejectedCall(rejectionReason);
      throw new Error(`Circuit breaker '${this.name}' rejected call: ${rejectionReason}`);
    }

    // Track concurrent calls
    this.activeCalls.add(callId);
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.recordSuccessfulCall(duration);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordFailedCall(error as Error, duration);
      throw error;
      
    } finally {
      this.activeCalls.delete(callId);
    }
  }

  /**
   * Get current state of the circuit breaker
   */
  public getState(): CircuitBreakerState {
    this.updateMetrics();
    return { ...this.state };
  }

  /**
   * Get current metrics
   */
  public getMetrics(): CircuitMetrics {
    this.updateMetrics();
    return { ...this.state.metrics };
  }

  /**
   * Force the circuit breaker to a specific state
   */
  public forceState(newState: CircuitState, reason: string = 'Manual override'): void {
    const oldState = this.state.state;
    this.changeState(newState);
    
    console.warn(
      `Circuit breaker '${this.name}' force changed from ${oldState} to ${newState}: ${reason}`
    );
  }

  /**
   * Reset the circuit breaker to initial state
   */
  public reset(): void {
    const oldState = this.state.state;
    
    this.state = {
      state: 'CLOSED',
      metrics: this.createEmptyMetrics(),
      failureCount: 0,
      successCount: 0,
      lastStateChange: new Date()
    };
    
    this.callHistory = [];
    this.activeCalls.clear();
    
    console.info(`Circuit breaker '${this.name}' reset from ${oldState} to CLOSED`);
  }

  /**
   * Check if the circuit breaker is healthy
   */
  public isHealthy(): boolean {
    this.updateMetrics();
    
    const metrics = this.state.metrics;
    const config = this.config;
    
    // Circuit is healthy if:
    // 1. It's closed or half-open with good metrics
    // 2. Error rate is below threshold
    // 3. Slow call rate is below threshold (if configured)
    
    if (this.state.state === 'OPEN') {
      return false;
    }
    
    if (metrics.totalCalls < config.volumeThreshold) {
      return true; // Not enough data to determine health
    }
    
    const errorRateOk = metrics.errorRate <= config.errorThresholdPercentage;
    const slowCallRateOk = !config.slowCallRateThreshold || 
      metrics.slowCallRate <= config.slowCallRateThreshold;
    
    return errorRateOk && slowCallRateOk;
  }

  /**
   * Get call history for analysis
   */
  public getCallHistory(limit?: number): CallResult<any>[] {
    const history = [...this.callHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Create a circuit breaker wrapper for any async function
   */
  public wrap<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
      return this.execute(() => fn(...args));
    };
  }

  private shouldRejectCall(): string | null {
    // Check if circuit is open
    if (this.state.state === 'OPEN') {
      // Check if recovery timeout has passed
      if (this.state.nextAttemptTime && new Date() < this.state.nextAttemptTime) {
        return 'Circuit is OPEN and recovery timeout not reached';
      } else {
        // Transition to HALF_OPEN for testing
        this.changeState('HALF_OPEN');
        return null; // Allow this call to proceed
      }
    }

    // Check concurrent call limit
    if (this.config.maxConcurrentCalls && 
        this.activeCalls.size >= this.config.maxConcurrentCalls) {
      return `Too many concurrent calls: ${this.activeCalls.size}/${this.config.maxConcurrentCalls}`;
    }

    return null;
  }

  private recordSuccessfulCall(duration: number): void {
    const callResult: CallResult<void> = {
      success: true,
      duration,
      timestamp: new Date(),
      state: this.state.state
    };

    this.addToHistory(callResult);
    this.state.successCount++;
    this.state.metrics.currentStreak = this.state.state === 'CLOSED' ? 
      this.state.metrics.currentStreak + 1 : 1;

    // Check for slow calls
    if (this.config.slowCallDurationThreshold && 
        duration > this.config.slowCallDurationThreshold) {
      this.state.metrics.slowCalls++;
    }

    // Update last success time
    this.state.metrics.lastSuccessTime = new Date();

    // Handle state transitions based on success
    this.handleSuccessfulCall();

    // Call success callback
    if (this.config.onCallSuccess) {
      this.config.onCallSuccess(duration);
    }

    console.debug(
      `Circuit breaker '${this.name}' recorded successful call (${duration}ms) in ${this.state.state} state`
    );
  }

  private recordFailedCall(error: Error, duration: number): void {
    const callResult: CallResult<void> = {
      success: false,
      error,
      duration,
      timestamp: new Date(),
      state: this.state.state
    };

    this.addToHistory(callResult);
    this.state.failureCount++;
    this.state.metrics.currentStreak = this.state.state === 'CLOSED' ? 
      this.state.metrics.currentStreak + 1 : 1;

    // Update last failure time
    this.state.metrics.lastFailureTime = new Date();

    // Handle state transitions based on failure
    this.handleFailedCall();

    // Call failure callback
    if (this.config.onCallFailure) {
      this.config.onCallFailure(error, duration);
    }

    console.warn(
      `Circuit breaker '${this.name}' recorded failed call (${duration}ms) in ${this.state.state} state:`,
      error.message
    );
  }

  private recordRejectedCall(reason: string): void {
    this.state.metrics.rejectedCalls++;
    
    // Call rejected callback
    if (this.config.onCallRejected) {
      this.config.onCallRejected(reason);
    }

    console.warn(`Circuit breaker '${this.name}' rejected call: ${reason}`);
  }

  private handleSuccessfulCall(): void {
    switch (this.state.state) {
      case 'HALF_OPEN':
        // If we have enough successful calls, close the circuit
        if (this.state.successCount >= this.config.successThreshold) {
          this.changeState('CLOSED');
          this.state.failureCount = 0; // Reset failure count
        }
        break;
        
      case 'OPEN':
        // This shouldn't happen, but if it does, transition to HALF_OPEN
        this.changeState('HALF_OPEN');
        break;
        
      case 'CLOSED':
        // Reset failure count on success in closed state
        if (this.state.failureCount > 0) {
          this.state.failureCount = Math.max(0, this.state.failureCount - 1);
        }
        break;
    }
  }

  private handleFailedCall(): void {
    switch (this.state.state) {
      case 'CLOSED':
        // Check if we should open the circuit
        if (this.shouldOpenCircuit()) {
          this.changeState('OPEN');
        }
        break;
        
      case 'HALF_OPEN':
        // Any failure in HALF_OPEN should open the circuit
        this.changeState('OPEN');
        break;
        
      case 'OPEN':
        // Reset the recovery timeout
        this.state.nextAttemptTime = new Date(
          Date.now() + this.config.recoveryTimeoutMs
        );
        break;
    }
  }

  private shouldOpenCircuit(): boolean {
    this.updateMetrics();
    
    const metrics = this.state.metrics;
    const config = this.config;
    
    // Don't open if we don't have enough volume
    if (metrics.totalCalls < config.volumeThreshold) {
      return false;
    }
    
    // Check failure threshold
    if (this.state.failureCount >= config.failureThreshold) {
      return true;
    }
    
    // Check error rate threshold
    if (metrics.errorRate >= config.errorThresholdPercentage) {
      return true;
    }
    
    // Check slow call rate (if configured)
    if (config.slowCallRateThreshold && 
        metrics.slowCallRate >= config.slowCallRateThreshold) {
      return true;
    }
    
    return false;
  }

  private changeState(newState: CircuitState): void {
    const oldState = this.state.state;
    
    if (oldState === newState) {
      return;
    }
    
    this.state.state = newState;
    this.state.lastStateChange = new Date();
    this.state.metrics.stateChanges++;
    
    // Set recovery timeout for OPEN state
    if (newState === 'OPEN') {
      this.state.nextAttemptTime = new Date(
        Date.now() + this.config.recoveryTimeoutMs
      );
      this.state.successCount = 0; // Reset success count
    }
    
    // Reset success count for CLOSED state
    if (newState === 'CLOSED') {
      this.state.successCount = 0;
      this.state.nextAttemptTime = undefined;
    }
    
    console.info(
      `Circuit breaker '${this.name}' state changed: ${oldState} -> ${newState}`
    );
    
    // Call state change callback
    if (this.config.onStateChange) {
      this.config.onStateChange(oldState, newState, this.getMetrics());
    }
  }

  private addToHistory(result: CallResult<any>): void {
    this.callHistory.push(result);
    
    // Keep only recent history (last 1000 calls)
    if (this.callHistory.length > 1000) {
      this.callHistory = this.callHistory.slice(-1000);
    }
  }

  private updateMetrics(): void {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.monitoringWindowMs);
    
    // Filter calls within the monitoring window
    const recentCalls = this.callHistory.filter(
      call => call.timestamp >= windowStart
    );
    
    const totalCalls = recentCalls.length;
    const successfulCalls = recentCalls.filter(call => call.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const slowCalls = recentCalls.filter(call => 
      this.config.slowCallDurationThreshold && 
      call.duration > this.config.slowCallDurationThreshold
    ).length;
    
    // Calculate average response time
    const totalDuration = recentCalls.reduce((sum, call) => sum + call.duration, 0);
    const averageResponseTime = totalCalls > 0 ? totalDuration / totalCalls : 0;
    
    // Calculate rates
    const errorRate = totalCalls > 0 ? (failedCalls / totalCalls) * 100 : 0;
    const slowCallRate = totalCalls > 0 ? (slowCalls / totalCalls) * 100 : 0;
    
    this.state.metrics = {
      totalCalls,
      successfulCalls,
      failedCalls,
      rejectedCalls: this.state.metrics.rejectedCalls, // Keep cumulative count
      slowCalls,
      averageResponseTime,
      errorRate,
      slowCallRate,
      concurrentCalls: this.activeCalls.size,
      lastFailureTime: this.state.metrics.lastFailureTime,
      lastSuccessTime: this.state.metrics.lastSuccessTime,
      stateChanges: this.state.metrics.stateChanges,
      currentStreak: this.state.metrics.currentStreak
    };
  }

  private createEmptyMetrics(): CircuitMetrics {
    return {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      slowCalls: 0,
      averageResponseTime: 0,
      errorRate: 0,
      slowCallRate: 0,
      concurrentCalls: 0,
      stateChanges: 0,
      currentStreak: 0
    };
  }
}

/**
 * Circuit Breaker Manager for handling multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>();
  private defaultConfig: Partial<CircuitBreakerConfig>;

  constructor(defaultConfig: Partial<CircuitBreakerConfig> = {}) {
    this.defaultConfig = defaultConfig;
  }

  /**
   * Get or create a circuit breaker
   */
  public getBreaker(
    name: string, 
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const effectiveConfig = { ...this.defaultConfig, ...config };
      this.breakers.set(name, new CircuitBreaker(name, effectiveConfig));
    }
    
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers
   */
  public getAllBreakers(): Record<string, CircuitBreaker> {
    const result: Record<string, CircuitBreaker> = {};
    this.breakers.forEach((breaker, name) => {
      result[name] = breaker;
    });
    return result;
  }

  /**
   * Get health status of all circuit breakers
   */
  public getHealthStatus(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    this.breakers.forEach((breaker, name) => {
      result[name] = breaker.isHealthy();
    });
    return result;
  }

  /**
   * Reset all circuit breakers
   */
  public resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }

  /**
   * Remove a circuit breaker
   */
  public removeBreaker(name: string): boolean {
    return this.breakers.delete(name);
  }
}

/**
 * Default circuit breaker manager instance
 */
export const defaultCircuitBreakerManager = new CircuitBreakerManager({
  failureThreshold: 5,
  recoveryTimeoutMs: 60000,
  monitoringWindowMs: 300000,
  successThreshold: 3,
  volumeThreshold: 10,
  errorThresholdPercentage: 50
});

/**
 * Predefined circuit breaker configurations for different services
 */
export const CircuitBreakerConfigurations = {
  // Fast external API calls
  FAST_API: {
    failureThreshold: 3,
    recoveryTimeoutMs: 30000,
    monitoringWindowMs: 120000,
    successThreshold: 2,
    volumeThreshold: 5,
    errorThresholdPercentage: 40,
    slowCallDurationThreshold: 2000,
    slowCallRateThreshold: 30
  },

  // LLM API calls
  LLM_API: {
    failureThreshold: 5,
    recoveryTimeoutMs: 120000, // 2 minutes
    monitoringWindowMs: 600000, // 10 minutes
    successThreshold: 3,
    volumeThreshold: 10,
    errorThresholdPercentage: 60,
    slowCallDurationThreshold: 30000, // 30 seconds
    slowCallRateThreshold: 40,
    maxConcurrentCalls: 50
  },

  // Database operations
  DATABASE: {
    failureThreshold: 8,
    recoveryTimeoutMs: 60000,
    monitoringWindowMs: 300000,
    successThreshold: 5,
    volumeThreshold: 20,
    errorThresholdPercentage: 30,
    slowCallDurationThreshold: 5000,
    slowCallRateThreshold: 20
  },

  // File storage operations
  FILE_STORAGE: {
    failureThreshold: 4,
    recoveryTimeoutMs: 90000,
    monitoringWindowMs: 300000,
    successThreshold: 3,
    volumeThreshold: 8,
    errorThresholdPercentage: 50,
    slowCallDurationThreshold: 10000,
    slowCallRateThreshold: 35
  }
};

/**
 * Utility function to create a circuit breaker for a specific service
 */
export function createServiceCircuitBreaker(
  serviceName: string,
  serviceType: keyof typeof CircuitBreakerConfigurations,
  customConfig?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  const config = {
    ...CircuitBreakerConfigurations[serviceType],
    ...customConfig
  };
  
  return new CircuitBreaker(serviceName, config);
}

/**
 * Utility function to wrap any function with a circuit breaker
 */
export function withCircuitBreaker<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  breakerName: string,
  config?: Partial<CircuitBreakerConfig>
): (...args: TArgs) => Promise<TReturn> {
  const breaker = defaultCircuitBreakerManager.getBreaker(breakerName, config);
  return breaker.wrap(fn);
}