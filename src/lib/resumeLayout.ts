/**
 * Auto-Layout Logic for Resume
 *
 * Automatically adjusts resume layout based on content length
 * to ensure professional, balanced A4-like appearance
 */

import type { OnboardingProfile } from "./onboarding";

export type LayoutMode = "short" | "balanced" | "dense";

/**
 * Calculate content score based on profile data
 *
 * Formula:
 * - experiences.length × 3
 * - skills.length × 1
 * - education fields × 2 (degree, field, university)
 */
export function calculateContentScore(profile: OnboardingProfile): number {
  const experienceScore = (profile.experiences?.length || 0) * 3;
  const skillsScore = (profile.skills?.length || 0) * 1;

  // Count education fields (degree, field, university)
  let educationScore = 0;
  if (profile.education) {
    if (profile.education.degree) educationScore++;
    if (profile.education.field) educationScore++;
    if (profile.education.university) educationScore++;
  }
  educationScore *= 2;

  return experienceScore + skillsScore + educationScore;
}

/**
 * Determine layout mode based on content score
 *
 * Thresholds:
 * - ≤ 8: short (junior/entry-level)
 * - 9-16: balanced (mid-level)
 * - ≥ 17: dense (senior)
 */
export function getLayoutMode(profile: OnboardingProfile): LayoutMode {
  const score = calculateContentScore(profile);

  if (score <= 8) return "short";
  if (score >= 17) return "dense";
  return "balanced";
}

/**
 * Get layout-specific CSS classes for different elements
 */
export function getLayoutClasses(mode: LayoutMode) {
  return {
    // Vertical spacing between sections
    sectionSpacing: {
      short: "space-y-8",
      balanced: "space-y-6",
      dense: "space-y-4",
    }[mode],

    // Sidebar width (for Modern theme)
    sidebarWidth: {
      short: "w-[25%]",
      balanced: "w-[30%]",
      dense: "w-[30%]",
    }[mode],

    // Main content width (for Modern theme)
    mainWidth: {
      short: "w-[75%]",
      balanced: "w-[70%]",
      dense: "w-[70%]",
    }[mode],

    // Summary section emphasis
    summaryClasses: {
      short: "text-base leading-relaxed",
      balanced: "text-sm leading-relaxed",
      dense: "text-sm leading-normal",
    }[mode],

    // Experience item spacing
    experienceSpacing: {
      short: "space-y-5",
      balanced: "space-y-4",
      dense: "space-y-3",
    }[mode],

    // Skills layout
    skillsLayout: {
      short: "grid grid-cols-1 gap-2",
      balanced: "grid grid-cols-2 md:grid-cols-3 gap-2",
      dense: "grid grid-cols-2 gap-1.5",
    }[mode],

    // Divider visibility
    dividerClasses: {
      short: "border-t border-gray-300 my-4",
      balanced: "border-t border-gray-200 my-3",
      dense: "border-t border-gray-200 my-2",
    }[mode],

    // Container min-height (for short resumes)
    containerMinHeight: {
      short: "min-h-[297mm]", // A4 height
      balanced: "",
      dense: "",
    }[mode],
  };
}

/**
 * Get helper text for auto-layout feature
 */
export function getLayoutHelperText(mode: LayoutMode): string {
  return "چیدمان این رزومه به‌صورت خودکار بر اساس حجم اطلاعات شما تنظیم شده است.";
}
