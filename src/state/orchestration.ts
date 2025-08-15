/**
 * XState-based orchestration for PrismForge AI multi-agent validation platform
 * Manages the complete lifecycle of M&A due diligence analysis
 */

import { createMachine, assign, interpret, ActorRefFrom } from 'xstate';
import { AgentType, AgentResult, ValidationResult, ValidationStatus, Document, AnalysisRequest, ConsensusResult, FinalAnalysis, AgentError, ErrorCode } from '../types/core';

export interface OrchestrationContext {
  request: AnalysisRequest;
  document: Document;
  agentResults: AgentResult[];
  consensus?: ConsensusResult;
  finalAnalysis?: FinalAnalysis;
  errors: AgentError[];
  retryCount: number;
  startTime: Date;
  timeoutId?: NodeJS.Timeout;
}

export type OrchestrationEvent =
  | { type: 'START_ANALYSIS'; request: AnalysisRequest; document: Document }
  | { type: 'PREPROCESSING_COMPLETE' }
  | { type: 'PREPROCESSING_FAILED'; error: AgentError }
  | { type: 'AGENT_COMPLETED'; result: AgentResult }
  | { type: 'AGENT_FAILED'; error: AgentError }
  | { type: 'ALL_AGENTS_COMPLETE' }
  | { type: 'SOME_AGENTS_FAILED' }
  | { type: 'ALL_AGENTS_FAILED' }
  | { type: 'CONSENSUS_ACHIEVED'; consensus: ConsensusResult }
  | { type: 'CONSENSUS_FAILED'; consensus: ConsensusResult }
  | { type: 'JUDGE_COMPLETE'; finalAnalysis: FinalAnalysis }
  | { type: 'SECOND_ROUND_NEEDED' }
  | { type: 'TIMEOUT' }
  | { type: 'CANCEL' }
  | { type: 'RETRY' };

/**
 * Main orchestration state machine for PrismForge AI
 * Manages the complete validation workflow with error handling and fallbacks
 */
