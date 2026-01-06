"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type FocusedProfile } from "@/lib/onboarding";
import {
  calculateProfileStrength,
  getStrengthColor,
  getProgressBarColor,
} from "@/lib/profileStrength";
import ProfileStrengthBreakdown from "./ProfileStrengthBreakdown";

interface ProfileStrengthWidgetProps {
  profile: FocusedProfile;
}

export default function ProfileStrengthWidget({ profile }: ProfileStrengthWidgetProps) {
  const strength = calculateProfileStrength(profile);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Determine message based on percentage
  const getMessage = () => {
    if (strength.percentage >= 100) {
      return "پروفایل شما کامل است";
    }
    if (strength.percentage >= 70) {
      return "پروفایل شما قوی است";
    }
    if (strength.percentage >= 50) {
      return "در حال تقویت";
    }
    return "نیاز به تکمیل";
  };

  // Determine submessage
  const getSubMessage = () => {
    // Show caps if they exist
    if (strength.caps && strength.caps.length > 0) {
      return strength.caps[0];
    }

    // Show missing high impact items
    if (strength.missingHighImpact && strength.missingHighImpact.length > 0) {
      return `${strength.missingHighImpact.slice(0, 2).join("، ")} نیاز است`;
    }

    // Fallback for complete profiles
    if (strength.percentage >= 85) {
      return "شاخص آمادگی برای نیازمندی‌های صنعت مالی";
    }

    return "در حال تقویت پروفایل";
  };

  return (
    <>
      <Card
        className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsBreakdownOpen(true)}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Label */}
            <h3 className="text-sm font-medium text-muted-foreground">قدرت پروفایل</h3>

          {/* Progress Ring Container */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Background Circle */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - strength.percentage / 100)}`}
                  className={`transition-all duration-500 ${
                    strength.percentage >= 85
                      ? "text-green-500"
                      : strength.percentage >= 60
                      ? "text-blue-500"
                      : strength.percentage >= 40
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      strength.percentage >= 85
                        ? "text-green-600"
                        : strength.percentage >= 60
                        ? "text-blue-600"
                        : strength.percentage >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {strength.percentage}٪
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Message */}
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{getMessage()}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getSubMessage()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileStrengthBreakdown
        profile={profile}
        strength={strength}
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
      />
    </>
  );
}
