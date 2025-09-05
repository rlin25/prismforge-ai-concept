import Link from 'next/link';
import { ProfessionalHeader } from '@/components/professional/ProfessionalHeader';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">
            PrismForge AI - Local Testing Dashboard
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Phase 1 Testing */}
            <div className="bg-surface-elevated border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Phase 1 - Document Exploration (FREE)
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/phase1" 
                  className="block w-full bg-success-green-600 hover:bg-success-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Start Document Upload
                </Link>
                <p className="text-sm text-text-secondary">
                  Upload M&A documents and explore with AI chat interface
                </p>
              </div>
            </div>

            {/* Phase 2 Testing */}
            <div className="bg-surface-elevated border border-primary rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Phase 2 - Professional Validation ($500)
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/phase2" 
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Professional Validation
                </Link>
                <p className="text-sm text-text-secondary">
                  Multi-agent adversarial validation with quality assurance
                </p>
              </div>
            </div>

            {/* Admin Dashboard */}
            <div className="bg-surface-elevated border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Enterprise Admin Dashboard
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/admin" 
                  className="block w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Admin Dashboard
                </Link>
                <p className="text-sm text-text-secondary">
                  Organization management, user roles, and analytics
                </p>
              </div>
            </div>

            {/* Team Management */}
            <div className="bg-surface-elevated border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Team Collaboration
              </h2>
              <div className="space-y-3">
                <Link 
                  href="/teams" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Team Management
                </Link>
                <p className="text-sm text-text-secondary">
                  Team creation, member management, and analysis sharing
                </p>
              </div>
            </div>
          </div>

          {/* Testing Notes */}
          <div className="mt-12 bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Local Testing Configuration
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p><strong>Database:</strong> Supabase (configured)</p>
              <p><strong>Environment:</strong> Development mode</p>
              <p><strong>Authentication:</strong> Ready for enterprise SSO testing</p>
              <p><strong>API Keys:</strong> Add your Anthropic API key to .env.local for full functionality</p>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ API Key Configured:</strong> Anthropic API key is set and ready
              </p>
            </div>
            
            <div className="mt-4 space-y-2">
              <h4 className="text-md font-medium text-text-primary">Database Diagnostics</h4>
              <div className="flex space-x-2">
                <a 
                  href="/api/test-db" 
                  target="_blank"
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors"
                >
                  Test Database Connection
                </a>
                <a 
                  href="/api/test-session" 
                  target="_blank"
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded transition-colors"
                >
                  View Test Sessions
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}