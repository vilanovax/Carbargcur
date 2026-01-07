'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, Compass, CheckCircle2, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import type { FocusedProfile, Assessments } from '@/lib/onboarding';
import { getDISCStyleInfo } from '@/lib/assessment/disc-types';
import { getHollandCareerFitInfo } from '@/lib/assessment/holland-types';
import { traitInfo } from '@/lib/assessment/questions';

type CompletedTest = {
  id: string;
  title: string;
  result: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

/**
 * Get list of completed tests from profile
 */
function getCompletedTests(profile: FocusedProfile): CompletedTest[] {
  const tests: CompletedTest[] = [];

  // MBTI (from personality)
  if (profile.personality?.quick || profile.personality?.full) {
    const personalityData = profile.personality.full || profile.personality.quick;
    const styles = personalityData?.styles || [];
    const resultLabel = styles.length > 0
      ? styles.map(s => traitInfo[s]?.label || s).join(' + ')
      : 'تکمیل شده';

    tests.push({
      id: 'mbti',
      title: 'سبک کاری (MBTI)',
      result: resultLabel,
      icon: <Brain className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    });
  }

  // DISC
  if (profile.assessments?.disc) {
    const discResult = profile.assessments.disc;
    const primaryInfo = getDISCStyleInfo(discResult.primary);
    const secondaryInfo = discResult.secondary ? getDISCStyleInfo(discResult.secondary) : null;
    const resultLabel = secondaryInfo
      ? `${primaryInfo.label} + ${secondaryInfo.label}`
      : primaryInfo.label;

    tests.push({
      id: 'disc',
      title: 'رفتار حرفه‌ای (DISC)',
      result: resultLabel,
      icon: <Users className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    });
  }

  // Holland (quick or full)
  if (profile.assessments?.hollandFull || profile.assessments?.holland) {
    const hollandResult = profile.assessments.hollandFull || profile.assessments.holland;
    if (hollandResult) {
      const primaryInfo = getHollandCareerFitInfo(hollandResult.primary);
      const secondaryInfo = hollandResult.secondary ? getHollandCareerFitInfo(hollandResult.secondary) : null;
      const resultLabel = secondaryInfo
        ? `${primaryInfo.label} + ${secondaryInfo.label}`
        : primaryInfo.label;

      tests.push({
        id: 'holland',
        title: 'مسیر شغلی (هالند)',
        result: resultLabel,
        icon: <Compass className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      });
    }
  }

  return tests;
}

/**
 * Calculate test contribution to profile strength
 */
function calculateTestContribution(profile: FocusedProfile): number {
  let contribution = 0;

  if (profile.personality?.quick || profile.personality?.full) {
    contribution += 7;
  }
  if (profile.assessments?.disc) {
    contribution += 7;
  }
  if (profile.assessments?.holland || profile.assessments?.hollandFull) {
    contribution += 8;
  }

  return contribution;
}

/**
 * Get next recommended test
 */
function getNextRecommendedTest(profile: FocusedProfile): {
  id: string;
  title: string;
  description: string;
  duration: string;
  href: string;
  icon: React.ReactNode;
  color: string;
} | null {
  // Priority: MBTI → DISC → Holland

  if (!profile.personality?.quick && !profile.personality?.full) {
    return {
      id: 'mbti',
      title: 'آزمون سبک کاری (MBTI)',
      description: 'سبک تفکر و تصمیم‌گیری شما را مشخص می‌کند',
      duration: '۳ دقیقه',
      href: '/app/personality',
      icon: <Brain className="h-5 w-5" />,
      color: 'blue',
    };
  }

  if (!profile.assessments?.disc) {
    return {
      id: 'disc',
      title: 'آزمون رفتار حرفه‌ای (DISC)',
      description: 'رفتار کاری و تعامل تیمی شما را نشان می‌دهد',
      duration: '۴ دقیقه',
      href: '/app/assessments/disc',
      icon: <Users className="h-5 w-5" />,
      color: 'purple',
    };
  }

  if (!profile.assessments?.holland && !profile.assessments?.hollandFull) {
    return {
      id: 'holland',
      title: 'آزمون مسیر شغلی (هالند)',
      description: 'مسیرهای شغلی مناسب شما را پیشنهاد می‌دهد',
      duration: '۴ دقیقه',
      href: '/app/assessments/holland',
      icon: <Compass className="h-5 w-5" />,
      color: 'green',
    };
  }

  // All tests completed - suggest full Holland if not done
  if (!profile.assessments?.hollandFull && profile.assessments?.holland) {
    return {
      id: 'holland-full',
      title: 'آزمون جامع مسیر شغلی',
      description: 'نقش‌های شغلی مشخص در حوزه مالی را پیشنهاد می‌دهد',
      duration: '۸ دقیقه',
      href: '/app/assessments/holland-full',
      icon: <Compass className="h-5 w-5" />,
      color: 'green',
    };
  }

  return null;
}

// ============================================
// WIDGET 1: Completed Tests Widget
// ============================================
interface CompletedTestsWidgetProps {
  profile: FocusedProfile;
}

export function CompletedTestsWidget({ profile }: CompletedTestsWidgetProps) {
  const completedTests = getCompletedTests(profile);

  if (completedTests.length === 0) {
    // Empty state
    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-slate-400" />
            آزمون‌های حرفه‌ای
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Brain className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              هنوز آزمونی انجام نداده‌اید
            </p>
            <p className="text-xs text-muted-foreground">
              آزمون‌ها به کارفرما کمک می‌کنند شما را بهتر بشناسند
            </p>
          </div>
          <Button asChild className="w-full" variant="outline">
            <Link href="/app/assessments">
              شروع اولین آزمون (۳ دقیقه)
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          شناخت حرفه‌ای شما
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
            {completedTests.length} آزمون
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedTests.slice(0, 3).map((test) => (
          <div
            key={test.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100"
          >
            <div className={`w-8 h-8 ${test.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
              <span className={test.color}>{test.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{test.title}</p>
              <p className="text-xs text-muted-foreground truncate">{test.result}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          </div>
        ))}

        <Button asChild variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Link href="/app/assessments">
            مشاهده جزئیات آزمون‌ها
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// WIDGET 2: Test Impact Indicator
// ============================================
interface TestImpactIndicatorProps {
  profile: FocusedProfile;
}

export function TestImpactIndicator({ profile }: TestImpactIndicatorProps) {
  const contribution = calculateTestContribution(profile);

  if (contribution === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <Sparkles className="h-5 w-5 text-green-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">
          آزمون‌ها +{contribution}٪ به قدرت پروفایل شما اضافه کرده‌اند
        </p>
        <p className="text-xs text-green-600">
          نتایج آزمون‌ها Matching دقیق‌تر را ممکن می‌کنند
        </p>
      </div>
    </div>
  );
}

// ============================================
// WIDGET 3: Smart Test Recommendation
// ============================================
interface TestRecommendationCardProps {
  profile: FocusedProfile;
}

export function TestRecommendationCard({ profile }: TestRecommendationCardProps) {
  const recommendation = getNextRecommendedTest(profile);

  if (!recommendation) return null;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
  };

  const colors = colorClasses[recommendation.color as keyof typeof colorClasses];

  return (
    <Card className={`shadow-sm ${colors.border} ${colors.bg}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
            <span className={colors.iconText}>{recommendation.icon}</span>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                پیشنهاد هوشمند برای شما
              </p>
              <h3 className="text-base font-bold text-slate-800">
                {recommendation.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {recommendation.description}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>زمان: {recommendation.duration}</span>
              </div>
              <Button asChild size="sm" className={colors.button}>
                <Link href={recommendation.href}>
                  شروع آزمون
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Combined Export for Dashboard
// ============================================
interface AssessmentWidgetsProps {
  profile: FocusedProfile;
  showRecommendation?: boolean;
}

export function AssessmentWidgets({ profile, showRecommendation = true }: AssessmentWidgetsProps) {
  const completedTests = getCompletedTests(profile);
  const hasTests = completedTests.length > 0;

  return (
    <div className="space-y-4">
      {/* Test Impact - only show if tests completed */}
      {hasTests && <TestImpactIndicator profile={profile} />}

      {/* Completed Tests Widget */}
      <CompletedTestsWidget profile={profile} />

      {/* Recommendation - only if not all tests done */}
      {showRecommendation && <TestRecommendationCard profile={profile} />}
    </div>
  );
}