export const orchestrationMachine = createMachine({
  id: 'prismforge-orchestration',
  initial: 'idle',
  context: {
    request: null,
    document: null,
    agentResults: [],
    consensus: null,
    finalAnalysis: null,
    errors: [],
    retryCount: 0,
    startTime: new Date(),
    timeoutId: null,
  } as OrchestrationContext,
  
  states: {
    idle: {
      on: {
        START_ANALYSIS: {
          target: 'preprocessing',
          actions: assign({
            request: ({ event }) => event.request,
            document: ({ event }) => event.document,
            startTime: () => new Date(),
            agentResults: [],
            errors: [],
            retryCount: 0,
          }),
        },
      },
    },

    preprocessing: {
      entry: ['startTimeout', 'invokePreprocessing'],
      exit: ['clearTimeout'],
      on: {
        PREPROCESSING_COMPLETE: 'agentExecution',
        PREPROCESSING_FAILED: 'error',
        TIMEOUT: 'error',
        CANCEL: 'cancelled',
      },
    },

    agentExecution: {
      type: 'parallel',
      states: {
        challengeAgent: {
          initial: 'pending',
          states: {
            pending: {
              entry: 'invokeChallengeAgent',
              on: {
                AGENT_COMPLETED: {
                  target: 'completed',
                  cond: ({ event }) => event.result.agentType === 'CHALLENGE',
                  actions: assign({
                    agentResults: ({ context, event }) => [...context.agentResults, event.result],
                  }),
                },
                AGENT_FAILED: {
                  target: 'failed',
                  cond: ({ event }) => event.error.code !== 'TIMEOUT',
                  actions: assign({
                    errors: ({ context, event }) => [...context.errors, event.error],
                  }),
                },
                TIMEOUT: 'failed',
              },
            },
            completed: { type: 'final' },
            failed: { type: 'final' },
          },
        },

        evidenceAgent: {
          initial: 'pending',
          states: {
            pending: {
              entry: 'invokeEvidenceAgent',
              on: {
                AGENT_COMPLETED: {
                  target: 'completed',
                  cond: ({ event }) => event.result.agentType === 'EVIDENCE',
                  actions: assign({
                    agentResults: ({ context, event }) => [...context.agentResults, event.result],
                  }),
                },
                AGENT_FAILED: {
                  target: 'failed',
                  cond: ({ event }) => event.error.code !== 'TIMEOUT',
                  actions: assign({
                    errors: ({ context, event }) => [...context.errors, event.error],
                  }),
                },
                TIMEOUT: 'failed',
              },
            },
            completed: { type: 'final' },
            failed: { type: 'final' },
          },
        },

        riskAgent: {
          initial: 'pending',
          states: {
            pending: {
              entry: 'invokeRiskAgent',
              on: {
                AGENT_COMPLETED: {
                  target: 'completed',
                  cond: ({ event }) => event.result.agentType === 'RISK',
                  actions: assign({
                    agentResults: ({ context, event }) => [...context.agentResults, event.result],
                  }),
                },
                AGENT_FAILED: {
                  target: 'failed',
                  cond: ({ event }) => event.error.code !== 'TIMEOUT',
                  actions: assign({
                    errors: ({ context, event }) => [...context.errors, event.error],
                  }),
                },
                TIMEOUT: 'failed',
              },
            },
            completed: { type: 'final' },
            failed: { type: 'final' },
          },
        },
      },
      
      onDone: [
        {
          target: 'judgeAgent',
          cond: ({ context }) => {
            const completedAgents = context.agentResults.filter(r => r.status === 'COMPLETED');
            return completedAgents.length >= 2; // Minimum 2 agents for valid analysis
          },
        },
        {
          target: 'partialResults',
          cond: ({ context }) => {
            const completedAgents = context.agentResults.filter(r => r.status === 'COMPLETED');
            return completedAgents.length === 1;
          },
        },
        {
          target: 'fallback',
          cond: ({ context }) => {
            const completedAgents = context.agentResults.filter(r => r.status === 'COMPLETED');
            return completedAgents.length === 0;
          },
        },
      ],
      
      on: {
        TIMEOUT: 'error',
        CANCEL: 'cancelled',
      },
    },

    judgeAgent: {
      entry: ['invokeJudgeAgent'],
      on: {
        JUDGE_COMPLETE: {
          target: 'consensusCheck',
          actions: assign({
            finalAnalysis: ({ event }) => event.finalAnalysis,
          }),
        },
        AGENT_FAILED: 'partialResults',
        TIMEOUT: 'error',
        CANCEL: 'cancelled',
      },
    },

    consensusCheck: {
      entry: ['calculateConsensus'],
      always: [
        {
          target: 'completed',
          cond: ({ context }) => context.consensus && context.consensus.level >= 0.7,
          actions: assign({
            consensus: ({ context }) => context.consensus,
          }),
        },
        {
          target: 'secondRound',
          cond: ({ context }) => 
            context.consensus && 
            context.consensus.level < 0.7 && 
            context.retryCount < 1 &&
            context.request.configuration.enableSecondRound,
        },
        {
          target: 'partialResults',
        },
      ],
    },

    secondRound: {
      entry: assign({
        retryCount: ({ context }) => context.retryCount + 1,
        agentResults: [],
      }),
      always: {
        target: 'agentExecution',
        actions: ['generateRefinedPrompts'],
      },
    },

    partialResults: {
      entry: ['generatePartialAnalysis'],
      always: 'completed',
    },

    fallback: {
      entry: ['generateFallbackAnalysis'],
      always: 'completed',
    },

    completed: {
      type: 'final',
      entry: ['finalizeResults', 'cacheResults', 'publishMetrics'],
    },

    error: {
      type: 'final',
      entry: ['handleError', 'publishErrorMetrics'],
    },

    cancelled: {
      type: 'final',
      entry: ['cleanup'],
    },
  },
}, {
  actions: {
    startTimeout: assign({
      timeoutId: ({ context }) => setTimeout(() => {
        // Send TIMEOUT event
      }, context.request?.timeout || 120000),
    }),

    clearTimeout: ({ context }) => {
      if (context.timeoutId) {
        clearTimeout(context.timeoutId);
      }
    },

    invokePreprocessing: ({ context }) => {
      // Invoke Haiku 3.5 preprocessing
    },

    invokeChallengeAgent: ({ context }) => {
      // Invoke Challenge Agent
    },

    invokeEvidenceAgent: ({ context }) => {
      // Invoke Evidence Agent
    },

    invokeRiskAgent: ({ context }) => {
      // Invoke Risk Agent
    },

    invokeJudgeAgent: ({ context }) => {
      // Invoke Judge Agent with all previous results
    },

    calculateConsensus: assign({
      consensus: ({ context }) => {
        // Calculate consensus from agent results
        return {
          level: 0.8, // Example
          agreement: [],
          conflicts: [],
          requiresSecondRound: false,
        } as ConsensusResult;
      },
    }),

    generateRefinedPrompts: ({ context }) => {
      // Generate refined prompts based on conflicts
    },

    generatePartialAnalysis: assign({
      finalAnalysis: ({ context }) => {
        // Generate analysis from partial results
        return {} as FinalAnalysis;
      },
    }),

    generateFallbackAnalysis: assign({
      finalAnalysis: ({ context }) => {
        // Generate basic analysis as fallback
        return {} as FinalAnalysis;
      },
    }),

    finalizeResults: ({ context }) => {
      // Finalize and prepare results for return
    },

    cacheResults: ({ context }) => {
      // Cache results in Redis and PostgreSQL
    },

    publishMetrics: ({ context }) => {
      // Publish performance metrics
    },

    handleError: ({ context }) => {
      // Handle and log errors
    },

    publishErrorMetrics: ({ context }) => {
      // Publish error metrics
    },

    cleanup: ({ context }) => {
      // Clean up resources
    },
  },

  guards: {
    hasMinimumAgents: ({ context }) => {
      const completed = context.agentResults.filter(r => r.status === 'COMPLETED');
      return completed.length >= 2;
    },

    consensusAchieved: ({ context }) => {
      return context.consensus && context.consensus.level >= 0.7;
    },

    canRetry: ({ context }) => {
      return context.retryCount < context.request.configuration.maxRetries;
    },
  },
});

