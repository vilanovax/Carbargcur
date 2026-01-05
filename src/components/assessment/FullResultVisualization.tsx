'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, FileText, User } from 'lucide-react';
import Link from 'next/link';
import type { FullTestResult } from '@/lib/personality';
import type { Dimension } from '@/lib/assessment/types';

interface FullResultVisualizationProps {
  result: FullTestResult;
}

type QualitativeLevel = 'low' | 'medium' | 'high';

interface DimensionVisualization {
  dimension: Dimension;
  label: string;
  score: number;
  level: QualitativeLevel;
  levelLabel: string;
}

/**
 * Convert percentage score (0-100) to qualitative level
 */
function getQualitativeLevel(score: number): { level: QualitativeLevel; label: string } {
  if (score <= 33) return { level: 'low', label: 'کم' };
  if (score <= 66) return { level: 'medium', label: 'متوسط' };
  return { level: 'high', label: 'بالا' };
}

/**
 * Get dimension label in Persian
 */
function getDimensionLabel(dimension: Dimension): string {
  const labels: Record<Dimension, string> = {
    'information-processing': 'پردازش اطلاعات',
    'decision-making': 'تصمیم‌گیری',
    'work-structure': 'ساختار کار',
    'collaboration-style': 'تعامل کاری',
  };
  return labels[dimension];
}

/**
 * Generate interpretation text based on dominant dimensions
 */
function generateInterpretation(dimensions: DimensionVisualization[]): string {
  const highDimensions = dimensions.filter(d => d.level === 'high');

  // Pattern matching for common combinations
  const hasHighAnalytical = highDimensions.some(d => d.dimension === 'information-processing');
  const hasHighStructure = highDimensions.some(d => d.dimension === 'work-structure');
  const hasHighCollaboration = highDimensions.some(d => d.dimension === 'collaboration-style');
  const hasHighDecision = highDimensions.some(d => d.dimension === 'decision-making');

  if (hasHighAnalytical && hasHighStructure) {
    return 'الگوی کلی سبک کاری شما نشان می‌دهد که در محیط‌های ساختارمند و مبتنی بر داده عملکرد بهتری دارید و در تحلیل دقیق اطلاعات توانمند هستید.';
  }

  if (hasHighCollaboration && hasHighDecision) {
    return 'شما در کار تیمی فعال هستید و در تصمیم‌گیری‌های گروهی نقش مؤثری ایفا می‌کنید. محیط‌های همکاری‌محور برای شما مناسب است.';
  }

  if (hasHighAnalytical && hasHighCollaboration) {
    return 'ترکیب تحلیل دقیق و همکاری تیمی نقطه قوت شماست. در پروژه‌های گروهی که نیاز به تحلیل دارند، عملکرد خوبی دارید.';
  }

  if (hasHighStructure && hasHighCollaboration) {
    return 'شما در تیم‌های سازمان‌یافته موفق‌ترید و قادرید در چارچوب‌های مشخص به‌خوبی همکاری کنید.';
  }

  // Generic fallback
  if (highDimensions.length > 0) {
    const topDim = highDimensions[0];
    return `سبک کاری شما در ${topDim.label} قوی است و این می‌تواند در نقش‌های مرتبط به شما کمک کند.`;
  }

  return 'سبک کاری شما متعادل است و می‌توانید در محیط‌های مختلف عملکرد مناسبی داشته باشید.';
}

/**
 * Simple Bar Chart component
 */
function SimpleBarChart({ dimensions }: { dimensions: DimensionVisualization[] }) {
  const maxScore = 100;

  return (
    <div className="space-y-4">
      {dimensions.map((dim) => {
        const percentage = (dim.score / maxScore) * 100;

        // Color based on level
        const barColor =
          dim.level === 'high' ? 'bg-indigo-500' :
          dim.level === 'medium' ? 'bg-blue-400' :
          'bg-slate-300';

        return (
          <div key={dim.dimension} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{dim.label}</span>
              <span className="text-slate-500 text-xs">{dim.levelLabel}</span>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-500 rounded-lg flex items-center justify-end px-3`}
                style={{ width: `${percentage}%` }}
              >
                {percentage > 20 && (
                  <span className="text-white text-xs font-medium">{dim.levelLabel}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FullResultVisualization({ result }: FullResultVisualizationProps) {
  // Prepare dimension data
  const dimensions: DimensionVisualization[] = Object.entries(result.scores).map(([dim, score]) => {
    const dimension = dim as Dimension;
    const { level, label: levelLabel } = getQualitativeLevel(score);

    return {
      dimension,
      label: getDimensionLabel(dimension),
      score,
      level,
      levelLabel,
    };
  });

  const interpretation = generateInterpretation(dimensions);

  return (
    <Card className="p-6 space-y-6 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">تحلیل سبک کاری شما</h3>
              <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                ارزیابی جامع
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              بر اساس آزمون جامع سبک کاری حرفه‌ای
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-900 text-xs">
            این تحلیل فقط برای شما قابل مشاهده است و در پروفایل عمومی نمایش داده نمی‌شود.
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">نمای کلی ترجیحات کاری</h4>
        </div>

        <SimpleBarChart dimensions={dimensions} />

        <p className="text-xs text-slate-500">
          این نمودار درصد یا نمره مطلق نیست؛ ترجیحات غالب شما را نشان می‌دهد.
        </p>
      </div>

      {/* Interpretation */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-slate-700 leading-relaxed">
          {interpretation}
        </p>
      </div>

      {/* Trust Copy */}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-600 text-center">
          نتایج آزمون به‌صورت خلاصه و بدون جزئیات عددی در پروفایل عمومی نمایش داده می‌شود.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <Link href="/app/profile" className="flex-1">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
            <User className="h-4 w-4" />
            مشاهده پروفایل عمومی
          </Button>
        </Link>
        <Link href="/app/resume" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="h-4 w-4" />
            دانلود رزومه
          </Button>
        </Link>
      </div>
    </Card>
  );
}
