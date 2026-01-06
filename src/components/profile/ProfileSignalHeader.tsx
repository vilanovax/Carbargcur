"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp } from "lucide-react";
import type { FocusedProfile } from "@/lib/onboarding";
import { WORK_DOMAINS, EMPLOYMENT_TYPES, CAREER_FOCUS_OPTIONS } from "@/lib/onboarding";
import { calculateProfileStrength, getStrengthColor, getProgressBarColor } from "@/lib/profileStrength";

interface ProfileSignalHeaderProps {
  profile: FocusedProfile;
  mode?: "public" | "private";  // public for employer view, private for user dashboard
}

/**
 * Generate professional title from recent experience + skills
 * Rule-based generation for AI-ready profiles
 */
function generateProfessionalTitle(profile: FocusedProfile): string {
  const role = profile.recentExperience?.role;
  const topSkill = profile.coreSkills?.[0];

  if (!role) return "متخصص مالی و حسابداری";

  if (topSkill) {
    return `${role} · ${topSkill}`;
  }

  return role;
}

/**
 * Map profile to suitable job needs (rule-based)
 */
function getSuitableNeeds(profile: FocusedProfile): string[] {
  const needs: string[] = [];
  const domain = profile.recentExperience?.domain;
  const skills = profile.coreSkills || [];

  // Domain-based mapping
  if (domain === "accounting") needs.push("حسابداری و صورت‌های مالی");
  if (domain === "finance") needs.push("تحلیل مالی و سرمایه‌گذاری");
  if (domain === "auditing") needs.push("حسابرسی و کنترل داخلی");
  if (domain === "tax") needs.push("حسابداری مالیاتی");
  if (domain === "financial_management") needs.push("مدیریت مالی");
  if (domain === "insurance") needs.push("بیمه و ریسک");
  if (domain === "industrial") needs.push("حسابداری صنعتی و بهای تمام شده");

  // Skills-based mapping
  if (skills.includes("IFRS")) needs.push("گزارشگری IFRS");
  if (skills.includes("Excel پیشرفته")) needs.push("تحلیل داده مالی");
  if (skills.includes("Power BI")) needs.push("تحلیل و هوش تجاری");
  if (skills.includes("مدل‌سازی مالی")) needs.push("مدل‌سازی و پیش‌بینی");
  if (skills.includes("بودجه‌ریزی")) needs.push("بودجه‌ریزی و برنامه‌ریزی");

  // Deduplicate and limit to 3
  const uniqueNeeds = [...new Set(needs)];
  return uniqueNeeds.slice(0, 3);
}

/**
 * Get assessment summary badges
 */
function getAssessmentBadges(profile: FocusedProfile): Array<{ label: string; value: string }> {
  const badges: Array<{ label: string; value: string }> = [];

  // MBTI-based work style (if exists)
  if (profile.personality?.type) {
    const types = profile.personality.type.split("").map(t => {
      if (t === "E") return "عملگرا";
      if (t === "I") return "تحلیلی";
      if (t === "S") return "دقیق";
      if (t === "N") return "خلاق";
      if (t === "T") return "منطقی";
      if (t === "F") return "مشارکتی";
      if (t === "J") return "ساختارمند";
      if (t === "P") return "انعطاف‌پذیر";
      return t;
    });
    badges.push({ label: "سبک کاری", value: types.slice(0, 2).join(" · ") });
  }

  // DISC behavior (if exists)
  if (profile.assessments?.disc?.primary) {
    const discLabels = {
      dominant: "نتیجه‌گرا",
      influential: "ارتباطی",
      steady: "پایدار",
      conscientious: "دقیق",
    };
    badges.push({
      label: "رفتار حرفه‌ای",
      value: discLabels[profile.assessments.disc.primary] || profile.assessments.disc.primary
    });
  }

  // Holland career fit (if exists)
  const hollandFit = profile.assessments?.hollandFull || profile.assessments?.holland;
  if (hollandFit?.primary) {
    const hollandLabels = {
      practical: "عملی",
      analytical: "تحلیلی",
      creative: "خلاق",
      social: "انسانی",
      enterprising: "مدیریتی",
      conventional: "ساختارمند",
    };
    const primary = hollandLabels[hollandFit.primary] || hollandFit.primary;
    const secondary = hollandFit.secondary ? hollandLabels[hollandFit.secondary] : null;
    badges.push({
      label: "مسیر شغلی",
      value: secondary ? `${primary} · ${secondary}` : primary
    });
  }

  return badges;
}

