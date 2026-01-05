"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { SUGGESTED_SKILLS } from "@/lib/onboarding";

type SkillSelectorProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  maxSkills?: number;
};

export default function SkillSelector({
  skills,
  onChange,
  error,
  maxSkills = 10,
}: SkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter skills based on search
  const filteredSkills = SUGGESTED_SKILLS.filter(
    (skill) =>
      !skills.includes(skill) &&
      skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group skills by category (optional - can be enhanced later)
  const displayedSkills = searchQuery ? filteredSkills : SUGGESTED_SKILLS;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      // Remove skill
      onChange(skills.filter((s) => s !== skill));
    } else {
      // Add skill (check max limit)
      if (skills.length >= maxSkills) return;
      onChange([...skills, skill]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Selected Skills */}
      {skills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">مهارت‌های انتخاب شده:</h3>
            <span className="text-xs text-muted-foreground">
              {skills.length} / {maxSkills}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="default"
                className="gap-2 pl-1 pr-3 py-1.5 text-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="جستجوی مهارت..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Available Skills Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {searchQuery
            ? `${filteredSkills.length} نتیجه یافت شد`
            : "مهارت‌های پیشنهادی:"}
        </h3>

        {displayedSkills.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {displayedSkills.map((skill) => {
              const isSelected = skills.includes(skill);
              const isDisabled = !isSelected && skills.length >= maxSkills;

              return (
                <Button
                  key={skill}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSkill(skill)}
                  disabled={isDisabled}
                  className={`justify-start text-right h-auto py-2.5 px-3 ${
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-secondary"
                  } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="truncate text-sm">{skill}</span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            مهارتی با این عنوان پیدا نشد
          </div>
        )}
      </div>

      {/* Hints and errors */}
      <div className="text-sm space-y-1">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="text-muted-foreground text-xs space-y-1">
            <p>• حداقل ۳ مهارت انتخاب کنید</p>
            <p>• حداکثر {maxSkills} مهارت می‌توانید انتخاب کنید</p>
            {skills.length >= 3 && (
              <p className="text-primary font-medium">
                ✓ تعداد کافی مهارت انتخاب شده است
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
