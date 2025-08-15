# M&A Domain Knowledge Base

A comprehensive TypeScript-based knowledge base for mergers and acquisitions (M&A) due diligence and analysis. This module provides structured frameworks, validation logic, and industry-specific considerations for professional M&A transactions.

## Overview

The M&A Knowledge Base consists of five core modules:

1. **Financial Terms** - Comprehensive financial terminology and calculation frameworks
2. **Validation Frameworks** - DCF, comparable companies, and precedent transaction validation
3. **Red Flags** - Automated detection of concerning patterns and risks
4. **Industry Specifics** - Sector-specific analysis frameworks and benchmarks
5. **Deal Structures** - Templates and analysis for various transaction structures

## Modules

### 1. Financial Terms (`financial-terms.ts`)

Provides comprehensive financial terminology, interfaces, and calculation utilities for M&A analysis.

**Key Features:**
- Complete financial metrics definitions (Revenue, EBITDA, FCF, etc.)
- M&A-specific terms (LOI, SPA, earnouts, etc.)
- Valuation multiples and ratios
- Financial calculation utilities
- Due diligence checklists

**Example Usage:**
```typescript
import { FinancialCalculators, FINANCIAL_TERMS_GLOSSARY } from './financial-terms';

// Calculate enterprise value
const ev = FinancialCalculators.calculateEnterpriseValue(marketCap, totalDebt, cash);

// Validate EBITDA add-backs
const addBackAnalysis = FinancialCalculators.validateEBITDAAddBacks(addBacks, ebitda);
```

### 2. Validation Frameworks (`validation-frameworks.ts`)

Comprehensive validation logic for financial analysis methodologies commonly used in M&A.

**Key Features:**
- DCF Analysis validation with 20+ checks
- Comparable Companies analysis with statistical validation
- Precedent Transactions analysis with market context
- Sensitivity analysis validation
- Automated scoring and recommendations

**Example Usage:**
```typescript
import { ValidationFrameworks } from './validation-frameworks';

// Validate DCF analysis
const dcfValidation = ValidationFrameworks.validateDCF(dcfAnalysis);

// Validate comparable companies
const compValidation = ValidationFrameworks.validateComparables(compAnalysis);
```

### 3. Red Flags (`red-flags.ts`)

Automated detection of concerning patterns and risks in M&A transactions.

**Key Features:**
- Hockey stick growth pattern detection
- Excessive EBITDA add-backs analysis
- Customer concentration risk assessment
- Quality of earnings red flags
- Revenue quality issues detection
- Working capital and management red flags

**Example Usage:**
```typescript
import { RedFlagDetector } from './red-flags';

// Comprehensive red flag analysis
const redFlags = RedFlagDetector.analyzeRedFlags(
  financials, 
  projections, 
  customerData, 
  managementData
);

// Detect specific patterns
const hockeyStick = RedFlagDetector.detectHockeyStickGrowth(revenueProjections);
```

### 4. Industry Specifics (`industry-specifics.ts`)

Sector-specific analysis frameworks with industry benchmarks and considerations.

**Supported Industries:**
- **SaaS** - ARR, LTV/CAC, churn rates, Rule of 40
- **Manufacturing** - Capacity utilization, OEE, inventory turnover
- **Healthcare** - Regulatory compliance, reimbursement metrics, quality outcomes
- **Fintech** - Regulatory considerations, customer metrics
- **Retail** - Same-store sales, inventory management, seasonal patterns

**Example Usage:**
```typescript
import { IndustryAnalyzer } from './industry-specifics';

// Get industry-specific configuration
const saasConfig = IndustryAnalyzer.getIndustryConfig('SAAS');

// Validate metrics against industry benchmarks
const validation = IndustryAnalyzer.validateIndustryMetrics(metrics, 'SAAS', customMetrics);
```

### 5. Deal Structures (`deal-structures.ts`)

Comprehensive templates and analysis for various M&A transaction structures.

**Key Features:**
- Asset Purchase Agreement templates
- Stock Purchase Agreement templates
- Merger Agreement templates
- Deal structure analysis and optimization
- Tax implications assessment
- Risk allocation frameworks

**Example Usage:**
```typescript
import { DealStructureTemplates } from './deal-structures';

// Create asset purchase template
const assetPurchase = DealStructureTemplates.createAssetPurchaseTemplate(dealParams);

// Analyze deal structure efficiency
const analysis = DealStructureTemplates.analyzeDealStructure(dealStructure);
```

