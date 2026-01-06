import { useMemo } from "react";
import type { FocusedProfile } from "@/lib/onboarding";

export type DashboardMode = "zero" | "normal";

/**
 * Determines which dashboard mode to show based on profile data
 *
 * Zero-State Mode activates when user has NO meaningful data:
 * - No basic profile info (name, recent experience)
 * - No skills
 * - No experience entries
 * - No profile photo
 * - Profile strength ≤ 10%
 *
 * This mode shows an onboarding-focused experience instead of reporting widgets
 */
export function useDashboardMode(profile: FocusedProfile | null): DashboardMode {
  const mode = useMemo(() => {
    if (!profile) return "zero";

    // Check basic info
    const hasBasicInfo = !!(profile.fullName && profile.recentExperience?.role);

    // Check skills (combined core + regular skills)
    const totalSkills =
      (profile.coreSkills?.length || 0) + (profile.skills?.length || 0);
    const hasSkills = totalSkills > 0;

    // Check experience
    const hasExperience = !!(
      profile.recentExperience?.role ||
      (profile.experiences && profile.experiences.length > 0)
    );

    // Check photo
    const hasPhoto = !!profile.photoUrl;

    // Calculate simple strength
    let simpleStrength = 0;
    if (hasBasicInfo) simpleStrength += 20;
    if (hasPhoto) simpleStrength += 10;
    if (hasSkills) simpleStrength += 25;
    if (hasExperience) simpleStrength += 25;
    if (profile.summary) simpleStrength += 10;
    const hasAssessments = !!(
      profile.personality?.quick ||
      profile.personality?.full ||
      profile.disc ||
      profile.holland
    );
    if (hasAssessments) simpleStrength += 10;

    // Zero-State Mode if ALL are false OR strength ≤ 10%
    const isZeroState =
      (!hasBasicInfo && !hasSkills && !hasExperience && !hasPhoto) ||
      simpleStrength <= 10;

    return isZeroState ? "zero" : "normal";
  }, [profile]);

  return mode;
}
