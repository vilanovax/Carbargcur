/**
 * Microcopy Tracker - Client-side tracking helper
 *
 * استفاده:
 * import { trackMicrocopy } from '@/lib/microcopy-tracker';
 *
 * // ثبت نمایش
 * const eventId = await trackMicrocopy.shown('FIRST_ANSWER_CTA', { questionId });
 *
 * // ثبت کلیک
 * await trackMicrocopy.clicked('FIRST_ANSWER_CTA', { questionId });
 *
 * // ثبت اقدام (با eventId از نمایش قبلی)
 * await trackMicrocopy.action(eventId, 'answer_created', { answerId, timeToActionMs });
 */

interface TrackOptions {
  triggerRuleId?: string;
  pageUrl?: string;
  questionId?: string;
  metadata?: Record<string, unknown>;
}

interface ActionOptions {
  answerId?: string;
  questionId?: string;
  reputationDelta?: number;
  timeToActionMs?: number;
}

// Local storage for cooldowns (client-side caching)
const COOLDOWN_CACHE_KEY = "karbarg:microcopy:cooldowns";
const SESSION_EVENTS_KEY = "karbarg:microcopy:session";

interface CooldownCache {
  [microcopyId: string]: {
    lastShownAt: string;
    showCount: number;
  };
}

interface SessionEvents {
  [microcopyId: string]: {
    eventId: string;
    shownAt: number;
  };
}

/**
 * Get cooldown cache from localStorage
 */
function getCooldownCache(): CooldownCache {
  if (typeof window === "undefined") return {};
  try {
    const cached = localStorage.getItem(COOLDOWN_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

/**
 * Update cooldown cache in localStorage
 */
function updateCooldownCache(microcopyId: string): void {
  if (typeof window === "undefined") return;
  try {
    const cache = getCooldownCache();
    cache[microcopyId] = {
      lastShownAt: new Date().toISOString(),
      showCount: (cache[microcopyId]?.showCount || 0) + 1,
    };
    localStorage.setItem(COOLDOWN_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get session events (for linking shown -> action)
 */
function getSessionEvents(): SessionEvents {
  if (typeof window === "undefined") return {};
  try {
    const data = sessionStorage.getItem(SESSION_EVENTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Save session event
 */
function saveSessionEvent(microcopyId: string, eventId: string): void {
  if (typeof window === "undefined") return;
  try {
    const events = getSessionEvents();
    events[microcopyId] = {
      eventId,
      shownAt: Date.now(),
    };
    sessionStorage.setItem(SESSION_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get last event ID for a microcopy (for linking action)
 */
function getLastEventId(microcopyId: string): { eventId: string; shownAt: number } | null {
  const events = getSessionEvents();
  return events[microcopyId] || null;
}

/**
 * Check if microcopy is in cooldown (client-side check)
 */
export function isInCooldown(microcopyId: string, cooldownHours: number = 24): boolean {
  const cache = getCooldownCache();
  const entry = cache[microcopyId];

  if (!entry) return false;

  const lastShown = new Date(entry.lastShownAt);
  const now = new Date();
  const hoursSinceLastShown = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastShown < cooldownHours;
}

/**
 * Track microcopy event
 */
async function trackEvent(
  microcopyId: string,
  eventType: "shown" | "clicked" | "dismissed",
  options: TrackOptions = {}
): Promise<string | null> {
  try {
    const response = await fetch("/api/microcopy/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        microcopyId,
        eventType,
        triggerRuleId: options.triggerRuleId,
        pageUrl: options.pageUrl || (typeof window !== "undefined" ? window.location.pathname : ""),
        questionId: options.questionId,
        metadata: options.metadata,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to track microcopy event:", await response.text());
      return null;
    }

    const data = await response.json();

    // Update local cache on shown
    if (eventType === "shown") {
      updateCooldownCache(microcopyId);
      if (data.eventId) {
        saveSessionEvent(microcopyId, data.eventId);
      }
    }

    return data.eventId || null;
  } catch (error) {
    console.warn("Error tracking microcopy:", error);
    return null;
  }
}

/**
 * Track action linked to a microcopy event
 */
async function trackAction(
  microcopyEventId: string,
  actionType: "answer_created" | "question_created" | "profile_viewed" | "leaderboard_viewed",
  options: ActionOptions = {}
): Promise<boolean> {
  try {
    const response = await fetch("/api/microcopy/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        microcopyEventId,
        actionType,
        ...options,
      }),
    });

    return response.ok;
  } catch (error) {
    console.warn("Error tracking microcopy action:", error);
    return false;
  }
}

/**
 * Main tracker object
 */
export const trackMicrocopy = {
  /**
   * Track microcopy shown event
   * Returns eventId for later action tracking
   */
  shown: (microcopyId: string, options?: TrackOptions) =>
    trackEvent(microcopyId, "shown", options),

  /**
   * Track microcopy clicked event
   */
  clicked: (microcopyId: string, options?: TrackOptions) =>
    trackEvent(microcopyId, "clicked", options),

  /**
   * Track microcopy dismissed event
   */
  dismissed: (microcopyId: string, options?: TrackOptions) =>
    trackEvent(microcopyId, "dismissed", options),

  /**
   * Track action linked to a microcopy
   * If no eventId provided, tries to find the last shown event for the microcopyId
   */
  action: async (
    eventIdOrMicrocopyId: string,
    actionType: "answer_created" | "question_created" | "profile_viewed" | "leaderboard_viewed",
    options?: ActionOptions
  ) => {
    // Check if it's a UUID (event ID) or microcopy ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      eventIdOrMicrocopyId
    );

    let eventId = eventIdOrMicrocopyId;
    let shownAt: number | undefined;

    if (!isUuid) {
      // It's a microcopy ID, get the last event
      const lastEvent = getLastEventId(eventIdOrMicrocopyId);
      if (!lastEvent) {
        console.warn("No recent shown event found for microcopy:", eventIdOrMicrocopyId);
        return false;
      }
      eventId = lastEvent.eventId;
      shownAt = lastEvent.shownAt;
    }

    // Calculate time to action
    const timeToActionMs = shownAt ? Date.now() - shownAt : options?.timeToActionMs;

    return trackAction(eventId, actionType, {
      ...options,
      timeToActionMs,
    });
  },

  /**
   * Check if a microcopy is in cooldown
   */
  isInCooldown,

  /**
   * Get last event for linking actions
   */
  getLastEvent: getLastEventId,
};

export default trackMicrocopy;
