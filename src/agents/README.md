# PrismForge AI Agent System

## Overview

The PrismForge AI agent system implements a sophisticated 4-agent validation framework for M&A due diligence, designed to replicate the decision-making patterns of top-tier advisory professionals. Each agent embodies distinct expertise areas and cognitive styles, working together to provide comprehensive transaction analysis.

## Agent Architecture

### Core Agents

#### 1. Challenge Agent (30% Weight)
**Archetype**: McKinsey Principal - The Devil's Advocate  
**Personality**: Dr. Alexandra Cross

- **Primary Role**: Questions assumptions and identifies strategic gaps
- **Cognitive Style**: Critical skeptical thinking with anomaly detection focus
- **Key Behaviors**:
  - Challenges optimistic financial projections with market reality checks
  - Demands rigorous validation of strategic rationale and synergy estimates
  - Applies red team analysis to identify potential blind spots
  - Tests assumptions against historical precedents and market dynamics

- **Expertise Domains**: Strategic analysis, market dynamics, competitive assessment
- **Decision Framework**: Cost-benefit analysis with worst-case scenario planning
- **Bias Profile**: Inverted confirmation bias (seeks contradictory evidence), pessimism bias

#### 2. Evidence Agent (40% Weight)
**Archetype**: Big 4 Senior Manager - The Forensic Auditor  
**Personality**: Marcus Chen

- **Primary Role**: Validates claims against data and documentation
- **Cognitive Style**: Analytical systematic approach with detail orientation
- **Key Behaviors**:
  - Demands supporting documentation for all management assertions
  - Performs forensic analysis using Benford's Law and quality of earnings assessments
  - Cross-validates data sources and ensures information integrity
  - Applies Big 4 auditing standards to all evidence evaluation

- **Expertise Domains**: Financial analysis, regulatory compliance, operational auditing
- **Decision Framework**: Precedent-based analysis with exhaustive information requirements
- **Bias Profile**: Anchoring bias, conservatism bias (mitigated through structured protocols)

#### 3. Risk Agent (30% Weight)
**Archetype**: Investment Committee Member - The Risk Manager  
**Personality**: Sarah Williams

- **Primary Role**: Identifies implementation barriers and risk factors
- **Cognitive Style**: Systematic analysis with big-picture focus and future orientation
- **Key Behaviors**:
  - Develops comprehensive risk mitigation strategies using Monte Carlo simulation
  - Performs scenario planning with emphasis on downside protection
  - Assesses operational and regulatory implementation challenges
  - Recommends protective provisions and deal structure modifications

- **Expertise Domains**: Risk management, operational assessment, market analysis
- **Decision Framework**: Risk-adjusted returns with scenario planning
- **Bias Profile**: Loss aversion, availability heuristic (mitigated through historical databases)

#### 4. Judge Agent (Synthesis Role)
**Archetype**: Senior Partner - The Synthesizer  
**Personality**: Robert Sterling

- **Primary Role**: Synthesizes perspectives using weighted scoring framework
- **Cognitive Style**: Integrative thinking with relationship mapping and evidence weighting
- **Key Behaviors**:
  - Applies weighted scoring: Challenge (30%), Evidence (40%), Risk (30%)
  - Facilitates structured conflict resolution when consensus < 70%
  - Balances stakeholder interests using multi-criteria decision analysis
  - Provides final synthesis with confidence intervals and alternative scenarios

