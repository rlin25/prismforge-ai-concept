/**
 * Output formatting templates for PrismForge AI
 * Handles Markdown report generation and structured output formatting
 */

import { 
  AgentResult, 
  ValidationResult, 
  Finding, 
  Recommendation, 
  FinalAnalysis,
  DocumentType,
  IndustryType,
  AgentType,
  OutputFormat
} from '../types/core';

export interface FormattingOptions {
  outputFormat: OutputFormat;
  includeExecutiveSummary: boolean;
  includeDetailedFindings: boolean;
  includeRecommendations: boolean;
  includeAppendices: boolean;
  customSections?: string[];
  branding?: BrandingOptions;
}

export interface BrandingOptions {
  companyName: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
}

export interface MarkdownSection {
  title: string;
  content: string;
  level: number;
  metadata?: any;
}

/**
 * Markdown Report Formatter
 */
export class MarkdownFormatter {
  private static readonly DEFAULT_FORMATTING: FormattingOptions = {
    outputFormat: 'MARKDOWN',
    includeExecutiveSummary: true,
    includeDetailedFindings: true,
    includeRecommendations: true,
    includeAppendices: true
  };

  /**
   * Generate comprehensive M&A analysis report in Markdown
   */
  static generateComprehensiveReport(
    validationResult: ValidationResult,
    options: Partial<FormattingOptions> = {}
  ): string {
    const config = { ...this.DEFAULT_FORMATTING, ...options };
    const sections: MarkdownSection[] = [];

    // Title and metadata
    sections.push(this.createTitleSection(validationResult));
    
    // Executive Summary
    if (config.includeExecutiveSummary) {
      sections.push(this.createExecutiveSummarySection(validationResult));
    }

    // Investment Recommendation
    sections.push(this.createInvestmentRecommendationSection(validationResult.finalAnalysis));

    // Key Findings
    if (config.includeDetailedFindings) {
      sections.push(this.createKeyFindingsSection(validationResult.finalAnalysis));
    }

    // Agent Analysis Details
    sections.push(this.createAgentAnalysisSection(validationResult.agentResults));

    // Risk Assessment
    sections.push(this.createRiskAssessmentSection(validationResult.finalAnalysis));

    // Deal Structure Recommendations
    if (config.includeRecommendations) {
      sections.push(this.createDealStructureSection(validationResult.finalAnalysis));
    }

    // Action Items and Next Steps
    sections.push(this.createActionItemsSection(validationResult.finalAnalysis));

    // Appendices
    if (config.includeAppendices) {
      sections.push(this.createAppendicesSection(validationResult));
    }

    return this.compileSections(sections);
  }

  /**
   * Generate executive summary report
   */
  static generateExecutiveSummary(validationResult: ValidationResult): string {
    const sections: MarkdownSection[] = [
      this.createTitleSection(validationResult, 'Executive Summary'),
      this.createExecutiveSummarySection(validationResult),
      this.createInvestmentRecommendationSection(validationResult.finalAnalysis),
      {
        title: 'Key Metrics Dashboard',
        content: this.createMetricsDashboard(validationResult),
        level: 2
      }
    ];

    return this.compileSections(sections);
  }

  /**
   * Generate agent-specific analysis report
   */
  static generateAgentReport(agentResult: AgentResult, documentType: DocumentType): string {
    const sections: MarkdownSection[] = [
      {
        title: `${agentResult.agentType} Agent Analysis`,
        content: this.createAgentHeader(agentResult, documentType),
        level: 1
      },
      {
        title: 'Analysis Summary',
        content: this.formatAgentSummary(agentResult),
        level: 2
      },
      {
        title: 'Detailed Findings',
        content: this.formatAgentFindings(agentResult),
        level: 2
      },
      {
        title: 'Recommendations',
        content: this.formatAgentRecommendations(agentResult),
        level: 2
      }
    ];

    return this.compileSections(sections);
  }

  // Private section builders

  private static createTitleSection(validationResult: ValidationResult, subtitle?: string): MarkdownSection {
    const title = subtitle || 'M&A Due Diligence Analysis Report';
    const content = `
# ${title}

**Document ID:** ${validationResult.documentId}
**Analysis Date:** ${validationResult.completedAt?.toLocaleDateString() || 'In Progress'}
**Status:** ${validationResult.status}
**Overall Assessment:** ${validationResult.finalAnalysis?.overallAssessment || 'Pending'}

---
`;

    return { title, content, level: 1 };
  }

