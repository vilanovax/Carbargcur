/**
 * Match Result Card Component
 *
 * Displays job matching results with visual breakdown and explanations.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { MatchResult, MatchDimension } from "@/lib/matching/MatchingEngine";

// ============================================
// STATUS HELPERS
// ============================================

const STATUS_CONFIG = {
  excellent: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200',
    icon: CheckCircle2,
    label: 'عالی',
  },
  good: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    icon: CheckCircle2,
    label: 'خوب',
  },
  partial: {
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    icon: AlertCircle,
    label: 'متوسط',
  },
  weak: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200',
    icon: XCircle,
    label: 'ضعیف',
  },
  missing: {
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    icon: AlertTriangle,
    label: 'ناموجود',
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// ============================================
// DIMENSION ROW COMPONENT
// ============================================

interface DimensionRowProps {
  dimension: MatchDimension;
  isExpanded: boolean;
  onToggle: () => void;
}

function DimensionRow({ dimension, isExpanded, onToggle }: DimensionRowProps) {
  const config = STATUS_CONFIG[dimension.status];
  const StatusIcon = config.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>

        <div className="flex-1 text-right">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{dimension.name}</span>
            <span className={`text-sm font-bold ${getScoreColor(dimension.score)}`}>
              {dimension.score}%
            </span>
          </div>
          <div className="mt-1">
            <Progress
              value={dimension.score}
              className="h-1.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            وزن: {dimension.weight}%
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && dimension.details.length > 0 && (
        <div className="px-4 pb-3 pt-1 bg-slate-50 border-t">
          <ul className="space-y-1">
            {dimension.details.map((detail, i) => (
              <li key={i} className="text-xs text-slate-600">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface MatchResultCardProps {
  result: MatchResult;
  variant?: 'compact' | 'full';
  showDetails?: boolean;
}

export function MatchResultCard({
  result,
  variant = 'compact',
  showDetails = true,
}: MatchResultCardProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<string[]>([]);
  const overallConfig = STATUS_CONFIG[result.overallStatus];
  const OverallIcon = overallConfig.icon;

  const toggleDimension = (name: string) => {
    setExpandedDimensions(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  if (variant === 'compact') {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Score Circle */}
            <div className={`relative w-16 h-16 shrink-0`}>
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={result.overallScore >= 60 ? '#22c55e' : result.overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6"
                  strokeDasharray={`${result.overallScore * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </span>
              </div>
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-base truncate">{result.jobTitle}</h3>
              </div>

              <Badge className={`${overallConfig.bg} ${overallConfig.color} text-xs`}>
                {overallConfig.label}
              </Badge>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-2 mt-2">
                {result.strengths.slice(0, 2).map((s, i) => (
                  <span key={i} className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="shadow-md">
      {/* Header */}
      <CardHeader className={`${overallConfig.bg} border-b ${overallConfig.border}`}>
        <div className="flex items-center gap-4">
          {/* Large Score Circle */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="white"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke={result.overallScore >= 60 ? '#22c55e' : result.overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${result.overallScore * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </span>
              <span className="text-xs text-slate-500">امتیاز</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${overallConfig.bg} ${overallConfig.color}`}>
                <OverallIcon className="w-3 h-3 ml-1" />
                {overallConfig.label}
              </Badge>
            </div>
            <CardTitle className="text-xl">{result.jobTitle}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{result.recommendation}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Dimensions */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-2">جزئیات تطبیق</h4>
            {result.dimensions.map(dim => (
              <DimensionRow
                key={dim.nameEn}
                dimension={dim}
                isExpanded={expandedDimensions.includes(dim.nameEn)}
                onToggle={() => toggleDimension(dim.nameEn)}
              />
            ))}
          </div>
        )}

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.strengths.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3">
              <h5 className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                نقاط قوت
              </h5>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.gaps.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3">
              <h5 className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                فرصت‌های بهبود
              </h5>
              <ul className="space-y-1">
                {result.gaps.map((g, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MATCH LIST COMPONENT
// ============================================

interface MatchResultListProps {
  results: MatchResult[];
  onSelect?: (result: MatchResult) => void;
}

export function MatchResultList({ results, onSelect }: MatchResultListProps) {
  if (results.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">هیچ نتیجه تطبیقی یافت نشد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {results.map(result => (
        <div
          key={result.jobId}
          className={onSelect ? 'cursor-pointer' : ''}
          onClick={() => onSelect?.(result)}
        >
          <MatchResultCard result={result} variant="compact" />
        </div>
      ))}
    </div>
  );
}