- **Expertise Domains**: Legal structuring, strategic judgment, stakeholder management
- **Decision Framework**: Stakeholder impact analysis with probabilistic thinking
- **Bias Profile**: Status quo bias, groupthink tendency (mitigated through devil's advocate protocols)

## System Behavior Patterns

### Consensus Mechanism

1. **Primary Analysis**: All agents analyze independently using their cognitive frameworks
2. **Consensus Check**: System calculates agreement level across agent outputs
3. **Conflict Detection**: If consensus < 70%, triggers conflict resolution protocols
4. **Second Round**: Agents receive refined prompts addressing specific disagreements
5. **Final Synthesis**: Judge agent provides weighted final recommendation

### Conflict Resolution Framework

#### Conflict Types
- **Severity Disagreements**: Agents assess different risk levels for same issue
- **Evidence Interpretation**: Same data leads to different conclusions
- **Recommendation Differences**: Agents propose contradictory actions
- **Impact Assessment**: Disagreement on stakeholder or financial impact

#### Resolution Strategies
- **Weighted Voting**: Based on agent expertise in specific domain
- **Evidence Strength**: Higher quality evidence takes precedence
- **Judge Decision**: Senior synthesis when technical expertise required
- **Majority Rule**: When no clear expertise advantage exists

### Scoring and Weighting

#### Base Weights
- **Challenge Agent**: 30% (Strategic skepticism)
- **Evidence Agent**: 40% (Data validation priority)
- **Risk Agent**: 30% (Implementation realism)

#### Contextual Adjustments
- **Large Deals** (>$100M): Evidence weight increases to 45%
- **Complex Transactions** (3+ categories): Challenge weight increases to 35%
- **High-Risk Industries**: Risk weight may increase to 35%

#### Quality Multipliers
- Confidence level below threshold: Score reduction
- Evidence strength insufficient: Penalty factor applied
- Expertise domain match: Bonus multiplier applied
- Bias correction: Adjustment based on known cognitive patterns

## Implementation Details

### Agent Profiles (`agent-profiles.ts`)
- Detailed personality definitions with cognitive styles
- Decision-making frameworks and expertise mapping
- Bias profiles and stress response patterns
- Behavioral decision trees for different scenarios

### Conflict Resolution (`conflict-resolution.ts`)
- Sophisticated conflict detection algorithms
- Second-round prompt refinement strategies
- Mediation protocols and escalation procedures
- Quality assessment and evidence evaluation

### Scoring System (`scoring-weights.ts`)
- Weighted consensus calculation engines
- Contextual weight adjustment mechanisms
- Quality multipliers and bias corrections
- Confidence interval calculations and alternative scenario generation

## Usage Examples

### Basic Analysis
```typescript
import { 
  AGENT_PROFILES, 
  conflictDetector, 
  weightedScoringEngine 
} from './agents';

// Get agent personalities
const challengeAgent = AGENT_PROFILES.CHALLENGE;
const evidenceAgent = AGENT_PROFILES.EVIDENCE;

// Analyze conflicts in agent results
const conflicts = conflictDetector.analyzeConflicts(agentResults);

// Calculate weighted scores
const scoring = weightedScoringEngine.calculateWeightedScore(
  agentResults, 
  { dealSize: 150000000 }
);
```

### Advanced Conflict Resolution
```typescript
// Detect specific conflict types
const severityConflicts = conflicts.conflicts.filter(
  c => c.type === 'SEVERITY_DISAGREEMENT'
);

// Generate refined prompts for second round
const refinedPrompts = conflicts.refinedPrompts.filter(
  p => p.agentType === 'CHALLENGE'
);

// Apply resolution strategy
if (conflicts.requiresSecondRound) {
  // Trigger enhanced analysis with refined prompts
  const secondRoundResults = await runSecondRoundAnalysis(refinedPrompts);
}
```

## Key Design Principles

1. **Expertise-Based Weighting**: Agents have stronger influence in their domain expertise
2. **Bias Awareness**: Each agent's cognitive biases are explicitly modeled and mitigated
3. **Conflict-Driven Learning**: Disagreements trigger deeper analysis rather than compromise
4. **Quality Gating**: Minimum standards must be met regardless of consensus pressure
5. **Stakeholder Balance**: Final decisions consider impact on all transaction stakeholders

## Extension Points

- **Custom Agent Profiles**: Add industry-specific or role-specific agents
- **Dynamic Weighting**: Adjust weights based on deal characteristics
- **External Integrations**: Connect with data sources and validation services
- **Human Oversight**: Escalation protocols for complex edge cases
- **Performance Learning**: Adapt agent behavior based on historical accuracy

This system provides a sophisticated foundation for automated M&A analysis that combines the rigor of professional advisory services with the consistency and scale of AI-powered automation.