# PrismForge AI Prompt Engineering System

A comprehensive prompt engineering framework for M&A due diligence analysis, featuring specialized agents, dynamic prompt construction, context injection, and optimized preprocessing.

## 🏗️ System Architecture

The prompt engineering system consists of six core components:

```
src/prompts/
├── system-prompts.ts      # Base prompts for each agent type
├── dynamic-prompts.ts     # Document-type specific generation
├── context-injection.ts   # Knowledge base integration
├── preprocessing.ts       # Haiku 3.5 optimization
├── formatters.ts         # Output formatting templates
├── index.ts              # Master orchestrator
└── README.md             # This documentation
```

## 🤖 Agent Types

### Challenge Agent
**Role**: Red team analysis and assumption testing
- Aggressively challenges stated assumptions
- Identifies logical inconsistencies and gaps
- Questions financial projections and market claims
- Highlights potential overvaluations

### Evidence Agent
**Role**: Fact verification and data validation
- Verifies all factual claims against reliable sources
- Validates financial data and projections
- Cross-references market data and benchmarks
- Assesses information source credibility

### Risk Agent
**Role**: Comprehensive risk identification and assessment
- Identifies risks across multiple dimensions
- Quantifies risk impact and probability
- Evaluates risk interdependencies
- Recommends mitigation strategies

### Judge Agent
**Role**: Synthesis and final decision making
- Synthesizes findings from all agents
- Resolves conflicts and discrepancies
- Provides final investment recommendations
- Recommends deal terms and conditions

## 📄 Document Types Supported

| Document Type | Focus Areas | Key Metrics |
|---------------|-------------|-------------|
| **CIM** | Investment thesis, market position, financial performance | Revenue growth, EBITDA margins, market share |
| **Financial Model** | Revenue forecasting, cost structure, cash flow analysis | Revenue CAGR, margin projections, terminal value |
| **LOI** | Valuation structure, deal terms, due diligence scope | Purchase multiples, earnout provisions, escrow |
| **SPA** | Purchase price mechanisms, reps & warranties | Working capital baseline, indemnification terms |
| **DD Report** | Due diligence findings, risk assessment | Risk quantification, integration costs |
| **Valuation** | Methodology selection, comparable analysis | EV/Revenue, EV/EBITDA, DCF discount rates |
| **Pitch Deck** | Investment thesis, market opportunity | TAM/SAM estimates, competitive positioning |
| **Management Presentation** | Team credibility, strategy articulation | Track record, operational KPIs |

## 🏭 Industry Specializations

The system includes specialized knowledge for:
- **SaaS**: MRR/ARR, churn rates, CAC/LTV ratios
- **Manufacturing**: Capacity utilization, inventory turns
- **Healthcare**: Patient outcomes, reimbursement rates
- **FinTech**: Transaction volume, regulatory compliance
- **Retail**: Same-store sales, inventory turnover
- **Energy**: Production volumes, commodity pricing
- **Real Estate**: Occupancy rates, NOI margins
- **Technology**: R&D intensity, IP portfolio

## 🚀 Quick Start

### Basic Usage

```typescript
import { PromptEngine, FormattingOptions } from './src/prompts';

// Initialize the prompt engine
const promptEngine = new PromptEngine();

// Generate agent prompt
const prompt = await promptEngine.generateAgentPrompt(
  'CHALLENGE',           // Agent type
  document,             // Document to analyze
  analysisConfig,       // Analysis configuration
  false,               // Not second round
);

// Format results
const options: FormattingOptions = {
  outputFormat: 'MARKDOWN',
  includeExecutiveSummary: true,
  includeDetailedFindings: true,
  includeRecommendations: true
};

const report = promptEngine.formatResults(validationResult, options);
```

### Advanced Configuration

```typescript
// Custom prompt with industry context
const contextualPrompt = await promptEngine.generateAgentPrompt(
  'RISK',
  document,
  {
    agents: [{ type: 'RISK', enabled: true, weight: 1.0, timeout: 30000 }],
    consensusThreshold: 0.8,
    maxRetries: 2,
    enableSecondRound: true,
    outputFormat: 'MARKDOWN'
  }
);

// Generate preprocessing prompt
const preprocessingPrompt = promptEngine.generatePreprocessingPrompt(document);

// Validate prompt configuration
const isValid = promptEngine.validatePromptConfiguration(
  'EVIDENCE',
  'CIM',
  'SAAS'
);
```

## 🔄 Dynamic Prompt Construction

The system dynamically constructs prompts based on:

### Document Characteristics
- **Type**: CIM, Financial Model, LOI, SPA, etc.
- **Industry**: SaaS, Manufacturing, Healthcare, etc.
- **Deal Stage**: Sourcing, Due Diligence, Closing, etc.
- **Deal Size**: Adjusts scrutiny level based on transaction value

### Context Injection
- **Industry Benchmarks**: Percentile-based performance metrics
- **Historical Precedents**: Success/failure patterns from similar deals
- **Regulatory Context**: Industry-specific compliance requirements
- **Market Conditions**: Current market trends and dynamics

### Agent Specialization
- **Challenge Agent**: Red team methodology, aggressive questioning
- **Evidence Agent**: Fact verification hierarchy, source reliability
- **Risk Agent**: Risk categorization frameworks, quantification methods
- **Judge Agent**: Decision matrices, consensus building

## 🎯 Preprocessing Optimization

### Haiku 3.5 Cost Optimization
The preprocessing layer uses Claude Haiku 3.5 for efficient initial processing:

