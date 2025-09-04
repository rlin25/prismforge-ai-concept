'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { formatProfessionalQualityScore, isProfessionalQuality } from '@/lib/utils';

interface ProfessionalQualityScoreProps {
  score?: number;
  breakdown?: {
    internalConsistency?: number;
    evidenceStrength?: number;
    recommendationLogic?: number;
  };
  methodologyApplied?: boolean;
  qualityAssurancePassed?: boolean;
  className?: string;
  showBreakdown?: boolean;
}

export function ProfessionalQualityScore({
  score,
  breakdown,
  methodologyApplied = true,
  qualityAssurancePassed = true,
  className = '',
  showBreakdown = false,
}: ProfessionalQualityScoreProps) {
  if (!score) {
    return (
      <div className={`text-text-tertiary ${className}`}>
        <span className="text-sm">Professional Quality Score: Calculating...</span>
      </div>
    );
  }

  const { formatted, status, className: scoreClassName } = formatProfessionalQualityScore(score);
  const isProfessional = isProfessionalQuality(score);

  const getStatusIcon = () => {
    switch (status) {
      case 'professional':
        return <CheckCircle className="w-4 h-4 text-success-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-amber-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-error-red-600" />;
    }
  };

  const getStatusBadge = () => {
    if (isProfessional) {
      return (
        <Badge className="bg-success-green-100 text-success-green-800 border-success-green-200">
          ≥85% Professional Standard
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-warning-amber-700 border-warning-amber-300">
          Below Professional Threshold
        </Badge>
      );
    }
  };

  if (showBreakdown && breakdown) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span>Professional Quality Assessment</span>
            </div>
            <span className={scoreClassName}>{formatted}</span>
          </CardTitle>
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <div className="text-xs text-text-tertiary">
              Internal Methodology Applied
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Overall Quality Score</span>
              <span className={scoreClassName}>{formatted}</span>
            </div>
            <Progress value={score * 100} className="h-2" />
          </div>

          {/* Breakdown Metrics */}
          <div className="space-y-3">
            {breakdown.internalConsistency !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Internal Consistency</span>
                  <span className={formatProfessionalQualityScore(breakdown.internalConsistency).className}>
                    {formatProfessionalQualityScore(breakdown.internalConsistency).formatted}
                  </span>
                </div>
                <Progress value={breakdown.internalConsistency * 100} className="h-1" />
              </div>
            )}

            {breakdown.evidenceStrength !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Evidence Strength</span>
                  <span className={formatProfessionalQualityScore(breakdown.evidenceStrength).className}>
                    {formatProfessionalQualityScore(breakdown.evidenceStrength).formatted}
                  </span>
                </div>
                <Progress value={breakdown.evidenceStrength * 100} className="h-1" />
              </div>
            )}

            {breakdown.recommendationLogic !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Recommendation Logic</span>
                  <span className={formatProfessionalQualityScore(breakdown.recommendationLogic).className}>
                    {formatProfessionalQualityScore(breakdown.recommendationLogic).formatted}
                  </span>
                </div>
                <Progress value={breakdown.recommendationLogic * 100} className="h-1" />
              </div>
            )}
          </div>

          {/* Quality Assurance Indicators */}
          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${methodologyApplied ? 'bg-success-green-500' : 'bg-error-red-500'}`} />
                <span className="text-text-secondary">Methodology Applied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${qualityAssurancePassed ? 'bg-success-green-500' : 'bg-error-red-500'}`} />
                <span className="text-text-secondary">QA Passed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className="text-sm text-text-secondary">Professional Quality Score:</span>
      <span className={scoreClassName}>{formatted}</span>
      {isProfessional && (
        <Badge className="bg-success-green-100 text-success-green-800 border-success-green-200">
          Professional
        </Badge>
      )}
    </div>
  );
}