  private static createExecutiveSummarySection(validationResult: ValidationResult): MarkdownSection {
    const analysis = validationResult.finalAnalysis;
    if (!analysis) {
      return { title: 'Executive Summary', content: '*Analysis in progress...*', level: 2 };
    }

    const content = `
## Executive Summary

${analysis.executiveSummary}

### Key Investment Highlights
${analysis.keyFindings.slice(0, 3).map(finding => `- ${finding.title}: ${finding.description}`).join('\n')}

### Major Risk Factors
${analysis.dealBreakers.map(risk => `- **${risk.severity}**: ${risk.title} - ${risk.description}`).join('\n')}

### Overall Recommendation
**${analysis.overallAssessment}** (Confidence: ${analysis.confidence}%)

${this.getRecommendationRationale(analysis.overallAssessment)}
`;

    return { title: 'Executive Summary', content, level: 2 };
  }

  private static createInvestmentRecommendationSection(analysis: FinalAnalysis): MarkdownSection {
    const content = `
## Investment Recommendation

### Overall Assessment: ${analysis.overallAssessment}
**Confidence Level:** ${analysis.confidence}%

${this.formatRecommendationDetails(analysis)}

### Investment Thesis
${analysis.executiveSummary}

### Key Success Factors
${analysis.recommendedActions.slice(0, 3).map(action => `1. **${action.title}**: ${action.description}`).join('\n')}
`;

    return { title: 'Investment Recommendation', content, level: 2 };
  }

  private static createKeyFindingsSection(analysis: FinalAnalysis): MarkdownSection {
    const content = `
## Key Findings

### Positive Findings
${analysis.keyFindings
  .filter(f => f.severity === 'LOW' || f.impact === 'MINIMAL')
  .map(finding => this.formatFinding(finding))
  .join('\n')}

### Areas of Concern
${analysis.keyFindings
  .filter(f => f.severity === 'MEDIUM' || f.severity === 'HIGH')
  .map(finding => this.formatFinding(finding))
  .join('\n')}

### Critical Issues
${analysis.dealBreakers.map(finding => this.formatFinding(finding, true)).join('\n')}

### Opportunities
${analysis.opportunities?.map(opp => 
  `- **${opp.category}**: ${opp.description} (Potential Value: $${(opp.potentialValue / 1000000).toFixed(1)}M, Probability: ${(opp.realizationProbability * 100).toFixed(0)}%)`
).join('\n') || '*No specific opportunities identified.*'}
`;

    return { title: 'Key Findings', content, level: 2 };
  }

  private static createAgentAnalysisSection(agentResults: AgentResult[]): MarkdownSection {
    const content = `
## Agent Analysis Details

${agentResults.map(result => this.formatAgentResultSummary(result)).join('\n\n')}

### Agent Consensus Analysis
${this.formatConsensusAnalysis(agentResults)}
`;

    return { title: 'Agent Analysis', content, level: 2 };
  }

  private static createRiskAssessmentSection(analysis: FinalAnalysis): MarkdownSection {
    const riskProfile = analysis.riskProfile;
    const content = `
## Risk Assessment

### Overall Risk Profile: ${riskProfile?.overall || 'Not Available'}

### Risk by Category
${riskProfile?.categories?.map(cat => 
  `#### ${cat.category}
**Risk Level:** ${cat.level}

**Key Risks:**
${cat.keyRisks.map(risk => `- ${risk.title}: ${risk.description}`).join('\n')}`
).join('\n\n') || '*Risk categorization not available.*'}

### Mitigation Strategies
${riskProfile?.mitigationStrategies?.map(strategy => 
  `- **Risk:** ${strategy.risk}
  - **Strategy:** ${strategy.strategy}
  - **Effectiveness:** ${strategy.effectiveness}
  - **Cost:** ${strategy.cost}`
).join('\n\n') || '*Mitigation strategies not defined.*'}
`;

    return { title: 'Risk Assessment', content, level: 2 };
  }

