'use client';

import { useState, useEffect } from 'react';
import { ProfessionalHeader } from '@/components/professional/ProfessionalHeader';
import { FileUpload } from '@/components/phase1/FileUpload';
import { ChatInterface } from '@/components/phase1/ChatInterface';
import { ProfessionalTransition } from '@/components/professional/ProfessionalTransition';
import { ProfessionalValidation } from '@/components/phase2/ProfessionalValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  MessageSquare, 
  Zap, 
  ArrowRight,
  FileText,
  CheckCircle
} from 'lucide-react';
import type { ProcessedDocument } from '@/types/phase1.types';

export default function Phase1TestPage() {
  const [sessionId] = useState(() => `test-session-${Date.now()}`);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [phase2Ready, setPhase2Ready] = useState(false);
  const [currentView, setCurrentView] = useState<'upload' | 'chat' | 'transition' | 'phase2'>('upload');
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleFileProcessed = (document: ProcessedDocument) => {
    setProcessedDocuments(prev => [...prev, document]);
    // Auto-switch to chat view when first document is processed
    if (processedDocuments.length === 0) {
      setTimeout(() => setCurrentView('chat'), 1000);
    }
  };

  const handleFileRemoved = (documentId: string) => {
    setProcessedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handlePhase2Ready = (ready: boolean) => {
    setPhase2Ready(ready);
  };

  const handleInitiateProfessionalValidation = () => {
    setCurrentView('phase2');
  };

  const handleValidationComplete = (result: any) => {
    setValidationResult(result);
    // Stay on phase2 view to show results
  };

  const handleValidationError = (error: string) => {
    console.error('Professional validation error:', error);
    // Could show error state or return to transition view
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Phase 1: FREE M&A Document Analysis
              </h1>
              <p className="text-text-secondary">
                Upload documents, explore insights, and prepare for professional validation
              </p>
            </div>
            <Badge className="bg-success-green-100 text-success-green-800 border-success-green-200">
              Completely FREE
            </Badge>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center space-x-2 ${
              processedDocuments.length > 0 ? 'text-success-green-600' : 
              currentView === 'upload' ? 'text-primary' : 'text-text-tertiary'
            }`}>
              {processedDocuments.length > 0 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Upload Documents</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-text-tertiary" />
            
            <div className={`flex items-center space-x-2 ${
              currentView === 'chat' ? 'text-primary' : 'text-text-tertiary'
            }`}>
              <MessageSquare className="w-4 h-4" />
              <span>Explore & Analyze</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-text-tertiary" />
            
            <div className={`flex items-center space-x-2 ${
              phase2Ready ? 'text-success-green-600' : 
              currentView === 'transition' ? 'text-primary' : 'text-text-tertiary'
            }`}>
              <Zap className="w-4 h-4" />
              <span>Professional Validation</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={currentView === 'upload' ? 'default' : 'outline'}
            onClick={() => setCurrentView('upload')}
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button
            variant={currentView === 'chat' ? 'default' : 'outline'}
            onClick={() => setCurrentView('chat')}
            size="sm"
            disabled={processedDocuments.length === 0}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat ({processedDocuments.length} docs)
          </Button>
          <Button
            variant={currentView === 'transition' ? 'default' : 'outline'}
            onClick={() => setCurrentView('transition')}
            size="sm"
            disabled={!phase2Ready && processedDocuments.length === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Phase 2 Transition
          </Button>
          <Button
            variant={currentView === 'phase2' ? 'default' : 'outline'}
            onClick={() => setCurrentView('phase2')}
            size="sm"
            disabled={!phase2Ready && processedDocuments.length === 0}
            className="bg-primary text-primary-foreground border-primary"
          >
            <Zap className="w-4 h-4 mr-2" />
            Professional Validation ($500)
          </Button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentView === 'upload' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Document Upload</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    sessionId={sessionId}
                    onFileProcessed={handleFileProcessed}
                    onFileRemoved={handleFileRemoved}
                    processedDocuments={processedDocuments}
                  />
                </CardContent>
              </Card>
            )}

            {currentView === 'chat' && (
              <div className="h-[600px]">
                <ChatInterface
                  sessionId={sessionId}
                  documents={processedDocuments}
                  onPhase2Ready={handlePhase2Ready}
                />
              </div>
            )}

            {currentView === 'transition' && (
              <ProfessionalTransition
                sessionId={sessionId}
                transitionReadiness={phase2Ready || processedDocuments.length > 0}
                professionalQualityScore={phase2Ready ? 0.85 : 0.60}
                preliminaryInsights={processedDocuments.flatMap(doc => 
                  doc.keyInsights.map(insight => ({
                    type: 'insight',
                    title: insight,
                    confidence: 0.7,
                  }))
                )}
                onInitiateProfessionalValidation={handleInitiateProfessionalValidation}
              />
            )}

            {currentView === 'phase2' && (
              <ProfessionalValidation
                sessionId={sessionId}
                analysisObjectives={{
                  primaryQuestion: `M&A Analysis for ${processedDocuments.length} document(s)`,
                  strategicRationale: 'Strategic acquisition evaluation and validation',
                  focusAreas: ['Financial Analysis', 'Risk Assessment', 'Strategic Fit', 'Integration Planning']
                }}
                optimizedContext={{
                  documentSummaries: processedDocuments.map(doc => 
                    `${doc.fileName}: ${doc.documentSummary || 'Professional document analysis'}`
                  ),
                  keyDataPoints: processedDocuments.reduce((acc, doc) => ({
                    ...acc,
                    [doc.fileName]: doc.extractedData
                  }), {}),
                  keyInsights: processedDocuments.flatMap(doc => doc.keyInsights)
                }}
                onValidationComplete={handleValidationComplete}
                onError={handleValidationError}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Session Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Documents Processed</span>
                  <Badge variant="outline">{processedDocuments.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Phase</span>
                  <Badge className="bg-success-green-100 text-success-green-800">
                    1 (FREE)
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Cost So Far</span>
                  <span className="font-medium text-success-green-600">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Phase 2 Ready</span>
                  <Badge className={phase2Ready ? 'bg-success-green-100 text-success-green-800' : 'bg-surface'}>
                    {phase2Ready ? 'Yes' : 'Not Yet'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help & Instructions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">
                      <strong>Upload:</strong> Add Excel models, PDFs, or CSV files for FREE analysis
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">
                      <strong>Explore:</strong> Chat with Claude about your documents and analysis
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-text-secondary">
                      <strong>Validate:</strong> Upgrade to professional validation ($500 per professional validation) for adversarial analysis
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 Preview */}
            {(processedDocuments.length > 0 || phase2Ready) && (
              <Alert>
                <Zap className="w-4 h-4" />
                <AlertDescription>
                  <strong>Ready for professional validation?</strong>
                  <br />
                  Phase 2 includes Skeptic Agent + Validator Agent analysis with Professional Quality Score ≥85%.
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-auto p-0 text-primary"
                    onClick={() => setCurrentView('transition')}
                  >
                    Learn More →
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Development Notice */}
        <Alert className="mt-8 border-prism-blue-200 bg-prism-blue-50">
          <AlertDescription>
            <strong>Development Testing:</strong> This is a functional Phase 1 implementation. 
            Document processing is simulated, and Claude API integration is ready with your API key. 
            The Phase 2 multi-agent system (Skeptic + Validator agents) will be implemented next.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}