## Industry-Specific Metrics

### SaaS Metrics
- **ARR Growth Rate** - Target: >25% (excellent: >50%)
- **LTV/CAC Ratio** - Target: >3.0 (excellent: >5.0)
- **Net Revenue Retention** - Target: >110% (excellent: >120%)
- **Monthly Churn Rate** - Target: <5% (excellent: <2%)
- **Rule of 40** - Target: >40% (growth rate + FCF margin)

### Manufacturing Metrics
- **Capacity Utilization** - Target: >75% (excellent: >85%)
- **Inventory Turnover** - Target: >6x (excellent: >8x)
- **Overall Equipment Effectiveness** - Target: >65% (excellent: >85%)
- **Gross Margin** - Industry-dependent, typically 20-40%

### Healthcare Metrics
- **Days in A/R** - Target: <65 days (excellent: <45 days)
- **Operating Margin** - Target: >6% (excellent: >10%)
- **Patient Satisfaction** - Target: >7.5/10 (excellent: >8.5/10)
- **Regulatory Compliance Score** - Target: 100% (critical)

## Red Flag Thresholds

### Critical Red Flags (Deal Breakers)
- Customer concentration >50% of revenue
- EBITDA add-backs >40% of EBITDA
- Negative free cash flow with positive EBITDA >20% margin
- Material regulatory violations or pending litigation
- Hockey stick growth with >3x acceleration

### High-Risk Red Flags
- Customer concentration >30% of revenue
- EBITDA add-backs >20% of EBITDA
- Monthly churn rate >10% (SaaS)
- Capacity utilization <60% (Manufacturing)
- Days in A/R >90 days (Healthcare)

### Medium-Risk Red Flags
- Related party transactions >10% of revenue
- Working capital deterioration >15%
- Management turnover >30% in 2 years
- Inventory turnover <3x (Manufacturing)
- Revenue growth deceleration >50%

## Validation Scoring

Each validation framework provides scores on a 0-100 scale:

- **90-100**: Excellent - Best-in-class performance
- **75-89**: Good - Above-average performance
- **60-74**: Average - Meets basic standards
- **40-59**: Below Average - Requires attention
- **0-39**: Poor - Significant concerns

## Configuration

The knowledge base can be configured using the `KnowledgeBaseConfig` interface:

```typescript
import { DEFAULT_KNOWLEDGE_CONFIG } from './knowledge';

const config = {
  ...DEFAULT_KNOWLEDGE_CONFIG,
  validationThresholds: {
    dcfMinScore: 75,           // Minimum DCF validation score
    compMinSampleSize: 7,      // Minimum comparable companies
    precedentMinSampleSize: 5, // Minimum precedent transactions
    redFlagCriticalThreshold: 85,
    industryVarianceTolerance: 0.15
  },
  redFlagSensitivity: 'HIGH'  // LOW, MEDIUM, HIGH
};
```

## Integration with PrismForge AI

This knowledge base integrates with the PrismForge AI agent system to provide:

1. **Context for Agent Analysis** - Agents use industry-specific knowledge
2. **Validation Logic** - Automated validation of agent findings
3. **Red Flag Detection** - Systematic risk identification
4. **Benchmarking** - Industry-standard comparisons
5. **Deal Structure Guidance** - Transaction structure recommendations

## Best Practices

### 1. Industry Selection
Always specify the correct industry for analysis to ensure relevant benchmarks and red flags are applied.

### 2. Data Quality
Ensure financial data is normalized and adjusted for one-time items before analysis.

### 3. Multiple Validation Methods
Use multiple validation frameworks (DCF, comparables, precedents) for comprehensive analysis.

### 4. Red Flag Context
Consider red flags in industry context - what's normal in one sector may be concerning in another.

### 5. Deal Structure Optimization
Evaluate multiple deal structures considering tax, risk, and operational objectives.

## Dependencies

This module has minimal external dependencies and is designed to work with:
- TypeScript 4.5+
- Standard JavaScript Math library
- Date manipulation (built-in)

## Contributing

When adding new industry-specific modules:

1. Follow the existing interface patterns
2. Include comprehensive TypeScript types
3. Provide industry benchmarks with sources
4. Add relevant red flag detection rules
5. Include JSDoc documentation
6. Add example usage in README

## License

This knowledge base is part of the PrismForge AI project and follows the same licensing terms.

---

*For detailed implementation examples and advanced usage patterns, see the individual module files and the comprehensive test suite.*