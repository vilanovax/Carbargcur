/**
 * Next Best Action (NBA) Engine
 *
 * Suggests the single most impactful action for users
 * Based on profile state, not random suggestions
 */

import type { FocusedProfile } from "./onboarding";
import { calculateProfileStrength } from "./profileStrength";
import { getRecentEvents } from "./profileEvents";

export type ActionType =
  | "assessment"
  | "add_skill"
  | "update_profile"
  | "generate_resume"
  | "share_profile"
  | "complete";

export type NextBestAction = {
  type: ActionType;
  title: string;
  reason: string;
  cta: string;
  link: string;
  priority: number;
};

const NBA_COOLDOWN_KEY = "karbarg:nba:last_suggestion:v1";
const COOLDOWN_HOURS = 24;

/**
 * Check if we should show the same suggestion again
 * (24-hour cooldown to avoid annoyance)
 */
function shouldShowSuggestion(actionType: ActionType): boolean {
  if (typeof window === "undefined") return true;

  try {
    const stored = localStorage.getItem(NBA_COOLDOWN_KEY);
    if (!stored) return true;

    const data = JSON.parse(stored);
    const { type, timestamp } = data;

    // Different suggestion - always show
    if (type !== actionType) return true;

    // Same suggestion - check cooldown
    const now = Date.now();
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
    return now - timestamp >= cooldownMs;
  } catch (error) {
    console.error("Failed to check NBA cooldown:", error);
    return true;
  }
}

/**
 * Mark suggestion as shown
 */
function markSuggestionShown(actionType: ActionType): void {
  if (typeof window === "undefined") return;

  try {
    const data = {
      type: actionType,
      timestamp: Date.now(),
    };
    localStorage.setItem(NBA_COOLDOWN_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to mark NBA suggestion:", error);
  }
}

/**
 * Check if user has completed any assessment
 */
function hasCompletedAssessment(profile: FocusedProfile): boolean {
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
 * Check if views trend is flat or declining
 */
function hasFlatliningViews(): boolean {
  // Check recent events - if no events in last week, likely flat
  const recentEvents = getRecentEvents(7 * 24); // 7 days
  return recentEvents.length === 0;
}

/**
 * Decision tree for Next Best Action
 * Rule-based, ordered by priority
 */
export function calculateNextBestAction(profile: FocusedProfile): NextBestAction {
  const strength = calculateProfileStrength(profile);
  const hasAssessment = hasCompletedAssessment(profile);
  const skillCount = (profile.coreSkills?.length || 0) + (profile.skills?.length || 0);
  const isFlat = hasFlatliningViews();

  // 1️⃣ Priority: Assessment (highest impact)
  if (!hasAssessment) {
    const action: NextBestAction = {
      type: "assessment",
      title: "انجام آزمون سبک کاری",
      reason: "این کار شانس پیشنهاد شدن شما را افزایش می‌دهد",
      cta: "شروع آزمون",
      link: "/app/assessments/mbti",
      priority: 10,
    };

    if (shouldShowSuggestion(action.type)) {
      markSuggestionShown(action.type);
      return action;
    }
  }

  // 2️⃣ Priority: Add skill if views are flat
  if (isFlat && skillCount < 5) {
    const action: NextBestAction = {
      type: "add_skill",
      title: "افزودن یک مهارت تخصصی",
      reason: "مهارت‌های بیشتر به Matching دقیق‌تر کمک می‌کند",
      cta: "افزودن مهارت",
      link: "/app/profile/onboarding/step-2-status",
      priority: 8,
    };

    if (shouldShowSuggestion(action.type)) {
      markSuggestionShown(action.type);
      return action;
    }
  }

  // 3️⃣ Priority: Complete profile if below 80%
  if (strength.percentage < 80) {
    const action: NextBestAction = {
      type: "update_profile",
      title: "به‌روزرسانی پروفایل",
      reason: "پروفایل‌های فعال بیشتر دیده می‌شوند",
      cta: "ویرایش پروفایل",
      link: "/app/profile/onboarding",
      priority: 6,
    };

    if (shouldShowSuggestion(action.type)) {
      markSuggestionShown(action.type);
      return action;
    }
  }

  // 4️⃣ Priority: Generate resume if not done yet
  if (!profile.resumeUrl) {
    const action: NextBestAction = {
      type: "generate_resume",
      title: "ساخت رزومه حرفه‌ای",
      reason: "رزومه شما به‌طور خودکار از پروفایل ساخته می‌شود",
      cta: "مشاهده رزومه",
      link: "/app/resume",
      priority: 4,
    };

    if (shouldShowSuggestion(action.type)) {
      markSuggestionShown(action.type);
      return action;
    }
  }

  // 5️⃣ Fallback: Profile is strong, suggest sharing
  const action: NextBestAction = {
    type: "share_profile",
    title: "اشتراک‌گذاری پروفایل",
    reason: "رزومه شما آماده ارسال به کارفرماست",
    cta: "اشتراک‌گذاری",
    link: "/app/profile",
    priority: 2,
  };

  if (shouldShowSuggestion(action.type)) {
    markSuggestionShown(action.type);
    return action;
  }

  // All good - complete state
  return {
    type: "complete",
    title: "وضعیت شما عالی است",
    reason: "در صورت ثبت نیازمندی‌های جدید، اطلاع‌رسانی می‌شود",
    cta: "مشاهده پروفایل",
    link: "/app/profile",
    priority: 0,
  };
}

/**
 * Clear NBA cooldown (for testing or after action completion)
 */
export function clearNBACooldown(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(NBA_COOLDOWN_KEY);
  } catch (error) {
    console.error("Failed to clear NBA cooldown:", error);
  }
}
