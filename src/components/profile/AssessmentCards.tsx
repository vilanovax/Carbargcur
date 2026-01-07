/**
 * Assessment Cards for Public Profile
 *
 * Displays DISC and Holland assessment results in an attractive,
 * employer-friendly format for the public profile page.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  TrendingUp,
  Briefcase,
  Brain,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { DISCAssessmentResult, HollandAssessmentResult } from "@/lib/onboarding";
import { DISC_STYLES, type DISCStyle } from "@/lib/assessment/disc-types";
import { HOLLAND_CAREER_FITS, type HollandCareerFit } from "@/lib/assessment/holland-types";
import {
  generateCompactDISCExplanation,
  generateCompactHollandExplanation,
  generateDISCExplanation,
  generateHollandExplanation,
} from "@/lib/assessment/AIExplanationEngine";

// ============================================
// DISC CARD
// ============================================

interface DISCCardProps {
  result: DISCAssessmentResult;
  variant?: 'compact' | 'full';
}

const DISC_ICONS: Record<DISCStyle, typeof Target> = {
  'result-oriented': Target,
  'people-oriented': Users,
  'stable': CheckCircle2,
  'precise': Brain,
};

const DISC_COLORS: Record<DISCStyle, string> = {
  'result-oriented': 'bg-red-100 text-red-700 border-red-200',
  'people-oriented': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'stable': 'bg-green-100 text-green-700 border-green-200',
  'precise': 'bg-blue-100 text-blue-700 border-blue-200',
};

export function DISCCard({ result, variant = 'compact' }: DISCCardProps) {
  const styleInfo = DISC_STYLES[result.primary];
  const Icon = DISC_ICONS[result.primary];
  const colorClass = DISC_COLORS[result.primary];

  if (variant === 'compact') {
    const compact = generateCompactDISCExplanation(result);

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] px-2 py-0">
                  سبک رفتاری
                </Badge>
              </div>
              <h3 className="font-bold text-lg mb-1">{compact.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {compact.subtitle}
              </p>
              {compact.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {compact.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-xs bg-secondary px-2 py-1 rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant with detailed explanation
  const explanation = generateDISCExplanation(result);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="block">{styleInfo.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                سبک رفتاری حرفه‌ای
              </span>
            </div>
          </CardTitle>
          <Badge variant="outline">DISC</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed">
          {explanation.summary}
        </p>

        {/* Team Dynamics */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            در تیم
          </h4>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">قوت: </span>
            {explanation.teamDynamics.strength}
          </p>
        </div>

        {/* Career Suggestions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            نقش‌های پیشنهادی
          </h4>
          <div className="flex flex-wrap gap-2">
            {explanation.careerSuggestions.slice(0, 3).map((career, i) => (
              <Badge
                key={i}
                variant={career.fit === 'high' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {career.role}
              </Badge>
            ))}
          </div>
        </div>

        {/* For Employers Note */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">برای کارفرما: </span>
            {explanation.forEmployers}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// HOLLAND CARD
// ============================================

interface HollandCardProps {
  result: HollandAssessmentResult;
  variant?: 'compact' | 'full';
}

const HOLLAND_ICONS: Record<HollandCareerFit, typeof Target> = {
  'practical': Target,
  'analytical': Brain,
  'creative': Sparkles,
  'social': Users,
  'enterprising': TrendingUp,
  'conventional': Briefcase,
};

const HOLLAND_COLORS: Record<HollandCareerFit, string> = {
  'practical': 'bg-orange-100 text-orange-700 border-orange-200',
  'analytical': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'creative': 'bg-pink-100 text-pink-700 border-pink-200',
  'social': 'bg-teal-100 text-teal-700 border-teal-200',
  'enterprising': 'bg-amber-100 text-amber-700 border-amber-200',
  'conventional': 'bg-slate-100 text-slate-700 border-slate-200',
};

export function HollandCard({ result, variant = 'compact' }: HollandCardProps) {
  const fitInfo = HOLLAND_CAREER_FITS[result.primary];
  const Icon = HOLLAND_ICONS[result.primary];
  const colorClass = HOLLAND_COLORS[result.primary];

  if (variant === 'compact') {
    const compact = generateCompactHollandExplanation(result);

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] px-2 py-0">
                  مسیر شغلی
                </Badge>
              </div>
              <h3 className="font-bold text-lg mb-1">{compact.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {compact.subtitle}
              </p>
              {compact.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {compact.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-xs bg-secondary px-2 py-1 rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  const explanation = generateHollandExplanation(result);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="block">{fitInfo.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                تناسب شغلی
              </span>
            </div>
          </CardTitle>
          <Badge variant="outline">Holland</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed">
          {explanation.summary}
        </p>

        {/* Team Dynamics */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            در تیم
          </h4>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">قوت: </span>
            {explanation.teamDynamics.strength}
          </p>
        </div>

        {/* Career Suggestions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            نقش‌های پیشنهادی
          </h4>
          <div className="flex flex-wrap gap-2">
            {explanation.careerSuggestions.slice(0, 3).map((career, i) => (
              <Badge
                key={i}
                variant={career.fit === 'high' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {career.role}
              </Badge>
            ))}
          </div>
        </div>

        {/* For Employers Note */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">برای کارفرما: </span>
            {explanation.forEmployers}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMBINED ASSESSMENTS SECTION
// ============================================

interface AssessmentsSectionProps {
  disc?: DISCAssessmentResult;
  holland?: HollandAssessmentResult;
  variant?: 'compact' | 'full';
}

export function AssessmentsSection({ disc, holland, variant = 'compact' }: AssessmentsSectionProps) {
  const hasAny = disc || holland;

  if (!hasAny) return null;

  return (
    <Card className="shadow-sm bg-gradient-to-br from-primary/5 to-background border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          شناخت رفتاری
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          بر اساس آزمون‌های حرفه‌ای کاربرگ
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {disc && <DISCCard result={disc} variant={variant} />}
        {holland && <HollandCard result={holland} variant={variant} />}
      </CardContent>
    </Card>
  );
}

// ============================================
// INLINE BADGE FOR HEADER
// ============================================

interface AssessmentBadgesProps {
  disc?: DISCAssessmentResult;
  holland?: HollandAssessmentResult;
}

export function AssessmentBadges({ disc, holland }: AssessmentBadgesProps) {
  if (!disc && !holland) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {disc && (
        <Badge
          variant="secondary"
          className={`text-xs ${DISC_COLORS[disc.primary].replace('border-', '')}`}
        >
          {DISC_STYLES[disc.primary].label}
        </Badge>
      )}
      {holland && (
        <Badge
          variant="secondary"
          className={`text-xs ${HOLLAND_COLORS[holland.primary].replace('border-', '')}`}
        >
          {HOLLAND_CAREER_FITS[holland.primary].label}
        </Badge>
      )}
    </div>
  );
}
