"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  Target,
} from "lucide-react";
import Link from "next/link";
import type { FocusedProfile } from "@/lib/onboarding";
import type { ProfileStrengthResult } from "@/lib/profileStrength";

interface ProfileStrengthBreakdownProps {
  profile: FocusedProfile;
  strength: ProfileStrengthResult;
  isOpen: boolean;
  onClose: () => void;
}

interface BlockItemProps {
  label: string;
  points: number;
  isComplete: boolean;
  link?: string;
}

function BlockItem({ label, points, isComplete, link }: BlockItemProps) {
  const content = (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-gray-400 shrink-0" />
        )}
        <span className={`text-sm ${isComplete ? "text-gray-900" : "text-gray-600"}`}>
          {label}
        </span>
      </div>
      <Badge
        variant={isComplete ? "default" : "outline"}
        className={isComplete ? "bg-green-600" : "border-gray-300 text-gray-600"}
      >
        {isComplete ? "✓" : "+"} {points}٪
      </Badge>
    </div>
  );

  if (link && !isComplete) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

interface ExpandableBlockProps {
  title: string;
  current: number;
  max: number;
  icon: string;
  items: Array<{ label: string; points: number; isComplete: boolean; link?: string }>;
  suggestion?: { text: string; link: string };
}

function ExpandableBlock({ title, current, max, icon, items, suggestion }: ExpandableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = (current / max) * 100;
  const isComplete = current === max;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className={`text-2xl ${
                isComplete ? "opacity-100" : "opacity-60"
              }`}
            >
              {icon}
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {current} از {max} امتیاز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-bold">
                {Math.round(percentage)}٪
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Progress Bar */}
        <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isComplete
                ? "bg-green-500"
                : percentage >= 60
                ? "bg-blue-500"
                : percentage >= 30
                ? "bg-amber-500"
                : "bg-gray-400"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-1">
            {items.map((item, index) => (
              <BlockItem key={index} {...item} />
            ))}

            {/* Suggestion CTA */}
            {suggestion && !isComplete && (
              <Link href={suggestion.link}>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {suggestion.text}
                    </span>
                    <ArrowLeft className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfileStrengthBreakdown({
  profile,
  strength,
  isOpen,
  onClose,
}: ProfileStrengthBreakdownProps) {
  if (!isOpen) return null;

  const { breakdown } = strength;

  // Calculate items for each block
  const baseSignalsItems = [
    {
      label: "تجربه کاری ۵ سال اخیر",
      points: 6,
      isComplete: !!profile.recentExperience?.role,
      link: "/app/profile/onboarding/step-1-basic",
    },
    {
      label: "تمرکز شغلی فعلی",
      points: 6,
      isComplete: !!profile.careerFocus,
      link: "/app/profile/onboarding/step-3-skills",
    },
    {
      label: "آخرین مدرک تحصیلی",
      points: 4,
      isComplete: !!profile.latestEducation?.degree,
      link: "/app/profile/onboarding/step-4-summary",
    },
    {
      label: "موقعیت مکانی",
      points: 4,
      isComplete: !!(profile.city || profile.recentExperience?.company),
      link: "/app/profile",
    },
  ];

  const skillsItems = [
    {
      label: "حداقل ۱ مهارت تخصصی",
      points: 8,
      isComplete: (profile.coreSkills?.length || 0) >= 1,
      link: "/app/profile/onboarding/step-2-status",
    },
    {
      label: "۲ مهارت تخصصی",
      points: 4,
      isComplete: (profile.coreSkills?.length || 0) >= 2,
      link: "/app/profile/onboarding/step-2-status",
    },
    {
      label: "سابقه کاری ثبت‌شده",
      points: 8,
      isComplete: !!profile.recentExperience?.role,
      link: "/app/profile",
    },
    {
      label: "به‌روزرسانی اخیر مهارت‌ها",
      points: 5,
      isComplete: breakdown.skillsExperience >= 25,
    },
  ];

  const assessmentItems = [
    {
      label: "MBTI سریع",
      points: 5,
      isComplete: !!profile.personality?.quick,
      link: "/app/personality/quick",
    },
    {
      label: "MBTI جامع",
      points: 5,
      isComplete: !!profile.personality?.full,
      link: "/app/personality/full",
    },
    {
      label: "DISC",
      points: 7,
      isComplete: !!profile.assessments?.disc,
      link: "/app/assessments/disc",
    },
    {
      label: "هالند سریع",
      points: 4,
      isComplete: !!profile.assessments?.holland,
      link: "/app/assessments/holland",
    },
    {
      label: "هالند جامع",
      points: 4,
      isComplete: !!profile.assessments?.hollandFull,
      link: "/app/assessments/holland-full",
    },
  ];

  const resumeItems = [
    {
      label: "رزومه ساخته شده",
      points: 10,
      isComplete: !!(profile.resumeUrl || profile.slug),
      link: "/app/resume",
    },
    {
      label: "رزومه قابل دانلود",
      points: 5,
      isComplete: !!profile.resumeUrl,
      link: "/app/resume",
    },
    {
      label: "اطلاعات کامل برای رزومه",
      points: 5,
      isComplete: breakdown.resume === 20,
    },
  ];

  const activityItems = [
    {
      label: "ویرایش پروفایل در ۳۰ روز اخیر",
      points: 4,
      isComplete: breakdown.activity >= 4,
      link: "/app/profile",
    },
    {
      label: "انجام اقدام پیشنهادی",
      points: 3,
      isComplete: breakdown.activity >= 7,
    },
    {
      label: "ورود منظم",
      points: 3,
      isComplete: breakdown.activity === 10,
    },
  ];

  // Top suggestions
  const topSuggestions = [];
  if (breakdown.assessments < 25) {
    const remaining = 25 - breakdown.assessments;
    topSuggestions.push({
      text: `تکمیل آزمون‌ها (+${remaining}٪)`,
      link: "/app/assessments",
    });
  }
  if (breakdown.skillsExperience < 25) {
    const remaining = 25 - breakdown.skillsExperience;
    topSuggestions.push({
      text: `به‌روزرسانی مهارت‌ها (+${Math.min(remaining, 12)}٪)`,
      link: "/app/profile/onboarding/step-2-status",
    });
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer/Sheet */}
      <div
        className={`
          fixed z-50 bg-white shadow-xl
          md:right-0 md:top-0 md:h-screen md:w-[500px]
          bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl md:rounded-none
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold">
                جزئیات قدرت پروفایل
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                این امتیاز بر اساس سیگنال‌های حرفه‌ای محاسبه می‌شود
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Total Score */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                امتیاز کلی
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {strength.percentage}٪
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-3">
          <ExpandableBlock
            title="اطلاعات پایه و سیگنالی"
            current={breakdown.baseSignals}
            max={20}
            icon="📋"
            items={baseSignalsItems}
            suggestion={
              breakdown.baseSignals < 20
                ? {
                    text: "تکمیل اطلاعات پایه",
                    link: "/app/profile/onboarding",
                  }
                : undefined
            }
          />

          <ExpandableBlock
            title="تجربه و مهارت‌ها"
            current={breakdown.skillsExperience}
            max={25}
            icon="⭐"
            items={skillsItems}
            suggestion={
              breakdown.skillsExperience < 25
                ? {
                    text: "افزودن مهارت یا تجربه",
                    link: "/app/profile",
                  }
                : undefined
            }
          />

          <ExpandableBlock
            title="آزمون‌های حرفه‌ای"
            current={breakdown.assessments}
            max={25}
            icon="🧠"
            items={assessmentItems}
            suggestion={
              breakdown.assessments < 25
                ? {
                    text: "انجام آزمون‌های باقی‌مانده",
                    link: "/app/assessments",
                  }
                : undefined
            }
          />

          <ExpandableBlock
            title="رزومه حرفه‌ای"
            current={breakdown.resume}
            max={20}
            icon="📄"
            items={resumeItems}
            suggestion={
              breakdown.resume < 20
                ? {
                    text: "ساخت رزومه",
                    link: "/app/resume",
                  }
                : undefined
            }
          />

          <ExpandableBlock
            title="فعالیت و تازگی"
            current={breakdown.activity}
            max={10}
            icon="🔄"
            items={activityItems}
            suggestion={
              breakdown.activity < 10
                ? {
                    text: "به‌روزرسانی پروفایل",
                    link: "/app/profile",
                  }
                : undefined
            }
          />
        </div>

        {/* Summary CTA */}
        {topSuggestions.length > 0 && strength.percentage < 85 && (
          <div className="sticky bottom-0 bg-white border-t p-4 md:p-6">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-purple-900">
                    برای رسیدن به {Math.min(strength.percentage + 15, 100)}٪:
                  </h3>
                  <div className="mt-2 space-y-1.5">
                    {topSuggestions.slice(0, 2).map((suggestion, index) => (
                      <Link key={index} href={suggestion.link}>
                        <div className="flex items-center gap-2 text-sm text-purple-800 hover:text-purple-900">
                          <span className="text-purple-400">•</span>
                          {suggestion.text}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {strength.percentage >= 85 && (
          <div className="p-4 md:p-6 border-t">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center">
              <p className="text-sm font-medium text-green-900">
                🎉 پروفایل شما در وضعیت عالی قرار دارد
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
