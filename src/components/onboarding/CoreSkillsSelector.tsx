"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CORE_SKILLS_OPTIONS } from "@/lib/onboarding";

interface CoreSkillsSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}

/**
 * Core Skills Selector - Max 3 skills
 * Simplified version using native select (no command/popover dependency)
 */
export default function CoreSkillsSelector({
  value = [],
  onChange,
  error,
}: CoreSkillsSelectorProps) {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const skill = event.target.value;

    if (!skill) return;

    // Add skill if under limit and not already selected
    if (value.length < 3 && !value.includes(skill)) {
      onChange([...value, skill]);
    }

    // Reset select
    event.target.value = "";
  };

  const handleRemove = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  const availableSkills = CORE_SKILLS_OPTIONS.filter(
    (skill) => !value.includes(skill)
  );

  const canAddMore = value.length < 3;

  return (
    <div className="space-y-3">
      {/* Selected Skills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-blue-100 text-blue-700 border-blue-300 text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemove(skill)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`حذف ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Skill Selector */}
      {canAddMore && (
        <div className="space-y-2">
          <select
            onChange={handleSelect}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={!canAddMore}
            defaultValue=""
          >
            <option value="" disabled>
              {value.length === 0
                ? "اولین مهارت تخصصی خود را انتخاب کنید"
                : value.length === 1
                ? "دومین مهارت تخصصی خود را انتخاب کنید"
                : "سومین مهارت تخصصی خود را انتخاب کنید"}
            </option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground">
            {value.length === 0
              ? "حداقل ۱ مهارت، حداکثر ۳ مهارت"
              : value.length === 1
              ? "می‌توانید دو مهارت دیگر اضافه کنید"
              : value.length === 2
              ? "می‌توانید یک مهارت دیگر اضافه کنید"
              : "حداکثر تعداد مهارت انتخاب شده"}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* Limit reached message */}
      {value.length >= 3 && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
          ✓ سه مهارت تخصصی انتخاب شده (حداکثر مجاز)
        </p>
      )}
    </div>
  );
}
