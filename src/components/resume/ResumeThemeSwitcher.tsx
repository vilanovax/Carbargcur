"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette } from "lucide-react";
import {
  type ResumeTheme,
  RESUME_THEMES,
  DEFAULT_RESUME_THEME,
  getSelectedResumeTheme,
  saveSelectedResumeTheme,
} from "@/lib/resumeThemes";

interface ResumeThemeSwitcherProps {
  isProfileComplete: boolean;
  onThemeChange?: (theme: ResumeTheme) => void;
}

export default function ResumeThemeSwitcher({
  isProfileComplete,
  onThemeChange,
}: ResumeThemeSwitcherProps) {
  const [selectedTheme, setSelectedTheme] =
    useState<ResumeTheme>(DEFAULT_RESUME_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getSelectedResumeTheme();
    setSelectedTheme(saved);
  }, []);

  const handleThemeChange = (theme: ResumeTheme) => {
    setSelectedTheme(theme);
    saveSelectedResumeTheme(theme);
    onThemeChange?.(theme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="shadow-sm print:hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-1">
                انتخاب قالب رزومه
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isProfileComplete
                  ? "قالب دلخواه خود را برای نمایش و دانلود رزومه انتخاب کنید."
                  : "این امکان پس از تکمیل کامل پروفایل فعال می‌شود."}
              </p>
            </div>

            {isProfileComplete ? (
              <RadioGroup
                value={selectedTheme}
                onValueChange={(value) =>
                  handleThemeChange(value as ResumeTheme)
                }
                className="gap-3"
              >
                {RESUME_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-start space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={theme.id} id={theme.id} />
                    <Label
                      htmlFor={theme.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm md:text-base">
                          {theme.label}
                        </span>
                        {theme.isPremium && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            پریمیوم
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {theme.description}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  برای دسترسی به قالب‌های مختلف رزومه، ابتدا پروفایل خود را
                  تکمیل کنید.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
