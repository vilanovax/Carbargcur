/**
 * Profile Strength Calculation for FocusedProfile
 *
 * Calculates completion percentage based on:
 * - Recent Experience: 15%
 * - Core Skills: 20%
 * - Career Focus: 15%
 * - Latest Education: 10%
 * - Certifications: 10%
 * Total from onboarding: 70%
 *
 * Additional (not yet implemented):
 * - Resume completion: 15%
 * - Assessments (MBTI/DISC/Holland): 10%
 * - Activity/engagement: 5%
 */

import type { FocusedProfile } from "./onboarding";
import { validateFocusedStep } from "./onboarding";

export type ProfileStrengthResult = {
  percentage: number;  // 0-100
  onboardingScore: number;  // 0-70 from onboarding steps
  hasRecentExperience: boolean;
  hasCoreSkills: boolean;
  hasCareerFocus: boolean;
  hasEducation: boolean;
  hasCertifications: boolean;
  isOnboardingComplete: boolean;  // All required steps done (70%)
  missingSteps: string[];  // Names of incomplete steps
};

/**
 * Calculate profile strength based on FocusedProfile completion
 */
export function calculateProfileStrength(profile: FocusedProfile): ProfileStrengthResult {
  let onboardingScore = 0;
  const missingSteps: string[] = [];

  // Step 1: Recent Experience (15%)
  const hasRecentExperience = validateFocusedStep("step-1", profile).ok;
  if (hasRecentExperience) {
    onboardingScore += 15;
  } else {
    missingSteps.push("تجربه کاری اخیر");
  }

  // Step 2: Core Skills (20%)
  const hasCoreSkills = validateFocusedStep("step-2", profile).ok;
  if (hasCoreSkills) {
    onboardingScore += 20;
  } else {
    missingSteps.push("مهارت‌های کلیدی");
  }

  // Step 3: Career Focus (15%)
  const hasCareerFocus = validateFocusedStep("step-3", profile).ok;
  if (hasCareerFocus) {
    onboardingScore += 15;
  } else {
    missingSteps.push("تمرکز شغلی");
  }

  // Step 4: Latest Education (10%)
  const hasEducation = validateFocusedStep("step-4", profile).ok;
  if (hasEducation) {
    onboardingScore += 10;
  } else {
    missingSteps.push("تحصیلات");
  }

  // Step 5: Certifications (10%) - Optional but adds value
  const hasCertifications = (profile.certifications && profile.certifications.length > 0) || false;
  if (hasCertifications) {
    onboardingScore += 10;
  }

  // Onboarding is complete if all required steps are done (first 4 steps = 60%)
  // Certifications are optional, so we don't require them for completion
  const isOnboardingComplete = onboardingScore >= 60;

  return {
    percentage: onboardingScore,  // Currently only onboarding contributes
    onboardingScore,
    hasRecentExperience,
    hasCoreSkills,
    hasCareerFocus,
    hasEducation,
    hasCertifications,
    isOnboardingComplete,
    missingSteps,
  };
}

/**
 * Get color class for profile strength meter
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
    return "با تکمیل پروفایل، شانس یافتن فرصت مناسب را افزایش دهید.";
  }
  if (percentage < 60) {
    return "پروفایل شما در حال تقویت است. ادامه دهید!";
  }
  if (percentage < 70) {
    return "پروفایل شما خوب است. با تکمیل بخش‌های اضافی آن را قوی‌تر کنید.";
  }
  if (percentage < 85) {
    return "پروفایل قوی! شما آماده دریافت پیشنهادهای شغلی هستید.";
  }
  return "عالی! پروفایل شما کامل است و برای کارفرمایان جذاب به نظر می‌رسد.";
}
