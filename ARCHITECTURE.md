# PrismForge AI System Architecture

## System Overview

PrismForge AI is a multi-agent validation platform for M&A due diligence that employs four specialized agents working in concert to validate deal assumptions, identify risks, and provide comprehensive analysis.

## Component Interaction Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Web Interface]
        API[REST API]
        WS[WebSocket]
    end

    subgraph "Orchestration Layer"
        OM[Orchestration Manager]
        SM[State Machine XState]
        QM[Queue Manager]
    end

    subgraph "Agent Layer"
        CA[Challenge Agent]
        EA[Evidence Agent]
        RA[Risk Agent]
        JA[Judge Agent]
    end

    subgraph "Data Processing"
        PP[Preprocessing Haiku 3.5]
        DocParser[Document Parser]
        PE[Prompt Engine]
    end

    subgraph "Storage Layer"
        Redis[(Redis Cache)]
        Postgres[(PostgreSQL)]
        Memory[(Memory Cache)]
    end

    subgraph "External Services"
        LLM[LLM Services]
        FileStore[File Storage]
        KB[Knowledge Base]
    end

    UI --> API
    API --> OM
    WS --> OM
    OM --> SM
    SM --> QM
    QM --> CA
    QM --> EA
    QM --> RA
    QM --> JA

    CA --> PP
    EA --> PP
    RA --> PP
    JA --> PP

    PP --> DocParser
    DocParser --> PE
    PE --> LLM

    OM --> Redis
    OM --> Postgres
    OM --> Memory

    CA --> KB
    EA --> KB
    RA --> KB
    JA --> KB

    LLM --> FileStore
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant Orchestrator
    participant Challenge
    participant Evidence
    participant Risk
    participant Judge
    participant Cache

    Client->>Orchestrator: Submit Document
    Orchestrator->>Cache: Check Semantic Cache
    
    alt Cache Hit
        Cache-->>Orchestrator: Return Cached Result
        Orchestrator-->>Client: Return Analysis
    else Cache Miss
        Orchestrator->>Challenge: Analyze Assumptions
        Orchestrator->>Evidence: Validate Claims
        Orchestrator->>Risk: Identify Risks
        
        Challenge-->>Orchestrator: Challenge Results
        Evidence-->>Orchestrator: Evidence Results
        Risk-->>Orchestrator: Risk Results
        
        Orchestrator->>Judge: Synthesize Results
        Judge-->>Orchestrator: Final Analysis
        
        Orchestrator->>Cache: Store Results
        Orchestrator-->>Client: Return Analysis
    end
```

## Error Handling Decision Tree

```mermaid
flowchart TD
    Start([Request Received]) --> Parse{Parse Document}
    Parse -->|Success| Route[Route to Agents]
    Parse -->|Failure| ParseError[Parse Error Handler]
    
    Route --> Parallel{Run Agents in Parallel}
    
    Parallel --> CheckResults{Check Agent Results}
    CheckResults -->|All Success| Judge[Judge Agent]
    CheckResults -->|Partial Success| PartialAgg[Partial Aggregation]
    CheckResults -->|All Failed| Fallback[Fallback Strategy]
    
    Judge --> Consensus{Check Consensus}
    Consensus -->|>50% Agreement| Success[Return Results]
    Consensus -->|<50% Agreement| SecondRound[Second Round]
    
    SecondRound --> RefinedPrompts[Refined Prompts]
    RefinedPrompts --> Parallel
    
    PartialAgg --> PartialResults[Return Partial Results]
    Fallback --> BasicAnalysis[Basic Analysis Mode]
    
    ParseError --> RetryParse{Retry Count < 3}
    RetryParse -->|Yes| ParseRetry[Exponential Backoff]
    RetryParse -->|No| ParseFailed[Parse Failed Response]
    
    ParseRetry --> Parse
    
    Success --> CacheResults[Cache Results]
    PartialResults --> CacheResults
    BasicAnalysis --> CacheResults
    
    CacheResults --> End([Return to Client])
    ParseFailed --> End
```

## Caching Strategy (3-Layer)

```mermaid
graph LR
    subgraph "Layer 1: Memory Cache"
        MC[Active Session Data]
        MC_TTL[TTL: 1 hour]
    end
    
    subgraph "Layer 2: Redis Cache"
        RC[Semantic Similarity]
        RC_TTL[TTL: 24 hours]
        RC_Key[Vector Hash Keys]
    end
    
    subgraph "Layer 3: PostgreSQL"
        PG[Analysis Results]
        PG_Index[Indexed by Document Hash]
        PG_TTL[TTL: 30 days]
    end
    
    Request --> MC
    MC -->|Miss| RC
    RC -->|Miss| PG
    PG -->|Miss| Compute[Generate New Analysis]
    
    Compute --> Store_PG[Store in PostgreSQL]
    Store_PG --> Store_RC[Store in Redis]
    Store_RC --> Store_MC[Store in Memory]
```

## State Management with XState

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Preprocessing : document_received
    
    Preprocessing --> AgentExecution : preprocessing_complete
    Preprocessing --> Error : preprocessing_failed
    
    AgentExecution --> [*] : all_agents_complete
    AgentExecution --> PartialResults : some_agents_failed
    AgentExecution --> Error : all_agents_failed
    
    state AgentExecution {
        [*] --> ChallengeAgent
        [*] --> EvidenceAgent
        [*] --> RiskAgent
        
        ChallengeAgent --> Completed : success
        ChallengeAgent --> Failed : timeout/error
        
        EvidenceAgent --> Completed : success
        EvidenceAgent --> Failed : timeout/error
        
        RiskAgent --> Completed : success
        RiskAgent --> Failed : timeout/error
        
        Completed --> JudgeAgent : all_complete
        Failed --> JudgeAgent : partial_complete
        
        JudgeAgent --> ConsensusCheck : judgment_complete
        
        ConsensusCheck --> SecondRound : low_consensus
        ConsensusCheck --> FinalResults : high_consensus
        
        SecondRound --> ChallengeAgent : refined_prompts
        SecondRound --> EvidenceAgent : refined_prompts
        SecondRound --> RiskAgent : refined_prompts
        
        FinalResults --> [*]
    }
    
    PartialResults --> [*] : return_partial
    Error --> [*] : return_error
```

## Performance Requirements

- **Agent Timeout**: 30-second hard limit per agent
- **Total Analysis Time**: <2 minutes for standard documents
- **Concurrent Sessions**: Support 100+ simultaneous analyses
- **Cache Hit Rate**: >80% for semantic similarity
- **Availability**: 99.9% uptime

## Security Considerations

- Document encryption at rest and in transit
- Agent isolation with sandboxed execution
- Rate limiting per client/API key
- Audit logging for all analyses
- PII detection and redaction

## Scalability Design

- Horizontal scaling of agent workers
- Redis Cluster for distributed caching
- PostgreSQL read replicas
- Load balancing with session affinity
- Auto-scaling based on queue depth