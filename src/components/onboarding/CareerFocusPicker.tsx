"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CAREER_FOCUS_OPTIONS, type CareerFocus } from "@/lib/onboarding";
import { TrendingUp, ArrowUpRight, Users, Briefcase, Target } from "lucide-react";

interface CareerFocusPickerProps {
  value?: CareerFocus;
  onChange: (focus: CareerFocus) => void;
  error?: string;
}

// Icon mapping for each career focus option
const FOCUS_ICONS = {
  growth: TrendingUp,
  pivot: ArrowUpRight,
  leadership: Users,
  freelance: Briefcase,
  opportunity: Target,
} as const;

/**
 * Career Focus Picker - Radio button group with descriptions
 * Helps target job recommendations
 */
export default function CareerFocusPicker({
  value,
  onChange,
  error,
}: CareerFocusPickerProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as CareerFocus)}
        className="space-y-3"
      >
        {CAREER_FOCUS_OPTIONS.map((option) => {
          const Icon = FOCUS_ICONS[option.value];
          const isSelected = value === option.value;

          return (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className={`
                  flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`
                        font-medium text-sm
                        ${isSelected ? "text-blue-900" : "text-gray-900"}
                      `}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <p
                    className={`
                      text-xs leading-relaxed
                      ${isSelected ? "text-blue-700" : "text-muted-foreground"}
                    `}
                  >
                    {option.description}
                  </p>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Helper Text */}
      {!error && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          این انتخاب به پیشنهاد دقیق‌تر فرصت‌ها کمک می‌کند.
        </p>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