/**
 * Orchestration service that manages the state machine
 */
export class OrchestrationService {
  private actor: ActorRefFrom<typeof orchestrationMachine>;

  constructor() {
    this.actor = interpret(orchestrationMachine);
  }

  /**
   * Start the orchestration service
   */
  start(): void {
    this.actor.start();
  }

  /**
   * Stop the orchestration service
   */
  stop(): void {
    this.actor.stop();
  }

  /**
   * Start a new analysis
   */
  async startAnalysis(request: AnalysisRequest, document: Document): Promise<ValidationResult> {
    return new Promise((resolve, reject) => {
      this.actor.send({
        type: 'START_ANALYSIS',
        request,
        document,
      });

      // Subscribe to state changes
      this.actor.subscribe((state) => {
        if (state.matches('completed')) {
          const result: ValidationResult = {
            id: request.id,
            documentId: document.id,
            agentResults: state.context.agentResults,
            consensus: state.context.consensus!,
            finalAnalysis: state.context.finalAnalysis!,
            status: 'COMPLETED',
            createdAt: state.context.startTime,
            completedAt: new Date(),
          };
          resolve(result);
        } else if (state.matches('error')) {
          reject(new Error('Analysis failed'));
        } else if (state.matches('cancelled')) {
          reject(new Error('Analysis cancelled'));
        }
      });
    });
  }

  /**
   * Cancel an ongoing analysis
   */
  cancel(): void {
    this.actor.send({ type: 'CANCEL' });
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return this.actor.getSnapshot();
  }

  /**
   * Get orchestration metrics
   */
  getMetrics() {
    const state = this.actor.getSnapshot();
    return {
      currentState: state.value,
      context: state.context,
      uptime: Date.now() - state.context.startTime.getTime(),
    };
  }
}

/**
 * Caching strategy implementation for multi-layer caching
 */
export interface CacheLayer {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryCache implements CacheLayer {
  private cache = new Map<string, { value: any; expires: number }>();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: any, ttl = 3600000): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

export class ThreeLayerCache {
  constructor(
    private memoryCache: CacheLayer,
    private redisCache: CacheLayer,
    private postgresCache: CacheLayer
  ) {}

  async get(key: string): Promise<any> {
    // Layer 1: Memory cache
    let result = await this.memoryCache.get(key);
    if (result) return result;

    // Layer 2: Redis cache
    result = await this.redisCache.get(key);
    if (result) {
      await this.memoryCache.set(key, result, 3600000); // 1 hour
      return result;
    }

    // Layer 3: PostgreSQL
    result = await this.postgresCache.get(key);
    if (result) {
      await this.redisCache.set(key, result, 86400000); // 24 hours
      await this.memoryCache.set(key, result, 3600000); // 1 hour
      return result;
    }

    return null;
  }

  async set(key: string, value: any): Promise<void> {
    // Store in all layers
    await Promise.all([
      this.memoryCache.set(key, value, 3600000), // 1 hour
      this.redisCache.set(key, value, 86400000), // 24 hours
      this.postgresCache.set(key, value, 2592000000), // 30 days
    ]);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.memoryCache.delete(key),
      this.redisCache.delete(key),
      this.postgresCache.delete(key),
    ]);
  }
}

export default orchestrationMachine;