  private static createDealStructureSection(analysis: FinalAnalysis): MarkdownSection {
    const content = `
## Deal Structure Recommendations

### Recommended Actions
${analysis.recommendedActions.map((action, index) => 
  `${index + 1}. **${action.title}** (Priority: ${action.priority})
   - ${action.description}
   - Timeline: ${action.timeline}
   - Effort: ${action.estimatedEffort}
   
   **Action Items:**
   ${action.actionItems.map(item => `   - ${item.description}`).join('\n')}`
).join('\n\n')}

### Next Steps
1. **Immediate Actions** (0-30 days)
   ${analysis.recommendedActions
     .filter(a => a.timeline === 'IMMEDIATE')
     .map(a => `- ${a.title}`)
     .join('\n   ') || '   - No immediate actions identified'}

2. **Short-term Actions** (1-3 months)
   ${analysis.recommendedActions
     .filter(a => a.timeline === 'SHORT_TERM')
     .map(a => `- ${a.title}`)
     .join('\n   ') || '   - No short-term actions identified'}

3. **Long-term Actions** (3+ months)
   ${analysis.recommendedActions
     .filter(a => a.timeline === 'LONG_TERM')
     .map(a => `- ${a.title}`)
     .join('\n   ') || '   - No long-term actions identified'}
`;

    return { title: 'Deal Structure & Recommendations', content, level: 2 };
  }

  private static createActionItemsSection(analysis: FinalAnalysis): MarkdownSection {
    const content = `
## Action Items & Next Steps

### Critical Actions
${analysis.recommendedActions
  .filter(action => action.priority === 'HIGH' || action.priority === 'URGENT')
  .map(action => this.formatActionItem(action))
  .join('\n\n')}

### Standard Actions
${analysis.recommendedActions
  .filter(action => action.priority === 'MEDIUM')
  .map(action => this.formatActionItem(action))
  .join('\n\n')}

### Follow-up Items
${analysis.recommendedActions
  .filter(action => action.priority === 'LOW')
  .map(action => this.formatActionItem(action))
  .join('\n\n')}
`;

    return { title: 'Action Items', content, level: 2 };
  }

  private static createAppendicesSection(validationResult: ValidationResult): MarkdownSection {
    const content = `
## Appendices

### Appendix A: Methodology
This analysis was conducted using PrismForge AI's multi-agent validation system, employing four specialized agents:
- **Challenge Agent**: Red team analysis and assumption testing
- **Evidence Agent**: Fact verification and data validation
- **Risk Agent**: Comprehensive risk identification and assessment
- **Judge Agent**: Synthesis and final recommendation

### Appendix B: Agent Performance Metrics
${validationResult.agentResults.map(result => 
  `- **${result.agentType}**: ${result.status} (${result.executionTime}ms, ${result.retryCount} retries)`
).join('\n')}

### Appendix C: Confidence Intervals
- Overall Analysis Confidence: ${validationResult.finalAnalysis?.confidence || 0}%
- Consensus Level: ${validationResult.consensus?.level || 0}%
- Requires Second Round: ${validationResult.consensus?.requiresSecondRound ? 'Yes' : 'No'}

### Appendix D: Data Sources and Assumptions
*This section would include detailed information about data sources, assumptions, and limitations of the analysis.*

### Appendix E: Glossary
**Terms and Definitions**
- **TAM**: Total Addressable Market
- **SAM**: Serviceable Addressable Market
- **LTV**: Customer Lifetime Value
- **CAC**: Customer Acquisition Cost
- **EBITDA**: Earnings Before Interest, Taxes, Depreciation, and Amortization
`;

    return { title: 'Appendices', content, level: 2 };
  }

  // Helper formatting methods

  private static compileSections(sections: MarkdownSection[]): string {
    return sections.map(section => section.content.trim()).join('\n\n');
  }

  private static formatFinding(finding: Finding, isCritical = false): string {
    const prefix = isCritical ? '🚨' : this.getSeverityEmoji(finding.severity);
    return `
${prefix} **${finding.title}** (${finding.severity})
${finding.description}

**Evidence:** ${finding.evidence.map(e => e.content).join('; ')}
**Impact:** ${finding.impact} | **Likelihood:** ${finding.likelihood}
${finding.recommendation ? `**Recommendation:** ${finding.recommendation}` : ''}
`;
  }

  private static formatAgentResultSummary(result: AgentResult): string {
    if (!result.result) {
      return `### ${result.agentType} Agent
**Status:** ${result.status}
**Execution Time:** ${result.executionTime}ms
*Analysis incomplete or failed.*`;
    }

    return `### ${result.agentType} Agent
**Status:** ${result.status} | **Confidence:** ${result.result.confidence}% | **Time:** ${result.executionTime}ms

**Summary:** ${result.result.summary}

**Key Findings:** ${result.result.findings.length} findings identified
- High/Critical: ${result.result.findings.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL').length}
- Medium: ${result.result.findings.filter(f => f.severity === 'MEDIUM').length}
- Low: ${result.result.findings.filter(f => f.severity === 'LOW').length}`;
  }

