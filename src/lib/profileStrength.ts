/**
 * Profile Strength Calculation System
 *
 * Measures profile readiness for financial industry job matching
 * NOT a social media popularity score - a professional readiness indicator
 *
 * Total Score: 100%
 * 1. Base Signals & Info (20%)
 * 2. Skills & Experience (25%)
 * 3. Professional Assessments (25%)
 * 4. Resume Readiness (20%)
 * 5. Activity & Freshness (10%)
 */

import type { FocusedProfile } from "./onboarding";
import { validateFocusedStep } from "./onboarding";

export type ProfileStrengthResult = {
  percentage: number; // 0-100 (integer)
  breakdown: {
    baseSignals: number; // 0-20
    skillsExperience: number; // 0-25
    assessments: number; // 0-25
    resume: number; // 0-20
    activity: number; // 0-10
  };
  label: "ضعیف" | "در حال تکمیل" | "خوب" | "قوی" | "عالی";
  isReadyForMatching: boolean; // >= 60%
  missingHighImpact: string[]; // Critical missing items
  caps: string[]; // Score caps due to missing items
};

const ACTIVITY_STORAGE_KEY = "karbarg:profile:activity:v1";

/**
 * Get last profile update timestamp
 */
function getLastUpdateTimestamp(): number {
  if (typeof window === "undefined") return 0;

  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!stored) return 0;
    const data = JSON.parse(stored);
    return data.lastUpdate || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Mark profile as updated (call this on any profile edit)
 */
export function trackProfileUpdate(): void {
  if (typeof window === "undefined") return;

  try {
    const data = {
      lastUpdate: Date.now(),
    };
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to track profile update:", error);
  }
}

/**
 * Check if user has completed any assessment
 */
function hasAnyAssessment(profile: FocusedProfile): boolean {
  return !!(
    profile.personality?.full ||
    profile.personality?.mbti ||
    profile.personality?.disc ||
    profile.assessments?.mbti ||
    profile.assessments?.disc ||
    profile.assessments?.holland
  );
}

/**
 * Count completed assessments
 */
function countAssessments(profile: FocusedProfile): {
  mbti: boolean;
  mbtiAdvanced: boolean;
  disc: boolean;
  holland: boolean;
  hollandAdvanced: boolean;
} {
  return {
    mbti: !!(profile.personality?.mbti || profile.assessments?.mbti),
    mbtiAdvanced: !!profile.personality?.full,
    disc: !!(profile.personality?.disc || profile.assessments?.disc),
    holland: !!profile.assessments?.holland,
    hollandAdvanced: !!profile.personality?.holland,
  };
}

/**
 * Calculate comprehensive profile strength
 */
