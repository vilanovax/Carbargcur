"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EmptyStateConfig } from "@/types/emptyState";

interface EmptyStateProps extends EmptyStateConfig {
  variant?: "default" | "compact" | "inline";
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  hint,
  benefit,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";
  const isInline = variant === "inline";

  const content = (
    <div
      className={`
        ${isInline ? "flex items-center gap-4 p-4" : "text-center space-y-4 p-6"}
        ${!isInline ? "border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50" : ""}
      `}
    >
      {/* Icon */}
      {!isInline && (
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
            {icon}
          </div>
        </div>
      )}

      {isInline && (
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className={`${isInline ? "flex-1" : "space-y-3"}`}>
        {/* Title */}
        <h3
          className={`font-semibold ${
            isCompact ? "text-sm" : "text-base"
          } ${isInline ? "text-right" : ""}`}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`text-muted-foreground leading-relaxed ${
            isCompact ? "text-xs" : "text-sm"
          } ${isInline ? "text-right mt-1" : ""}`}
        >
          {description}
        </p>

        {/* Benefit Badge */}
        {benefit && !isInline && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
            <span>✓</span>
            {benefit}
          </div>
        )}

        {/* Actions */}
        {!isInline && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            {/* Primary Action */}
            {primaryAction.href ? (
              <Button asChild size={isCompact ? "sm" : "default"} className="w-full sm:w-auto">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                onClick={primaryAction.onClick}
                size={isCompact ? "sm" : "default"}
                className="w-full sm:w-auto"
              >
                {primaryAction.label}
              </Button>
            )}

            {/* Secondary Action */}
            {secondaryAction && (
              <>
                {secondaryAction.href ? (
                  <Button
                    asChild
                    variant="ghost"
                    size={isCompact ? "sm" : "default"}
                    className="w-full sm:w-auto"
                  >
                    <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                  </Button>
                ) : (
                  <Button
                    onClick={secondaryAction.onClick}
                    variant="ghost"
                    size={isCompact ? "sm" : "default"}
                    className="w-full sm:w-auto"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Inline Actions */}
        {isInline && (
          <div className="flex items-center gap-2 mt-2">
            {primaryAction.href ? (
              <Button asChild size="sm" variant="outline">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button onClick={primaryAction.onClick} size="sm" variant="outline">
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}

        {/* Hint */}
        {hint && !isInline && (
          <p className="text-xs text-muted-foreground pt-2">{hint}</p>
        )}
      </div>
    </div>
  );

  // Wrap in Card for default variant
  if (variant === "default") {
    return <Card className="shadow-sm">{content}</Card>;
  }

  return content;
}