  private static formatConsensusAnalysis(agentResults: AgentResult[]): string {
    const completedAgents = agentResults.filter(r => r.status === 'COMPLETED');
    const agreementLevel = completedAgents.length > 0 ? 
      Math.round(completedAgents.length / agentResults.length * 100) : 0;

    return `
**Agent Completion Rate:** ${completedAgents.length}/${agentResults.length} (${agreementLevel}%)

**Performance Summary:**
${agentResults.map(r => `- ${r.agentType}: ${r.status} (${r.executionTime}ms)`).join('\n')}
`;
  }

  private static createMetricsDashboard(validationResult: ValidationResult): string {
    return `
| Metric | Value | Status |
|--------|-------|--------|
| Overall Confidence | ${validationResult.finalAnalysis?.confidence || 0}% | ${this.getConfidenceStatus(validationResult.finalAnalysis?.confidence || 0)} |
| Agent Consensus | ${validationResult.consensus?.level || 0}% | ${this.getConsensusStatus(validationResult.consensus?.level || 0)} |
| Processing Time | ${validationResult.completedAt && validationResult.createdAt ? Math.round((validationResult.completedAt.getTime() - validationResult.createdAt.getTime()) / 1000) : 0}s | ⏱️ |
| Critical Issues | ${validationResult.finalAnalysis?.dealBreakers?.length || 0} | ${validationResult.finalAnalysis?.dealBreakers?.length === 0 ? '✅' : '⚠️'} |
`;
  }

  private static formatRecommendationDetails(analysis: FinalAnalysis): string {
    const recommendationDetails: Record<string, string> = {
      'STRONG_BUY': '🟢 **Highly Recommended** - Exceptional opportunity with strong risk-adjusted returns',
      'BUY': '🟡 **Recommended** - Attractive investment with acceptable risk profile',
      'HOLD': '🟠 **Neutral** - Meets basic criteria but limited upside potential',
      'PASS': '🔴 **Not Recommended** - Risks outweigh potential returns',
      'STRONG_PASS': '🛑 **Strongly Not Recommended** - Significant risks and poor prospects'
    };

    return recommendationDetails[analysis.overallAssessment] || 'Assessment pending';
  }

  private static getRecommendationRationale(assessment: string): string {
    const rationales: Record<string, string> = {
      'STRONG_BUY': 'This investment presents exceptional value with strong fundamentals, manageable risks, and significant upside potential.',
      'BUY': 'This investment offers attractive returns with acceptable risk levels and good strategic fit.',
      'HOLD': 'This investment meets basic requirements but offers limited differentiation and moderate returns.',
      'PASS': 'This investment presents risks that outweigh potential returns given current market conditions.',
      'STRONG_PASS': 'This investment presents significant risks and poor prospects that make it unsuitable for our portfolio.'
    };

    return rationales[assessment] || '';
  }

  private static formatActionItem(action: Recommendation): string {
    return `
**${action.title}** (${action.priority} Priority)
${action.description}

- **Timeline:** ${action.timeline}
- **Effort Level:** ${action.estimatedEffort}
- **Action Items:**
${action.actionItems.map(item => `  - ${item.description}${item.assignee ? ` (Assigned: ${item.assignee})` : ''}`).join('\n')}
`;
  }

  private static formatAgentSummary(result: AgentResult): string {
    if (!result.result) {
      return `Analysis failed or incomplete. Status: ${result.status}`;
    }

    return `
**Confidence Level:** ${result.result.confidence}%
**Evidence Strength:** ${result.result.evidenceStrength}
**Execution Time:** ${result.executionTime}ms

${result.result.summary}
`;
  }

  private static formatAgentFindings(result: AgentResult): string {
    if (!result.result) {
      return 'No findings available.';
    }

    return result.result.findings.map(finding => this.formatFinding(finding)).join('\n\n');
  }

  private static formatAgentRecommendations(result: AgentResult): string {
    if (!result.result) {
      return 'No recommendations available.';
    }

    return result.result.recommendations.map(rec => this.formatActionItem(rec)).join('\n\n');
  }