export function calculateProfileStrength(profile: FocusedProfile): ProfileStrengthResult {
  let baseSignals = 0;
  let skillsExperience = 0;
  let assessments = 0;
  let resume = 0;
  let activity = 0;

  const missingHighImpact: string[] = [];
  const caps: string[] = [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1️⃣ BASE SIGNALS & INFO (20%)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Recent work experience (6%)
  if (validateFocusedStep("step-1", profile).ok) {
    baseSignals += 6;
  } else {
    missingHighImpact.push("تجربه کاری ۵ سال اخیر");
  }

  // Career focus (6%)
  if (validateFocusedStep("step-3", profile).ok) {
    baseSignals += 6;
  } else {
    missingHighImpact.push("تمرکز شغلی فعلی");
  }

  // Latest education (4%)
  if (validateFocusedStep("step-4", profile).ok) {
    baseSignals += 4;
  }

  // Location (4%)
  if (profile.city || profile.recentExperience?.company) {
    baseSignals += 4;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2️⃣ SKILLS & EXPERIENCE (25%)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const totalSkills = (profile.coreSkills?.length || 0) + (profile.skills?.length || 0);

  // At least 1 core skill (8%)
  if (totalSkills >= 1) {
    skillsExperience += 8;
  } else {
    missingHighImpact.push("حداقل ۱ مهارت تخصصی");
  }

  // 2 core skills max (additional 4%)
  if (totalSkills >= 2) {
    skillsExperience += 4;
  }

  // Work experience registered (8%)
  if (
    profile.recentExperience?.role ||
    (profile.experiences && profile.experiences.length > 0)
  ) {
    skillsExperience += 8;
  }

  // Skills recently updated (5%)
  // Check if profile has been updated in last 30 days
  const lastUpdate = getLastUpdateTimestamp();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (lastUpdate > thirtyDaysAgo && totalSkills > 0) {
    skillsExperience += 5;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3️⃣ PROFESSIONAL ASSESSMENTS (25%) - The Hook
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const completedAssessments = countAssessments(profile);

  // MBTI Quick (5%)
  if (completedAssessments.mbti) {
    assessments += 5;
  }

  // MBTI Advanced (additional 5%)
  if (completedAssessments.mbtiAdvanced) {
    assessments += 5;
  }

  // DISC (7%)
  if (completedAssessments.disc) {
    assessments += 7;
  }

  // Holland Quick (4%)
  if (completedAssessments.holland) {
    assessments += 4;
  }

  // Holland Advanced (additional 4%)
  if (completedAssessments.hollandAdvanced) {
    assessments += 4;
  }

  // Cap: Without any assessment, max score is 75%
  if (!hasAnyAssessment(profile)) {
    caps.push("بدون آزمون حداکثر ۷۵٪");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4️⃣ RESUME READINESS (20%)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Resume generated (10%)
  if (profile.resumeUrl || profile.slug) {
    resume += 10;
  }

  // Resume downloadable (5%)
  if (profile.resumeUrl) {
    resume += 5;
  }

  // Auto-complete without errors (5%)
  // Check if all required fields for resume are present
  const hasCompleteResumeData =
    profile.recentExperience?.role &&
    totalSkills >= 1 &&
    profile.latestEducation?.degree;
  if (hasCompleteResumeData) {
    resume += 5;
  }

  // Cap: Without resume, max score is 80%
  if (!profile.resumeUrl && !profile.slug) {
    caps.push("بدون رزومه حداکثر ۸۰٪");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5️⃣ ACTIVITY & FRESHNESS (10%) - Decay over time
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Profile edited in last 30 days (4%)
  if (lastUpdate > thirtyDaysAgo) {
    activity += 4;
  }

  // NBA action completed (3%)
  // Check if user has any recent events (from profileEvents)
  if (typeof window !== "undefined") {
    try {
      const events = localStorage.getItem("karbarg:profile:events:v1");
      if (events) {
        const parsed = JSON.parse(events);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const recentEvent = parsed[0];
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (recentEvent.timestamp > sevenDaysAgo) {
            activity += 3;
          }
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  // Regular login (weekly) (3%)
  // We'll track this later with proper login tracking
  // For now, if profile exists, assume active
  if (profile.fullName || profile.recentExperience?.role) {
    activity += 3;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FINAL CALCULATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  let totalScore = baseSignals + skillsExperience + assessments + resume + activity;

  // Apply caps
  if (caps.includes("بدون آزمون حداکثر ۷۵٪") && totalScore > 75) {
    totalScore = 75;
  }
  if (caps.includes("بدون رزومه حداکثر ۸۰٪") && totalScore > 80) {
    totalScore = 80;
  }

  // Round to integer
  const percentage = Math.round(totalScore);

  // Determine label
  let label: "ضعیف" | "در حال تکمیل" | "خوب" | "قوی" | "عالی";
  if (percentage < 40) label = "ضعیف";
  else if (percentage < 60) label = "در حال تکمیل";
  else if (percentage < 70) label = "خوب";
  else if (percentage < 85) label = "قوی";
  else label = "عالی";

  return {
    percentage,
    breakdown: {
      baseSignals: Math.round(baseSignals),
      skillsExperience: Math.round(skillsExperience),
      assessments: Math.round(assessments),
      resume: Math.round(resume),
      activity: Math.round(activity),
    },
    label,
    isReadyForMatching: percentage >= 60,
    missingHighImpact,
    caps,
  };
}

/**
 * Legacy function for backward compatibility
 */
export function getStrengthColor(percentage: number): string {
  if (percentage < 40) return "text-red-600 bg-red-100 border-red-300";
  if (percentage < 60) return "text-amber-600 bg-amber-100 border-amber-300";
  if (percentage < 85) return "text-blue-600 bg-blue-100 border-blue-300";
  return "text-green-600 bg-green-100 border-green-300";
}

/**
 * Get progress bar color based on percentage
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage < 40) return "bg-red-500";
  if (percentage < 60) return "bg-amber-500";
  if (percentage < 85) return "bg-blue-500";
  return "bg-green-500";
}

/**
 * Get encouragement message based on profile strength
 */
export function getStrengthMessage(percentage: number): string {
  if (percentage < 40) {
    return "با تکمیل پروفایل، شانس یافتن فرصت مناسب را افزایش دهید";
  }
  if (percentage < 60) {
    return "پروفایل شما در حال تقویت است. ادامه دهید";
  }
  if (percentage < 70) {
    return "پروفایل شما خوب است. با تکمیل بخش‌های اضافی آن را قوی‌تر کنید";
  }
  if (percentage < 85) {
    return "پروفایل قوی! شما آماده دریافت پیشنهادهای شغلی هستید";
  }
  return "عالی! پروفایل شما کامل است و برای کارفرمایان جذاب به نظر می‌رسد";
}

/**
 * Get public-facing strength label (for public profile)
 */
export function getPublicStrengthLabel(percentage: number): string {
  if (percentage < 60) return "پروفایل در حال تکمیل";
  if (percentage < 85) return "پروفایل قوی";
  return "پروفایل عالی";
}
