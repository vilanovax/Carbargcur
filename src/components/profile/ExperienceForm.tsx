"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { WorkExperience } from "@/lib/onboarding";
import {
  getJalaaliYearOptions,
  JALAALI_MONTHS,
  getCurrentJalaaliYear,
} from "@/lib/jalaali";

type ExperienceFormProps = {
  experience?: WorkExperience; // undefined for new, defined for edit
  onSave: (experience: WorkExperience) => void;
  onCancel: () => void;
};

interface FormData {
  title: string;
  company: string;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  isPresent: boolean;
  description?: string;
}

export default function ExperienceForm({
  experience,
  onSave,
  onCancel,
}: ExperienceFormProps) {
  // Parse existing experience data
  const parseExistingData = (): FormData => {
    if (!experience) {
      return {
        title: "",
        company: "",
        startYear: null,
        startMonth: 1,
        endYear: null,
        endMonth: null,
        isPresent: false,
        description: "",
      };
    }

    // Try to parse fromYear/toYear (format: "1400" or "1400/6" or "اکنون")
    let startYear = null;
    let startMonth = 1;
    let endYear = null;
    let endMonth = null;
    let isPresent = false;

    if (experience.fromYear) {
      const parts = experience.fromYear.split("/");
      startYear = parseInt(parts[0]) || null;
      startMonth = parts[1] ? parseInt(parts[1]) : 1;
    }

    if (experience.toYear === "اکنون" || experience.toYear === "present") {
      isPresent = true;
    } else if (experience.toYear) {
      const parts = experience.toYear.split("/");
      endYear = parseInt(parts[0]) || null;
      endMonth = parts[1] ? parseInt(parts[1]) : null;
    }

    return {
      title: experience.title,
      company: experience.company,
      startYear,
      startMonth,
      endYear,
      endMonth,
      isPresent,
      description: experience.description || "",
    };
  };

  const [formData, setFormData] = useState<FormData>(parseExistingData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const yearOptions = getJalaaliYearOptions(1350, getCurrentJalaaliYear());

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });

    // Clear error
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // If "isPresent" is checked, clear end date
    if (field === "isPresent" && value === true) {
      setFormData({
        ...formData,
        isPresent: true,
        endYear: null,
        endMonth: null,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "عنوان شغلی الزامی است.";
    }

    if (!formData.company?.trim()) {
      newErrors.company = "نام شرکت الزامی است.";
    }

    if (!formData.startYear) {
      newErrors.startYear = "سال شروع الزامی است.";
    }

    if (!formData.startMonth) {
      newErrors.startMonth = "ماه شروع الزامی است.";
    }

    if (!formData.isPresent && !formData.endYear) {
      newErrors.endYear = "سال پایان الزامی است.";
    }

    if (!formData.isPresent && !formData.endMonth) {
      newErrors.endMonth = "ماه پایان الزامی است.";
    }

    if (formData.description && formData.description.length > 120) {
      newErrors.description = "توضیحات نباید بیشتر از ۱۲۰ کاراکتر باشد.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format dates as "1400/6" for storage
    const fromYear = `${formData.startYear}/${formData.startMonth}`;
    const toYear = formData.isPresent
      ? "اکنون"
      : `${formData.endYear}/${formData.endMonth}`;

    // Generate ID for new experience
    const finalData: WorkExperience = {
      id: experience?.id || Date.now().toString(),
      title: formData.title!.trim(),
      company: formData.company!.trim(),
      fromYear,
      toYear,
      description: formData.description?.trim() || undefined,
    };

    onSave(finalData);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          {experience ? "ویرایش سابقه کاری" : "افزودن سابقه کاری"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              عنوان شغلی <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="مثال: حسابدار ارشد"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">
              نام شرکت <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company"
              type="text"
              value={formData.company || ""}
              onChange={(e) => handleFieldChange("company", e.target.value)}
              placeholder="مثال: شرکت سرمایه‌گذاری البرز"
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company}</p>
            )}
          </div>

          {/* Start Date (Shamsi) */}
          <div className="space-y-2">
            <Label>
              تاریخ شروع <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Select
                  value={formData.startYear?.toString() || ""}
                  onValueChange={(value) =>
                    handleFieldChange("startYear", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="سال" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startYear && (
                  <p className="text-sm text-destructive">{errors.startYear}</p>
                )}
              </div>

              <div className="space-y-2">
                <Select
                  value={formData.startMonth?.toString() || ""}
                  onValueChange={(value) =>
                    handleFieldChange("startMonth", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ماه" />
                  </SelectTrigger>
                  <SelectContent>
                    {JALAALI_MONTHS.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startMonth && (
                  <p className="text-sm text-destructive">{errors.startMonth}</p>
                )}
              </div>
            </div>
          </div>

          {/* End Date (Shamsi) */}
          <div className="space-y-2">
            <Label>
              تاریخ پایان <span className="text-destructive">*</span>
            </Label>

            {/* "اکنون" Checkbox */}
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="isPresent"
                checked={formData.isPresent}
                onCheckedChange={(checked) =>
                  handleFieldChange("isPresent", checked === true)
                }
              />
              <Label htmlFor="isPresent" className="cursor-pointer text-sm">
                هنوز در این شرکت مشغول به کار هستم
              </Label>
            </div>

            {!formData.isPresent && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Select
                    value={formData.endYear?.toString() || ""}
                    onValueChange={(value) =>
                      handleFieldChange("endYear", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="سال" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem
                          key={year.value}
                          value={year.value.toString()}
                        >
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.endYear && (
                    <p className="text-sm text-destructive">{errors.endYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Select
                    value={formData.endMonth?.toString() || ""}
                    onValueChange={(value) =>
                      handleFieldChange("endMonth", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ماه" />
                    </SelectTrigger>
                    <SelectContent>
                      {JALAALI_MONTHS.map((month) => (
                        <SelectItem
                          key={month.value}
                          value={month.value.toString()}
                        >
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.endMonth && (
                    <p className="text-sm text-destructive">{errors.endMonth}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              توضیحات{" "}
              <span className="text-xs text-muted-foreground">(اختیاری)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="توضیح مختصر درباره مسئولیت‌ها..."
              maxLength={120}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-left" dir="ltr">
              {formData.description?.length || 0} / 120
            </p>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit">ذخیره</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              لغو
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