  private static createAgentHeader(result: AgentResult, documentType: DocumentType): string {
    return `
**Document Type:** ${documentType}
**Analysis Timestamp:** ${result.timestamp.toISOString()}
**Agent Status:** ${result.status}
**Processing Time:** ${result.executionTime}ms
**Retry Count:** ${result.retryCount}

---
`;
  }

  // Utility methods

  private static getSeverityEmoji(severity: string): string {
    const emojiMap: Record<string, string> = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'CRITICAL': '🔴'
    };
    return emojiMap[severity] || '⚪';
  }

  private static getConfidenceStatus(confidence: number): string {
    if (confidence >= 90) return '🟢 High';
    if (confidence >= 70) return '🟡 Medium';
    if (confidence >= 50) return '🟠 Low';
    return '🔴 Very Low';
  }

  private static getConsensusStatus(consensus: number): string {
    if (consensus >= 80) return '✅ Strong';
    if (consensus >= 60) return '🟡 Moderate';
    if (consensus >= 40) return '🟠 Weak';
    return '❌ Poor';
  }
}

/**
 * JSON Formatter for structured output
 */
export class JSONFormatter {
  
  /**
   * Format validation result as structured JSON
   */
  static formatValidationResult(validationResult: ValidationResult): any {
    return {
      metadata: {
        documentId: validationResult.documentId,
        analysisId: validationResult.id,
        status: validationResult.status,
        createdAt: validationResult.createdAt.toISOString(),
        completedAt: validationResult.completedAt?.toISOString(),
        processingTimeMs: validationResult.completedAt && validationResult.createdAt ? 
          validationResult.completedAt.getTime() - validationResult.createdAt.getTime() : null
      },
      recommendation: {
        decision: validationResult.finalAnalysis?.overallAssessment,
        confidence: validationResult.finalAnalysis?.confidence,
        summary: validationResult.finalAnalysis?.executiveSummary
      },
      findings: {
        keyFindings: validationResult.finalAnalysis?.keyFindings || [],
        dealBreakers: validationResult.finalAnalysis?.dealBreakers || [],
        opportunities: validationResult.finalAnalysis?.opportunities || []
      },
      riskAssessment: validationResult.finalAnalysis?.riskProfile,
      agentResults: validationResult.agentResults.map(this.formatAgentResult),
      consensus: validationResult.consensus,
      actionItems: validationResult.finalAnalysis?.recommendedActions || []
    };
  }

  private static formatAgentResult(result: AgentResult): any {
    return {
      agentType: result.agentType,
      status: result.status,
      executionTimeMs: result.executionTime,
      retryCount: result.retryCount,
      timestamp: result.timestamp.toISOString(),
      analysis: result.result ? {
        summary: result.result.summary,
        confidence: result.result.confidence,
        evidenceStrength: result.result.evidenceStrength,
        findingsCount: result.result.findings.length,
        recommendationsCount: result.result.recommendations.length,
        findings: result.result.findings,
        recommendations: result.result.recommendations
      } : null,
      error: result.error
    };
  }
}

/**
 * PDF Formatter for professional reports
 */
export class PDFFormatter {
  
  /**
   * Generate PDF-ready HTML content
   */
  static generatePDFContent(validationResult: ValidationResult, options: FormattingOptions): string {
    const markdownContent = MarkdownFormatter.generateComprehensiveReport(validationResult, options);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>M&A Due Diligence Analysis Report</title>
        <style>
            ${this.getPDFStyles(options.branding)}
        </style>
    </head>
    <body>
        <div class="report-container">
            ${this.markdownToHTML(markdownContent)}
        </div>
    </body>
    </html>
    `;
  }

  private static getPDFStyles(branding?: BrandingOptions): string {
    return `
        body {
            font-family: ${branding?.fonts?.body || 'Arial, sans-serif'};
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: ${branding?.fonts?.heading || 'Arial, sans-serif'};
            color: ${branding?.colors?.primary || '#2c3e50'};
        }
        
        .report-container {
            background: white;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: ${branding?.colors?.secondary || '#f8f9fa'};
        }
        
        .page-break {
            page-break-before: always;
        }
    `;
  }

  private static markdownToHTML(markdown: string): string {
    // Basic markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul])/gm, '<p>')
      .replace(/$/gm, '</p>');
  }
}

export default MarkdownFormatter;