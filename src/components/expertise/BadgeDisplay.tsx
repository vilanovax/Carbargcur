"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgeInfo {
  code: string;
  titleFa: string;
  description?: string;
  icon: string;
  category: string;
}

interface BadgeDisplayProps {
  badges: BadgeInfo[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
}

const categoryColors: Record<string, string> = {
  participation: "bg-blue-50 border-blue-200",
  quality: "bg-amber-50 border-amber-200",
  domain: "bg-green-50 border-green-200",
};

export default function BadgeDisplay({
  badges,
  maxDisplay = 5,
  size = "md",
}: BadgeDisplayProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base",
    lg: "w-10 h-10 text-lg",
  };

  if (badges.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {displayBadges.map((badge) => (
          <Tooltip key={badge.code}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border cursor-default",
                  sizeClasses[size],
                  categoryColors[badge.category] || "bg-slate-50 border-slate-200"
                )}
              >
                {badge.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">{badge.titleFa}</p>
                {badge.description && (
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border bg-slate-100 border-slate-200 text-slate-600",
                  sizeClasses[size]
                )}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">
                و {remainingCount} نشان دیگر
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
