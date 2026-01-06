/**
 * Profile Events Tracking System
 *
 * Tracks user actions to explain profile view increases
 * Uses localStorage for client-side tracking (no backend required)
 */

export type ProfileEventType =
  | "profile_completed"
  | "skill_added"
  | "assessment_completed"
  | "resume_generated"
  | "profile_updated";

export type ProfileEvent = {
  type: ProfileEventType;
  timestamp: number; // Unix timestamp in milliseconds
  metadata?: Record<string, any>; // Optional event-specific data
};

const EVENTS_STORAGE_KEY = "karbarg:profile:events:v1";
const MAX_EVENTS = 50; // Keep last 50 events to prevent storage bloat

/**
 * Get all profile events from localStorage
 */
export function getProfileEvents(): ProfileEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!stored) return [];

    const events = JSON.parse(stored);
    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.error("Failed to load profile events:", error);
    return [];
  }
}

/**
 * Add a new profile event
 */
export function trackProfileEvent(
  type: ProfileEventType,
  metadata?: Record<string, any>
): void {
  if (typeof window === "undefined") return;

  try {
    const events = getProfileEvents();

    // Add new event
    const newEvent: ProfileEvent = {
      type,
      timestamp: Date.now(),
      metadata,
    };

    // Keep only last MAX_EVENTS
    const updatedEvents = [newEvent, ...events].slice(0, MAX_EVENTS);

    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    console.error("Failed to track profile event:", error);
  }
}

/**
 * Get events within a time window (in hours)
 */
export function getRecentEvents(hoursBack: number = 72): ProfileEvent[] {
  const now = Date.now();
  const cutoffTime = now - hoursBack * 60 * 60 * 1000;

  return getProfileEvents().filter((event) => event.timestamp >= cutoffTime);
}

/**
 * Priority order for event types (higher index = higher priority)
 */
const EVENT_PRIORITY: ProfileEventType[] = [
  "profile_updated",
  "resume_generated",
  "profile_completed",
  "skill_added",
  "assessment_completed",
];

/**
 * Get the most relevant event to explain view increase
 * Returns the highest priority event from the last 72 hours
 */
export function getMostRelevantEvent(): ProfileEvent | null {
  const recentEvents = getRecentEvents(72);

  if (recentEvents.length === 0) return null;

  // Sort events by priority (highest first)
  const sortedEvents = recentEvents.sort((a, b) => {
    const priorityA = EVENT_PRIORITY.indexOf(a.type);
    const priorityB = EVENT_PRIORITY.indexOf(b.type);

    // Higher priority first
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    // If same priority, more recent first
    return b.timestamp - a.timestamp;
  });

  return sortedEvents[0];
}

/**
 * Generate explanation text for why views increased
 */
export function getViewIncreaseReason(): string {
  const relevantEvent = getMostRelevantEvent();

  if (!relevantEvent) {
    return "افزایش طبیعی دیده‌شدن";
  }

  const explanations: Record<ProfileEventType, string> = {
    assessment_completed: "به‌دلیل تکمیل آزمون",
    skill_added: "پس از اضافه‌کردن مهارت جدید",
    profile_completed: "بعد از تکمیل پروفایل",
    resume_generated: "پس از ساخت رزومه",
    profile_updated: "بعد از به‌روزرسانی پروفایل",
  };

  return explanations[relevantEvent.type] || "افزایش طبیعی دیده‌شدن";
}

/**
 * Clear all events (for testing or logout)
 */
export function clearProfileEvents(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear profile events:", error);
  }
}

/**
 * Mock function to simulate view increase data
 * In production, this would come from backend analytics
 */
export function getMockViewData(): {
  currentViews: number;
  previousViews: number;
  hasIncrease: boolean;
  increasePercentage: number;
} {
  // Simulate realistic view data
  const currentViews = Math.floor(Math.random() * 20) + 5; // 5-25 views
  const previousViews = Math.floor(currentViews * (0.6 + Math.random() * 0.3)); // 60-90% of current
  const hasIncrease = currentViews > previousViews;
  const increasePercentage = previousViews > 0
    ? Math.round(((currentViews - previousViews) / previousViews) * 100)
    : 100;

  return {
    currentViews,
    previousViews,
    hasIncrease,
    increasePercentage,
  };
}
