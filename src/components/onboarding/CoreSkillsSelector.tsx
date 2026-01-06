"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus, Check } from "lucide-react";
import { CORE_SKILLS_OPTIONS } from "@/lib/onboarding";

interface CoreSkillsSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}

/**
 * Core Skills Selector - Max 2 skills
 * Focused selector for top professional skills
 */
export default function CoreSkillsSelector({
  value = [],
  onChange,
  error,
}: CoreSkillsSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (skill: string) => {
    const isAlreadySelected = value.includes(skill);

    if (isAlreadySelected) {
      // Remove skill
      onChange(value.filter((s) => s !== skill));
    } else {
      // Add skill if under limit
      if (value.length < 2) {
        onChange([...value, skill]);
      }
    }

    // Close popover if we've reached 2 skills
    if (value.length >= 1 && !isAlreadySelected) {
      setOpen(false);
    }
  };

  const handleRemove = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  const availableSkills = CORE_SKILLS_OPTIONS.filter(
    (skill) => !value.includes(skill)
  );

  const canAddMore = value.length < 2;

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

      {/* Add Button / Selector */}
      {canAddMore && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-right border-dashed border-2 h-auto py-3"
              type="button"
            >
              <Plus className="h-4 w-4 ml-2" />
              {value.length === 0
                ? "انتخاب مهارت‌های کلیدی (حداکثر ۲ مورد)"
                : "افزودن مهارت دوم"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command className="w-full">
              <CommandInput
                placeholder="جستجو..."
                className="text-right"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  مهارتی یافت نشد
                </CommandEmpty>
                <CommandGroup>
                  {availableSkills.map((skill) => (
                    <CommandItem
                      key={skill}
                      value={skill}
                      onSelect={() => handleSelect(skill)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{skill}</span>
                        {value.includes(skill) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {/* Helper Text */}
      <div className="flex items-start gap-2">
        <div className="text-xs text-muted-foreground leading-relaxed">
          {value.length === 0 && (
            <span>انتخاب کمتر، دیده‌شدن بهتر. فقط قوی‌ترین مهارت‌های خود را انتخاب کنید.</span>
          )}
          {value.length === 1 && (
            <span>می‌توانید یک مهارت دیگر اضافه کنید یا با همین ادامه دهید.</span>
          )}
          {value.length === 2 && (
            <span className="text-green-600 font-medium">
              عالی! دو مهارت کلیدی انتخاب شد.
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {/* Skill Count Indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex gap-1">
          {[0, 1].map((index) => (
            <div
              key={index}
              className={`w-8 h-1 rounded-full transition-colors ${
                index < value.length
                  ? "bg-blue-600"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span>{value.length} از ۲ مهارت</span>
      </div>
    </div>
  );
}
