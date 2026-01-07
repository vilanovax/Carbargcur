"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExpertLevelBadgeProps {
  level: {
    code: string;
    titleFa: string;
    colors?: {
      bg: string;
      text: string;
      border: string;
    };
  };
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const LEVEL_ICONS: Record<string, string> = {
  newcomer: "🌱",
  contributor: "💬",
  specialist: "⭐",
  senior: "🏆",
  expert: "🎖️",
  top_expert: "👑",
};

export default function ExpertLevelBadge({
  level,
  size = "md",
  showIcon = true,
}: ExpertLevelBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const colors = level.colors || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        colors.bg,
        colors.text,
        colors.border,
        "font-medium gap-1.5"
      )}
    >
      {showIcon && <span>{LEVEL_ICONS[level.code] || "⭐"}</span>}
      <span>{level.titleFa}</span>
    </Badge>
  );
}
