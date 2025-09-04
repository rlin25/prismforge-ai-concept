import { Metadata } from 'next';
import { ProfessionalHeader } from '@/components/professional/ProfessionalHeader';

export const metadata: Metadata = {
  title: 'PrismForge AI - Professional M&A Validation Platform',
  description: 'Enterprise-grade multi-agent M&A validation with FREE document exploration and $500 professional validation services.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-prism-blue-600 via-skeptic-blue-700 to-validator-blue-600 bg-clip-text text-transparent">
              PrismForge AI
            </h1>
            <h2 className="text-xl md:text-2xl text-text-secondary font-medium">
              Enterprise M&A Validation Platform
            </h2>
            <p className="text-lg text-text-tertiary max-w-2xl mx-auto">
              Professional multi-agent validation platform delivering expert-quality M&A analysis 
              for corporate development teams, boutique consulting firms, and investment professionals.
            </p>
          </div>

          {/* Value Proposition */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* Phase 1 - FREE */}
            <div className="bg-surface-elevated border border-border rounded-lg p-8 space-y-4 shadow-professional">
              <div className="space-y-2">
                <div className="text-success-green-600 font-semibold text-sm uppercase tracking-wider">
                  Phase 1 - FREE
                </div>
                <h3 className="text-2xl font-semibold text-text-primary">
                  Document Exploration
                </h3>
                <p className="text-text-secondary">
                  Upload and explore your M&A documents with our intelligent chat interface. 
                  Completely free including Excel and PDF processing.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-green-500 rounded-full"></div>
                  <span className="text-sm text-text-secondary">FREE document upload & processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-green-500 rounded-full"></div>
                  <span className="text-sm text-text-secondary">Excel & PDF analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-green-500 rounded-full"></div>
                  <span className="text-sm text-text-secondary">Context-building chat interface</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-green-500 rounded-full"></div>
                  <span className="text-sm text-text-secondary">No token limits or costs</span>
                </div>
              </div>
              <button className="w-full bg-success-green-600 hover:bg-success-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                Start Free Exploration
              </button>
            </div>

            {/* Phase 2 - PROFESSIONAL */}
            <div className="bg-surface-elevated border border-primary rounded-lg p-8 space-y-4 shadow-professional-lg">
              <div className="space-y-2">
                <div className="text-primary font-semibold text-sm uppercase tracking-wider">
                  Phase 2 - PROFESSIONAL
                </div>
                <h3 className="text-2xl font-semibold text-text-primary">
                  Multi-Agent Validation
                </h3>
                <p className="text-text-secondary">
                  Adversarial validation with Skeptic Agent + Validator Agent system. 
                  Professional Quality Score ≥85% standard.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-text-secondary">Skeptic Agent + Validator Agent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-text-secondary">80K token professional analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-text-secondary">Professional Quality Score ≥85%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-text-secondary">Board-ready deliverables</span>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                  Professional Validation - $500
                </button>
                <p className="text-xs text-text-tertiary text-center">
                  $500 vs $50,000-150,000 consulting alternative
                </p>
              </div>
            </div>
          </div>

          {/* Professional Features */}
          <div className="mt-16 space-y-8">
            <h3 className="text-2xl font-semibold text-text-primary">
              Professional Features
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-skeptic-blue-600 font-medium">Skeptic Agent</div>
                <p className="text-sm text-text-secondary">
                  Adversarial analysis identifying risks, inconsistencies, and potential issues
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-validator-blue-600 font-medium">Validator Agent</div>
                <p className="text-sm text-text-secondary">
                  Strategic validation balancing opportunities against identified risks
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-medium">Quality Assurance</div>
                <p className="text-sm text-text-secondary">
                  Transparent methodology with Professional Quality Score ≥85%
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise Features */}
          <div className="mt-16 bg-surface border border-border rounded-lg p-8">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              Enterprise-Ready Platform
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full"></div>
                  <span className="text-text-secondary">Multi-tenant organization support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full"></div>
                  <span className="text-text-secondary">Enterprise SSO integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full"></div>
                  <span className="text-text-secondary">Role-based access control</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full"></div>
                  <span className="text-text-secondary">Professional audit trails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full"></div>
                  <span className="text-text-secondary">Team collaboration features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full"></div>
                  <span className="text-text-secondary">Enterprise security standards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}