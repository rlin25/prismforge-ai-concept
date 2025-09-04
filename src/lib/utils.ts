import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Professional utility functions for PrismForge AI
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatProfessionalQualityScore(score: number): {
  formatted: string;
  status: 'professional' | 'warning' | 'error';
  className: string;
} {
  const percentage = score * 100;
  
  if (percentage >= 85) {
    return {
      formatted: `${percentage.toFixed(1)}%`,
      status: 'professional',
      className: 'text-success-green-600 font-semibold',
    };
  } else if (percentage >= 70) {
    return {
      formatted: `${percentage.toFixed(1)}%`,
      status: 'warning', 
      className: 'text-warning-amber-600 font-semibold',
    };
  } else {
    return {
      formatted: `${percentage.toFixed(1)}%`,
      status: 'error',
      className: 'text-error-red-600 font-semibold',
    };
  }
}

export function formatTokenUsage(used: number, budget: number): string {
  return `${used.toLocaleString()}/${budget.toLocaleString()} tokens`;
}

export function calculateTokenProgress(used: number, budget: number): number {
  return Math.min((used / budget) * 100, 100);
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function isProfessionalQuality(score: number): boolean {
  return score >= 0.85;
}

export function getAgentStatusColor(status: string): string {
  switch (status) {
    case 'idle':
      return 'bg-surface border-border';
    case 'processing':
      return 'bg-prism-blue-50 border-prism-blue-200';
    case 'complete':
      return 'bg-success-green-50 border-success-green-200';
    case 'error':
      return 'bg-error-red-50 border-error-red-200';
    default:
      return 'bg-surface border-border';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}