```typescript
// Extract key content efficiently
const extractionPrompt = PreprocessingPrompts.getDocumentExtractionPrompt('CIM');

// Summarize for agent consumption
const summaryPrompt = PreprocessingPrompts.getContentSummarizationPrompt('CIM');

// Validate data quality
const validationPrompt = PreprocessingPrompts.getDataValidationPrompt();

// Extract metrics by industry
const metricsPrompt = PreprocessingPrompts.getMetricsExtractionPrompt('SAAS');
```

### Processing Pipeline
1. **Document Parsing**: Extract structured content and metadata
2. **Content Summarization**: Generate concise summaries for agents
3. **Data Validation**: Verify numerical consistency and completeness
4. **Metrics Extraction**: Pull industry-specific KPIs and ratios
5. **Risk Identification**: Flag potential issues and red flags

## 📊 Output Formatting

### Markdown Reports (Default)
- Executive summary with key highlights
- Detailed agent analysis and findings
- Risk assessment and mitigation strategies
- Investment recommendations and action items
- Professional formatting with tables and charts

### JSON Output
- Structured data for API consumption
- Machine-readable findings and metrics
- Agent performance metadata
- Confidence scores and validation flags

### PDF Generation
- Professional report layout
- Custom branding and styling
- Print-ready formatting
- Appendices with detailed data

## 🔧 Configuration Options

### Formatting Options
```typescript
interface FormattingOptions {
  outputFormat: 'MARKDOWN' | 'JSON' | 'PDF' | 'HTML';
  includeExecutiveSummary: boolean;
  includeDetailedFindings: boolean;
  includeRecommendations: boolean;
  includeAppendices: boolean;
  customSections?: string[];
  branding?: BrandingOptions;
}
```

### Analysis Configuration
```typescript
interface AnalysisConfiguration {
  agents: AgentConfiguration[];
  consensusThreshold: number;        // 0.0-1.0
  maxRetries: number;               // Default: 2
  enableSecondRound: boolean;       // Default: true
  outputFormat: OutputFormat;       // Default: 'MARKDOWN'
}
```

## 🧪 Testing and Optimization

### Prompt Validation
```typescript
import { PromptValidator } from './src/prompts';

// Validate token count
const isValidLength = PromptValidator.validateTokenCount(prompt, 100000);

// Validate structure
const validation = PromptValidator.validatePromptStructure(prompt);
console.log(validation.isValid);
console.log(validation.missingComponents);
console.log(validation.warnings);
```

### A/B Testing
```typescript
import { PromptOptimizer } from './src/prompts';

// Generate prompt variations
const variations = PromptOptimizer.generatePromptVariations(
  basePrompt,
  'AGGRESSIVE'  // 'CONSERVATIVE' | 'AGGRESSIVE' | 'BALANCED'
);

// Optimize for specific use cases
const speedOptimized = PromptOptimizer.optimizeForUseCase(
  prompt,
  'SPEED'  // 'SPEED' | 'ACCURACY' | 'COMPREHENSIVENESS'
);
```

## 🔍 Knowledge Base Integration

### Industry Benchmarks
- Percentile-based performance metrics (P25, P50, P75, P90)
- Industry-specific KPIs and ratios
- Market conditions and trends
- Regulatory requirements by sector

### Historical Precedents
- Successful and failed deal patterns
- Key success factors and failure modes
- Industry-specific lessons learned
- Valuation multiples and trends

### Risk Databases
- Common risk patterns by industry
- Mitigation strategies and effectiveness
- Historical frequency and impact data
- Early warning indicators

## 📈 Performance Metrics

The system tracks and optimizes for:
- **Prompt Generation Speed**: <100ms for standard prompts
- **Token Efficiency**: Optimized for model context limits
- **Agent Consensus Rate**: Target >80% agreement
- **Processing Accuracy**: Validated against expert benchmarks
- **Cost Optimization**: Haiku 3.5 preprocessing reduces costs by ~70%

## 🛠️ Customization

### Adding New Document Types
1. Define configuration in `DOCUMENT_TYPE_CONFIGS`
2. Add specific instructions and validation criteria
3. Update preprocessing prompts
4. Test with sample documents

### Industry Extensions
1. Add industry modifier in `INDUSTRY_MODIFIERS`
2. Define industry-specific metrics and risks
3. Update knowledge base with benchmarks
4. Validate with industry experts

### Custom Agent Types
1. Create system prompt configuration
2. Define role, context, and instructions
3. Add to `SystemPromptManager`
4. Implement agent-specific formatting

## 📚 Best Practices

### Prompt Design
- Use clear, specific instructions
- Provide concrete examples and templates
- Include validation criteria and constraints
- Balance comprehensiveness with efficiency

### Context Management
- Inject relevant knowledge without overwhelming
- Use tiered information hierarchy
- Maintain source attribution
- Update knowledge bases regularly

### Output Quality
- Standardize formatting across agents
- Include confidence indicators
- Provide actionable recommendations
- Enable easy customization and branding

### Performance Optimization
- Use Haiku 3.5 for preprocessing heavy tasks
- Cache frequent prompt combinations
- Optimize for model context limits
- Monitor and tune based on usage patterns

## 🤝 Contributing

To extend the prompt system:

1. **Fork and Clone**: Create your development environment
2. **Follow Patterns**: Use existing code patterns and TypeScript interfaces
3. **Add Tests**: Include unit tests for new functionality
4. **Document Changes**: Update README and inline documentation
5. **Submit PR**: Follow the project's contribution guidelines

## 📄 License

This prompt engineering system is part of the PrismForge AI project and follows the same licensing terms.

---

For questions, issues, or contributions, please refer to the main project documentation or open an issue in the repository.