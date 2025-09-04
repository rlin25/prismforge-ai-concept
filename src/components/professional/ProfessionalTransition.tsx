'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  Shield, 
  Eye, 
  Zap, 
  DollarSign, 
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalTransitionProps {
  sessionId: string;
  transitionReadiness: boolean;
  professionalQualityScore?: number;
  preliminaryInsights?: Array<{
    type: string;
    title: string;
    confidence: number;
  }>;
  onInitiateProfessionalValidation: () => void;
  className?: string;
}

export function ProfessionalTransition({
  sessionId,
  transitionReadiness,
  professionalQualityScore,
  preliminaryInsights = [],
  onInitiateProfessionalValidation,
  className,
}: ProfessionalTransitionProps) {
  const costPerValidation = 500; // $500 per professional validation
  const consultingAlternativeLow = 50000; // $50K
  const consultingAlternativeHigh = 150000; // $150K

  return (
    <Card className={cn('border-primary/20 shadow-professional-lg', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-lg text-text-primary">Professional Validation Ready</span>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Phase 2 Available
          </Badge>
        </CardTitle>
        <p className="text-text-secondary">
          Your document exploration has built sufficient context for professional multi-agent validation. 
          Upgrade to receive adversarial analysis with Professional Quality Score ≥85%.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transition Readiness Indicators */}
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">Readiness Assessment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-green-500" />
              <span className="text-sm text-text-secondary">Document context established</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-green-500" />
              <span className="text-sm text-text-secondary">Analysis objectives refined</span>
            </div>
            <div className="flex items-center space-x-2">
              {transitionReadiness ? (
                <CheckCircle className="w-4 h-4 text-success-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-warning-amber-500" />
              )}
              <span className="text-sm text-text-secondary">Validation readiness confirmed</span>
            </div>
            <div className="flex items-center space-x-2">
              {preliminaryInsights.length > 0 ? (
                <CheckCircle className="w-4 h-4 text-success-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-warning-amber-500" />
              )}
              <span className="text-sm text-text-secondary">
                {preliminaryInsights.length} preliminary insights identified
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Value Proposition */}
        <div className="space-y-4">
          <h4 className="font-medium text-text-primary">Professional Multi-Agent Validation</h4>
          
          {/* Agent Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-skeptic-blue-50 border border-skeptic-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-skeptic-blue-600" />
                <span className="font-medium text-skeptic-blue-800">Skeptic Agent</span>
              </div>
              <p className="text-xs text-skeptic-blue-700">
                35K tokens · Adversarial analysis identifying risks and inconsistencies
              </p>
            </div>
            
            <div className="bg-validator-blue-50 border border-validator-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-4 h-4 text-validator-blue-600" />
                <span className="font-medium text-validator-blue-800">Validator Agent</span>
              </div>
              <p className="text-xs text-validator-blue-700">
                35K tokens · Strategic validation balancing opportunities vs risks
              </p>
            </div>
            
            <div className="bg-prism-blue-50 border border-prism-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-prism-blue-600" />
                <span className="font-medium text-prism-blue-800">Synthesis Agent</span>
              </div>
              <p className="text-xs text-prism-blue-700">
                10K tokens · Comprehensive synthesis with quality assessment
              </p>
            </div>
          </div>

          {/* Professional Features */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h5 className="font-medium text-text-primary mb-3">Professional Features</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success-green-500" />
                <span className="text-text-secondary">Professional Quality Score ≥85%</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-green-500" />
                <span className="text-text-secondary">Board-ready deliverables</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-success-green-500" />
                <span className="text-text-secondary">Transparent methodology</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-success-green-500" />
                <span className="text-text-secondary">Real-time progress tracking</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Pricing and Value */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">Professional Validation Investment</h4>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Professional Quality Guaranteed
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-success-green-50 to-primary/5 border border-success-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-success-green-600" />
                <span className="text-xl font-semibold text-text-primary">
                  ${costPerValidation.toLocaleString()}
                </span>
                <span className="text-text-secondary">per professional validation</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-tertiary">vs Traditional Consulting</p>
                <p className="text-lg font-medium text-error-red-600">
                  ${consultingAlternativeLow.toLocaleString()} - ${consultingAlternativeHigh.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-success-green-700">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>80K total token allocation (35K + 35K + 10K)</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Professional methodology with quality assurance</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Immediate availability vs weeks of consulting engagement</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-text-tertiary mb-4">
              Risk-adjusted validation investment: <span className="font-medium">$500 vs $50,000-150,000 consulting mistake</span>
            </p>
            
            <Button 
              size="lg"
              onClick={onInitiateProfessionalValidation}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              disabled={!transitionReadiness}
            >
              <span className="mr-2">Initiate Professional Validation</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            {!transitionReadiness && (
              <p className="text-sm text-warning-amber-600 mt-2 flex items-center justify-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Complete document analysis to enable professional validation</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}