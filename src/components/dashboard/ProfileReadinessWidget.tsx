"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { type FocusedProfile } from "@/lib/onboarding";
import { calculateProfileStrength } from "@/lib/profileStrength";

interface ProfileReadinessWidgetProps {
  profile: FocusedProfile;
}

/**
 * Calculate readiness level based on profile data
 * Rule-based logic using core skills, recent experience, and profile strength
 */
function calculateReadiness(profile: FocusedProfile): {
  level: "high" | "medium" | "low";
  label: string;
  description: string;
} {
  const strength = calculateProfileStrength(profile);
  const hasCoreSkills = profile.coreSkills && profile.coreSkills.length > 0;
  const hasRecentExp = !!profile.recentExperience?.role;
  const hasCareerFocus = !!profile.careerFocus;

  // High readiness: Strong profile with clear signals
  if (
    strength.percentage >= 70 &&
    hasCoreSkills &&
    hasRecentExp &&
    hasCareerFocus
  ) {
    return {
      level: "high",
      label: "بالا",
      description: "مناسب نقش‌های مالی و حسابداری",
    };
  }

  // Medium readiness: Profile exists but needs strengthening
  if (strength.percentage >= 40 && (hasCoreSkills || hasRecentExp)) {
    return {
      level: "medium",
      label: "متوسط",
      description: "با تکمیل پروفایل، آمادگی افزایش می‌یابد",
    };
  }

  // Low readiness: Incomplete profile
  return {
    level: "low",
    label: "نیاز به تکمیل",
    description: "ابتدا پروفایل خود را تکمیل کنید",
  };
}

export default function ProfileReadinessWidget({ profile }: ProfileReadinessWidgetProps) {
  const readiness = calculateReadiness(profile);

  const getBadgeColor = () => {
    switch (readiness.level) {
      case "high":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "low":
        return "bg-red-100 text-red-700 border-red-300";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Label */}
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            آمادگی برای نیازمندی‌ها
          </h3>

          {/* Readiness Level */}
          <div className="text-center">
            <Badge className={`${getBadgeColor()} text-lg px-4 py-2 font-bold`}>
              {readiness.label}
            </Badge>
          </div>

          {/* Description */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {readiness.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
