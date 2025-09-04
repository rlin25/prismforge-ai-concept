'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Zap,
  Brain,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  Award,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalValidationProps {
  sessionId: string;
  analysisObjectives: {
    primaryQuestion: string;
    strategicRationale?: string;
    focusAreas: string[];
  };
  optimizedContext: {
    documentSummaries: string[];
    keyDataPoints: Record<string, any>;
    keyInsights: string[];
  };
  onValidationComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface AgentStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
  professionalQualityScore?: number;
  professionalStandardMet: boolean;
  processingTimeMs?: number;
  confidenceScore?: number;
}

interface ValidationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  overallProgress: number;
  currentAgent: 'skeptic' | 'validator' | 'synthesis' | null;
  professionalQualityScore?: number;
  professionalStandardMet: boolean;
  agents: {
    skeptic: AgentStatus;
    validator: AgentStatus;
    synthesis: AgentStatus;
  };
  tokenUsage: {
    totalUsed: number;
    totalBudget: number;
    utilizationPercentage: number;
  };
  valueDelivery?: {
    professionalStandardMet: boolean;
    valueJustification: string;
    qualityScore: number;
  };
}

export function ProfessionalValidation({
  sessionId,
  analysisObjectives,
  optimizedContext,
  onValidationComplete,
  onError
}: ProfessionalValidationProps) {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    status: 'pending',
    overallProgress: 0,
    currentAgent: null,
    professionalStandardMet: false,
    agents: {
      skeptic: { status: 'pending', progress: 0, professionalStandardMet: false },
      validator: { status: 'pending', progress: 0, professionalStandardMet: false },
      synthesis: { status: 'pending', progress: 0, professionalStandardMet: false }
    },
    tokenUsage: {
      totalUsed: 0,
      totalBudget: 80000,
      utilizationPercentage: 0
    }
  });

  const [isValidating, setIsValidating] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Start professional multi-agent validation ($500 per professional validation)
   */
  const startValidation = async () => {
    try {
      setIsValidating(true);
      setError(null);
      setStartTime(Date.now());
      
      const response = await fetch('/api/phase2/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          analysisObjectives,
          optimizedContext,
          professionalValidationRequested: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.migrationRequired) {
          throw new Error('Phase 2 database migration required. Please run the migration in Supabase SQL Editor first.');
        }
        throw new Error(data.message || 'Professional validation failed');
      }

      // Get execution ID for real-time updates
      const statusResponse = await fetch(`/api/phase2/validate?sessionId=${sessionId}`);
      const statusData = await statusResponse.json();
      
      if (statusData.executionId) {
        setExecutionId(statusData.executionId);
        startRealTimeUpdates(statusData.executionId);
      }

      if (data.result) {
        setValidationResult(data.result);
        onValidationComplete?.(data.result);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsValidating(false);
    }
  };

  /**
   * Start real-time SSE updates for professional validation progress
   */
  const startRealTimeUpdates = (execId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/phase2/updates?executionId=${execId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        switch (update.type) {
          case 'professional_status_update':
            setValidationStatus(prev => ({
              ...prev,
              status: update.status,
              overallProgress: update.overallProgress,
              currentAgent: update.currentAgent,
              professionalQualityScore: update.professionalQualityScore,
              professionalStandardMet: update.professionalStandardMet,
              agents: update.agents,
              tokenUsage: update.tokenUsage,
              valueDelivery: update.valueDelivery
            }));
            break;

          case 'professional_validation_complete':
            setValidationStatus(prev => ({
              ...prev,
              status: 'completed',
              overallProgress: 100,
              professionalQualityScore: update.professionalQualityScore,
              professionalStandardMet: update.professionalStandardMet
            }));
            setValidationResult(update);
            setIsValidating(false);
            onValidationComplete?.(update);
            eventSource.close();
            break;

          case 'professional_error':
            setError(update.message || 'Professional validation error occurred');
            setIsValidating(false);
            eventSource.close();
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE update:', err);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
      
      // Attempt to reconnect after delay
      setTimeout(() => {
        if (isValidating && !validationResult) {
          startRealTimeUpdates(execId);
        }
      }, 5000);
    };
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getAgentIcon = (agentType: 'skeptic' | 'validator' | 'synthesis') => {
    switch (agentType) {
      case 'skeptic':
        return <AlertTriangle className="w-5 h-5" />;
      case 'validator':
        return <Target className="w-5 h-5" />;
      case 'synthesis':
        return <Brain className="w-5 h-5" />;
    }
  };

  const getAgentName = (agentType: 'skeptic' | 'validator' | 'synthesis') => {
    switch (agentType) {
      case 'skeptic':
        return 'Skeptic Agent';
      case 'validator':
        return 'Validator Agent';
      case 'synthesis':
        return 'Synthesis Agent';
    }
  };

  const getAgentDescription = (agentType: 'skeptic' | 'validator' | 'synthesis') => {
    switch (agentType) {
      case 'skeptic':
        return 'Professional risk identification and assumption questioning';
      case 'validator':
        return 'Strategic assessment and opportunity validation';
      case 'synthesis':
        return 'Executive summary and final recommendations';
    }
  };

  const formatDuration = (startTime: number) => {
    const duration = Date.now() - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (validationResult) {
    return (
      <div className="space-y-6">
        {/* Professional Validation Complete */}
        <Card className="border-success-green-200 bg-success-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-green-600" />
              </div>
              <div>
                <CardTitle className="text-success-green-800">
                  Professional Validation Complete
                </CardTitle>
                <p className="text-sm text-success-green-600 mt-1">
                  $500 Professional Multi-Agent Analysis Delivered
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Professional Quality Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Professional Quality Score</span>
                  <Badge className={cn(
                    "font-semibold",
                    validationStatus.professionalStandardMet
                      ? "bg-success-green-100 text-success-green-800"
                      : "bg-warning-amber-100 text-warning-amber-800"
                  )}>
                    {Math.round((validationStatus.professionalQualityScore || 0) * 100)}%
                  </Badge>
                </div>
                <Progress 
                  value={(validationStatus.professionalQualityScore || 0) * 100}
                  className="h-2"
                />
                <p className="text-xs text-text-tertiary">
                  {validationStatus.professionalStandardMet ? '≥85% Professional Standard Met' : 'Working toward 85% standard'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Processing Time</span>
                  <span className="font-medium">
                    {startTime ? formatDuration(startTime) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Token Efficiency</span>
                  <span className="font-medium">
                    {validationStatus.tokenUsage.utilizationPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            {validationResult.executiveSummary && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-text-primary mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-primary" />
                  Executive Summary
                </h4>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {validationResult.executiveSummary}
                </p>
              </div>
            )}

            {/* Final Recommendation */}
            {validationResult.recommendation && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-text-primary mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-primary" />
                  Final Recommendation
                </h4>
                <div className="flex items-center space-x-3">
                  <Badge 
                    className={cn(
                      "capitalize",
                      validationResult.recommendation === 'proceed' 
                        ? "bg-success-green-100 text-success-green-800"
                        : validationResult.recommendation === 'proceed_with_conditions'
                        ? "bg-warning-amber-100 text-warning-amber-800"
                        : "bg-error-red-100 text-error-red-800"
                    )}
                  >
                    {validationResult.recommendation.replace('_', ' ')}
                  </Badge>
                  {validationResult.confidenceScore && (
                    <span className="text-sm text-text-secondary">
                      Confidence: {Math.round(validationResult.confidenceScore * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Professional Value Delivered */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">Professional Value Delivered</span>
                </div>
                <Badge className="bg-primary text-primary-foreground">$500</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Board-ready professional analysis with ≥85% Professional Quality Score standard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Validation Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-primary text-xl">
                  Professional Multi-Agent Validation
                </CardTitle>
                <p className="text-text-secondary text-sm mt-1">
                  Adversarial M&A analysis by Skeptic Agent + Validator Agent + Synthesis
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">$500</div>
              <div className="text-xs text-text-secondary">per professional validation</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isValidating && !validationResult && (
            <>
              {/* Analysis Objectives */}
              <div className="space-y-3">
                <h4 className="font-semibold text-text-primary">Analysis Objectives</h4>
                <div className="bg-white rounded-lg p-4 border space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Primary Question:</span> {analysisObjectives.primaryQuestion}
                  </p>
                  {analysisObjectives.strategicRationale && (
                    <p className="text-sm">
                      <span className="font-medium">Strategic Rationale:</span> {analysisObjectives.strategicRationale}
                    </p>
                  )}
                  {analysisObjectives.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysisObjectives.focusAreas.map((area, index) => (
                        <Badge key={index} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Value Proposition */}
              <Alert>
                <TrendingUp className="w-4 h-4" />
                <AlertDescription>
                  <strong>Professional Quality Score Standard:</strong> This analysis will meet ≥85% professional methodology standards suitable for board presentation and investment committee review.
                </AlertDescription>
              </Alert>

              {/* Start Validation Button */}
              <Button 
                onClick={startValidation}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Professional Validation ($500)
              </Button>
            </>
          )}

          {/* Validation In Progress */}
          {isValidating && !validationResult && (
            <div className="space-y-4">
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Overall Progress</span>
                  <span className="font-medium">{validationStatus.overallProgress}%</span>
                </div>
                <Progress value={validationStatus.overallProgress} className="h-3" />
                <p className="text-xs text-text-tertiary">
                  Professional multi-agent analysis in progress • Target: &lt;30 seconds
                </p>
              </div>

              {/* Current Status */}
              {validationStatus.currentAgent && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <AlertDescription>
                    <strong>Active:</strong> {getAgentName(validationStatus.currentAgent)} - 
                    {validationStatus.agents[validationStatus.currentAgent]?.currentTask || 'Processing...'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Agent Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['skeptic', 'validator', 'synthesis'] as const).map((agentType) => {
                  const agent = validationStatus.agents[agentType];
                  const isActive = validationStatus.currentAgent === agentType;
                  
                  return (
                    <Card key={agentType} className={cn(
                      "transition-all duration-200",
                      isActive && "border-primary/40 bg-primary/5 shadow-lg",
                      agent.status === 'completed' && "border-success-green-200 bg-success-green-50"
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            agent.status === 'completed' ? "bg-success-green-100 text-success-green-600" :
                            isActive ? "bg-primary/10 text-primary" : "bg-surface text-text-tertiary"
                          )}>
                            {agent.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              getAgentIcon(agentType)
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm">{getAgentName(agentType)}</h4>
                            <p className="text-xs text-text-secondary truncate">
                              {getAgentDescription(agentType)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <Progress value={agent.progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-tertiary">{agent.progress}%</span>
                            {agent.status === 'completed' && agent.processingTimeMs && (
                              <span className="text-text-tertiary">
                                {Math.round(agent.processingTimeMs / 1000)}s
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Professional Quality Score */}
                        {agent.professionalQualityScore && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">Quality Score</span>
                            <Badge 
                              variant={agent.professionalStandardMet ? "default" : "secondary"}
                            >
                              {Math.round(agent.professionalQualityScore * 100)}%
                            </Badge>
                          </div>
                        )}

                        {/* Current Task */}
                        {agent.currentTask && agent.status === 'processing' && (
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {agent.currentTask}
                          </p>
                        )}

                        {/* Status Badge */}
                        <Badge 
                          variant={
                            agent.status === 'completed' ? 'default' :
                            agent.status === 'processing' ? 'secondary' :
                            'outline'
                          }
                          className="w-full justify-center"
                        >
                          {agent.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Token Usage */}
              <div className="bg-surface rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Token Budget Utilization</span>
                  <span className="font-medium">
                    {validationStatus.tokenUsage.totalUsed.toLocaleString()} / 80,000
                  </span>
                </div>
                <Progress value={validationStatus.tokenUsage.utilizationPercentage} className="h-2" />
                <p className="text-xs text-text-tertiary">
                  Professional budget management for $500 value delivery
                </p>
              </div>

              {/* Processing Time */}
              {startTime && (
                <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Processing Time: {formatDuration(startTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert className="border-error-red-200 bg-error-red-50">
              <AlertTriangle className="w-4 h-4 text-error-red-600" />
              <AlertDescription className="text-error-red-800">
                <strong>Professional Validation Error:</strong> {error}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2 h-auto p-0 text-error-red-600 hover:text-error-red-700"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}