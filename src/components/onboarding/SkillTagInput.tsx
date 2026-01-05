"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SUGGESTED_SKILLS } from "@/lib/onboarding";

type SkillTagInputProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  maxSkills?: number;
};

export default function SkillTagInput({
  skills,
  onChange,
  error,
  maxSkills = 10,
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (skill) =>
      !skills.includes(skill) &&
      skill.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 8);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();

    // Validation
    if (!trimmed) return;
    if (skills.includes(trimmed)) return; // Duplicate
    if (skills.length >= maxSkills) return; // Max limit

    onChange([...skills, trimmed]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const handleSuggestionClick = (skill: string) => {
    addSkill(skill);
  };

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="جستجو یا افزودن مهارت… (مثال: IFRS)"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          disabled={skills.length >= maxSkills}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                className="w-full text-right px-3 py-2 hover:bg-secondary transition-colors text-sm"
                onClick={() => handleSuggestionClick(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pl-1">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:bg-secondary-foreground/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Hints and errors */}
      <div className="text-sm space-y-1">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="text-muted-foreground space-y-0.5">
            <p>• حداقل ۳ مهارت اضافه کنید.</p>
            <p>• مهارت‌های تکراری ثبت نمی‌شوند.</p>
            <p className="text-xs">
              {skills.length} / {maxSkills} مهارت
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
