'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Eye, 
  Shield, 
  Zap, 
  Clock, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { cn, formatTokenUsage, formatProcessingTime, getAgentStatusColor } from '@/lib/utils';
import type { AgentCard as AgentCardType, Finding } from '@/types/database.types';

interface AgentCardProps {
  agent: AgentCardType;
  className?: string;
  showExpandedDetails?: boolean;
}

export function AgentCard({ agent, className, showExpandedDetails = false }: AgentCardProps) {
  const getAgentIcon = () => {
    switch (agent.agentType) {
      case 'skeptic':
        return <Shield className="w-5 h-5 text-skeptic-blue-600" />;
      case 'validator':
        return <Eye className="w-5 h-5 text-validator-blue-600" />;
      case 'synthesis':
        return <Zap className="w-5 h-5 text-primary" />;
    }
  };

  const getAgentTitle = () => {
    switch (agent.agentType) {
      case 'skeptic':
        return 'Skeptic Agent';
      case 'validator':
        return 'Validator Agent';
      case 'synthesis':
        return 'Synthesis Agent';
    }
  };

  const getAgentDescription = () => {
    switch (agent.agentType) {
      case 'skeptic':
        return 'Adversarial analysis identifying risks, inconsistencies, and potential issues';
      case 'validator':
        return 'Strategic validation balancing opportunities against identified risks';
      case 'synthesis':
        return 'Comprehensive synthesis with final recommendations and quality assessment';
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case 'idle':
        return 'text-text-tertiary';
      case 'processing':
        return 'text-prism-blue-600';
      case 'complete':
        return 'text-success-green-600';
      case 'error':
        return 'text-error-red-600';
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'idle':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Target className="w-4 h-4 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getFindingIcon = (finding: Finding) => {
    switch (finding.type) {
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-error-red-500" />;
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-success-green-500" />;
      case 'validation':
        return <CheckCircle className="w-4 h-4 text-validator-blue-500" />;
      case 'concern':
        return <AlertTriangle className="w-4 h-4 text-warning-amber-500" />;
    }
  };

  const getFindingBadgeColor = (finding: Finding) => {
    switch (finding.impact) {
      case 'high':
        return 'bg-error-red-100 text-error-red-800 border-error-red-200';
      case 'medium':
        return 'bg-warning-amber-100 text-warning-amber-800 border-warning-amber-200';
      case 'low':
        return 'bg-surface text-text-secondary border-border';
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200',
      getAgentStatusColor(agent.status),
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getAgentIcon()}
            <span className="text-lg">{getAgentTitle()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
            {getStatusIcon()}
          </div>
        </CardTitle>
        <p className="text-sm text-text-secondary">
          {getAgentDescription()}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress and Current Task */}
        {agent.status === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Progress</span>
              <span className="text-text-primary font-medium">{agent.progress}%</span>
            </div>
            <Progress value={agent.progress} className="h-2" />
            {agent.currentTask && (
              <p className="text-sm text-text-secondary animate-pulse">
                {agent.currentTask}
              </p>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-text-tertiary">Token Usage</span>
            <p className="font-medium text-text-primary">
              {formatTokenUsage(agent.tokenUsage, agent.tokenBudget)}
            </p>
            <Progress 
              value={(agent.tokenUsage / agent.tokenBudget) * 100} 
              className="h-1"
            />
          </div>
          <div className="space-y-1">
            <span className="text-text-tertiary">Processing Time</span>
            <p className="font-medium text-text-primary">
              {formatProcessingTime(agent.processingTime)}
            </p>
          </div>
        </div>

        {/* Confidence Score */}
        {agent.confidenceScore && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Confidence Score</span>
              <span className="font-medium text-text-primary">
                {(agent.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={agent.confidenceScore * 100} className="h-2" />
          </div>
        )}

        {/* Findings */}
        {agent.findings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">
                Findings ({agent.findings.length})
              </span>
              {showExpandedDetails && (
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {showExpandedDetails ? (
              <Accordion type="single" collapsible>
                <AccordionItem value="findings">
                  <AccordionTrigger className="text-sm">
                    Detailed Findings
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {agent.findings.map((finding) => (
                        <div key={finding.id} className="border border-border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getFindingIcon(finding)}
                              <span className="font-medium text-text-primary">
                                {finding.title}
                              </span>
                            </div>
                            <Badge className={getFindingBadgeColor(finding)}>
                              {finding.impact.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {finding.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-tertiary">
                              {finding.category}
                            </span>
                            <span className="text-text-tertiary">
                              {(finding.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="space-y-2">
                {agent.findings.slice(0, 2).map((finding) => (
                  <div key={finding.id} className="flex items-center space-x-2 text-sm">
                    {getFindingIcon(finding)}
                    <span className="text-text-secondary truncate">
                      {finding.title}
                    </span>
                    <Badge className={getFindingBadgeColor(finding)}>
                      {finding.impact}
                    </Badge>
                  </div>
                ))}
                {agent.findings.length > 2 && (
                  <p className="text-xs text-text-tertiary">
                    +{agent.findings.length - 2} more findings
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}