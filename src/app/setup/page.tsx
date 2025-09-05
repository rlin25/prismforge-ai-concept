'use client';

import { useState } from 'react';
import { ProfessionalHeader } from '@/components/professional/ProfessionalHeader';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTables = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/create-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">
            Database Setup
          </h1>
          
          <div className="bg-surface-elevated border border-border rounded-lg p-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Initialize Database Tables
            </h2>
            
            <p className="text-text-secondary mb-6">
              This will attempt to create all necessary database tables for PrismForge AI.
              If automatic creation fails, you'll get instructions for manual setup in your Supabase dashboard.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Manual Setup Instructions</h3>
              <p className="text-blue-700 text-sm mb-2">
                If the automatic setup fails, please:
              </p>
              <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
                <li>Go to your <a href="https://supabase.com/dashboard/project/hshmedkrowhzsyngmruc" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                <li>Navigate to the "SQL Editor" tab</li>
                <li>Copy and paste the contents from the <code>/database-setup.sql</code> file</li>
                <li>Click "Run" to execute the SQL commands</li>
              </ol>
            </div>

            <button
              onClick={createTables}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Creating Tables...' : 'Create Database Tables'}
            </button>

            {result && (
              <div className="mt-6 p-4 rounded-lg border" 
                   style={{
                     backgroundColor: result.status === 'completed' ? '#f0f9ff' : '#fef2f2',
                     borderColor: result.status === 'completed' ? '#0ea5e9' : '#ef4444'
                   }}>
                <h3 className="font-semibold mb-2">
                  {result.status === 'completed' ? '✅ Setup Result' : '❌ Error'}
                </h3>
                <p className="text-sm mb-3">{result.message}</p>
                
                {result.results && (
                  <div className="space-y-2">
                    {result.results.map((item: any, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="font-medium w-32">{item.table}:</span>
                        <span className={item.status === 'error' ? 'text-red-600' : 'text-green-600'}>
                          {item.status}
                        </span>
                        {item.error && <span className="text-red-600 ml-2">({item.error})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result && result.status === 'completed' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">🎉 Database setup completed!</p>
                <p className="text-green-700 text-sm mt-1">
                  You can now test document upload functionality at{' '}
                  <a href="/phase1" className="underline">Phase 1</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}