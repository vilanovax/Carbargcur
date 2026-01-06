"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import type { FocusedProfile } from "@/lib/onboarding";
import { calculateNextBestAction } from "@/lib/nextBestAction";

interface NextBestActionCardProps {
  profile: FocusedProfile;
}

export default function NextBestActionCard({ profile }: NextBestActionCardProps) {
  const action = calculateNextBestAction(profile);

  // Color scheme based on priority
  const getColorClass = () => {
    if (action.priority >= 8) {
      return {
        bg: "bg-gradient-to-br from-purple-50 to-indigo-50",
        border: "border-purple-200",
        icon: "bg-purple-100",
        iconColor: "text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700",
      };
    }
    if (action.priority >= 6) {
      return {
        bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
        border: "border-blue-200",
        icon: "bg-blue-100",
        iconColor: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700",
      };
    }
    if (action.priority >= 4) {
      return {
        bg: "bg-gradient-to-br from-green-50 to-emerald-50",
        border: "border-green-200",
        icon: "bg-green-100",
        iconColor: "text-green-600",
        button: "bg-green-600 hover:bg-green-700",
      };
    }
    return {
      bg: "bg-gradient-to-br from-gray-50 to-slate-50",
      border: "border-gray-200",
      icon: "bg-gray-100",
      iconColor: "text-gray-600",
      button: "bg-gray-600 hover:bg-gray-700",
    };
  };

  const colors = getColorClass();

  return (
    <Card className={`shadow-sm ${colors.bg} ${colors.border}`}>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${colors.icon} flex items-center justify-center shrink-0`}>
              <Target className={`h-4 w-4 ${colors.iconColor}`} />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">
              پیشنهاد بعدی برای شما
            </h3>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <h2 className="text-base md:text-lg font-bold">
              {action.title}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {action.reason}
            </p>
          </div>

          {/* CTA */}
          <Button
            asChild
            className={`w-full ${colors.button} text-white`}
            size="sm"
          >
            <Link href={action.link}>
              {action.cta}
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