export default function ProfileSignalHeader({ profile, mode = "private" }: ProfileSignalHeaderProps) {
  const professionalTitle = generateProfessionalTitle(profile);
  const strength = calculateProfileStrength(profile);
  const suitableNeeds = getSuitableNeeds(profile);
  const assessmentBadges = getAssessmentBadges(profile);

  const domainLabel = profile.recentExperience?.domain
    ? WORK_DOMAINS.find(d => d.value === profile.recentExperience?.domain)?.label
    : null;

  const employmentTypeLabel = profile.recentExperience?.employmentType
    ? EMPLOYMENT_TYPES.find(e => e.value === profile.recentExperience?.employmentType)?.label
    : null;

  const careerFocusLabel = profile.careerFocus
    ? CAREER_FOCUS_OPTIONS.find(c => c.value === profile.careerFocus)?.label
    : null;

  const educationLabel = profile.latestEducation?.degree
    ? `${profile.latestEducation.field}`
    : null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold text-white">
                {(profile.fullName || "کاربر").charAt(0)}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Name & Professional Title */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {profile.fullName || "کاربر کاربرگ"}
              </h2>
              <p className="text-base md:text-lg text-gray-700 font-medium">
                {professionalTitle}
              </p>
            </div>

            {/* Recent Experience (1 line) */}
            {profile.recentExperience && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">تجربه ۵ سال اخیر:</span>
                <span>{domainLabel}</span>
                {employmentTypeLabel && (
                  <>
                    <span>·</span>
                    <span>{employmentTypeLabel}</span>
                  </>
                )}
              </div>
            )}

            {/* Core Skills (max 2 chips) */}
            {profile.coreSkills && profile.coreSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">مهارت‌های کلیدی:</span>
                {profile.coreSkills.slice(0, 2).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Career Focus */}
            {careerFocusLabel && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">تمرکز فعلی:</span>
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  {careerFocusLabel}
                </Badge>
              </div>
            )}

            {/* Assessment Badges */}
            {assessmentBadges.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {assessmentBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-600 font-medium">{badge.label}:</span>
                    <span className="text-gray-800">{badge.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Profile Strength & Suitable Needs Row */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
              {/* Profile Strength */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">قدرت پروفایل:</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        {mode === "private" ? (
                          <>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressBarColor(strength.percentage)} transition-all`}
                                style={{ width: `${strength.percentage}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getStrengthColor(strength.percentage).split(' ')[0]}`}>
                              {strength.percentage}٪
                            </span>
                          </>
                        ) : (
                          <Badge variant="outline" className={getStrengthColor(strength.percentage)}>
                            {strength.percentage >= 70 ? "قوی" : strength.percentage >= 40 ? "متوسط" : "در حال تکمیل"}
                          </Badge>
                        )}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        این شاخص نشان می‌دهد پروفایل شما چقدر برای نیازمندی‌های مالی آماده است.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Suitable Needs */}
              {suitableNeeds.length > 0 && (
                <div className="flex-1">
                  <div className="p-3 bg-white/80 border border-blue-200 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">مناسب برای نیازمندی‌های:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {suitableNeeds.map((need, index) => (
                          <span key={index} className="text-xs text-blue-700 font-medium">
                            {need}{index < suitableNeeds.length - 1 ? " ·" : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Copy (Private mode only) */}
        {mode === "private" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-muted-foreground text-center">
              اطلاعات این بخش به‌صورت خلاصه برای کارفرما نمایش داده می‌شود.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
