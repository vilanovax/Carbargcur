"use client";

import { useEffect, useState } from "react";
import { loadFocusedFromStorage, type FocusedProfile } from "@/lib/onboarding";
import { useDashboardMode } from "@/hooks/useDashboardMode";
import ZeroStateDashboard from "@/components/dashboard/ZeroStateDashboard";
import NormalDashboard from "@/components/dashboard/NormalDashboard";

/**
 * Dashboard Router
 *
 * Decides which dashboard mode to render based on profile data:
 * - Zero-State Mode: User has no meaningful data → Onboarding experience
 * - Normal Mode: User has some data → Reporting/analytics dashboard
 *
 * This separation ensures:
 * - New users get clear onboarding guidance
 * - Existing users see relevant metrics and actions
 * - No mixing of zero-state and normal widgets
 */
export default function DashboardRouter() {
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = loadFocusedFromStorage();
    setProfile(data);
    setIsLoading(false);
  }, []);

  const mode = useDashboardMode(profile);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">در حال بارگذاری...</div>
      </div>
    );
  }

  if (mode === "zero") {
    return <ZeroStateDashboard profile={profile} />;
  }

  return <NormalDashboard profile={profile} />;
}
