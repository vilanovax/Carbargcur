"use client";

import { useMemo } from "react";
import type { SectionKey, EmptyStateConfig } from "@/types/emptyState";
import type { OnboardingProfile, FocusedProfile } from "@/lib/onboarding";
import {
  isSectionEmpty,
  getEmptyStateConfig,
} from "@/components/empty-state/emptyStatePresets";

interface UseEmptyStateReturn {
  isEmpty: boolean;
  emptyStateConfig: EmptyStateConfig | null;
}

/**
 * Hook to check if a section is empty and get its empty state config
 *
 * @param section - The section key to check
 * @param profile - The user's profile data
 * @returns Object with isEmpty flag and emptyStateConfig
 *
 * @example
 * const { isEmpty, emptyStateConfig } = useEmptyState("experience", profile);
 *
 * return (
 *   <SectionCard title="سابقه کاری">
 *     {isEmpty && emptyStateConfig ? (
 *       <EmptyState {...emptyStateConfig} />
 *     ) : (
 *       <ExperienceList data={experiences} />
 *     )}
 *   </SectionCard>
 * );
 */
export function useEmptyState(
  section: SectionKey,
  profile: OnboardingProfile | FocusedProfile | null
): UseEmptyStateReturn {
  const isEmpty = useMemo(
    () => isSectionEmpty(section, profile),
    [section, profile]
  );

  const emptyStateConfig = useMemo(() => {
    if (!isEmpty) return null;
    try {
      return getEmptyStateConfig(section, profile);
    } catch (error) {
      console.error(`Failed to get empty state config for ${section}:`, error);
      return null;
    }
  }, [section, profile, isEmpty]);

  return {
    isEmpty,
    emptyStateConfig,
  };
}

/**
 * Hook to track empty state interactions for analytics
 *
 * @param section - The section key
 *
 * @example
 * const { trackEmptyStateAction } = useEmptyStateAnalytics("experience");
 *
 * <EmptyState
 *   {...config}
 *   primaryAction={{
 *     ...config.primaryAction,
 *     onClick: () => {
 *       trackEmptyStateAction("primary_click");
 *       config.primaryAction.onClick?.();
 *     }
 *   }}
 * />
 */
export function useEmptyStateAnalytics(section: SectionKey) {
  const trackEmptyStateAction = (action: string) => {
    // Track analytics event
    if (typeof window !== "undefined") {
      try {
        const event = {
          type: "empty_state_interaction",
          section,
          action,
          timestamp: Date.now(),
        };

        // Store in localStorage for future analytics
        const key = "karbarg:analytics:empty_state:v1";
        const existing = localStorage.getItem(key);
        const events = existing ? JSON.parse(existing) : [];
        events.push(event);

        // Keep last 100 events
        const trimmed = events.slice(-100);
        localStorage.setItem(key, JSON.stringify(trimmed));

        console.log("[EmptyState Analytics]", event);
      } catch (error) {
        console.error("Failed to track empty state action:", error);
      }
    }
  };

  return {
    trackEmptyStateAction,
  };
}
