"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import PersianCalendar from "@/components/ui/PersianCalendar";
import type { WorkExperience } from "@/lib/onboarding";
import jalaali from "jalaali-js";

type ExperienceFormProps = {
  experience?: WorkExperience; // undefined for new, defined for edit
  onSave: (experience: WorkExperience) => void;
  onCancel: () => void;
};

interface FormData {
  title: string;
  company: string;
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
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
        startDate: null,
        endDate: null,
        isPresent: false,
        description: "",
      };
    }

    // Convert "1400/6" format to ISO date
    const parseJalaaliDate = (dateStr: string): string | null => {
      if (!dateStr || dateStr === "اکنون" || dateStr === "present") {
        return null;
      }

      try {
        const parts = dateStr.split("/");
        if (parts.length === 2) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          // تبدیل به میلادی
          const { gy, gm, gd } = jalaali.toGregorian(year, month, 15);
          return new Date(gy, gm - 1, gd).toISOString();
        }
      } catch (error) {
        console.error("Error parsing jalaali date:", error);
      }
      return null;
    };

    const startDate = parseJalaaliDate(experience.fromYear);
    const endDate = experience.toYear === "اکنون" || experience.toYear === "present"
      ? null
      : parseJalaaliDate(experience.toYear);

    return {
      title: experience.title,
      company: experience.company,
      startDate,
      endDate,
      isPresent: experience.toYear === "اکنون" || experience.toYear === "present",
      description: experience.description || "",
    };
  };

  const [formData, setFormData] = useState<FormData>(parseExistingData());
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        endDate: null,
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

    if (!formData.startDate) {
      newErrors.startDate = "تاریخ شروع الزامی است.";
    }

    if (!formData.isPresent && !formData.endDate) {
      newErrors.endDate = "تاریخ پایان الزامی است.";
    }

    if (formData.description && formData.description.length > 120) {
      newErrors.description = "توضیحات نباید بیشتر از ۱۲۰ کاراکتر باشد.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // تبدیل تاریخ‌ها از ISO به فرمت "سال/ماه" شمسی
    const formatToJalaali = (isoDate: string): string => {
      const date = new Date(isoDate);
      const { jy, jm } = jalaali.toJalaali(date);
      return `${jy}/${jm}`;
    };

    const fromYear = formData.startDate ? formatToJalaali(formData.startDate) : "";
    const toYear = formData.isPresent
      ? "اکنون"
      : formData.endDate
      ? formatToJalaali(formData.endDate)
      : "";

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

          {/* Start Date */}
          <div className="space-y-2">
            <Label>
              تاریخ شروع <span className="text-destructive">*</span>
            </Label>
            <PersianCalendar
              value={formData.startDate || ""}
              onChange={(date) => handleFieldChange("startDate", date)}
              placeholder="انتخاب تاریخ شروع"
              maxDate={formData.endDate || undefined}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
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
              <>
                <PersianCalendar
                  value={formData.endDate || ""}
                  onChange={(date) => handleFieldChange("endDate", date)}
                  placeholder="انتخاب تاریخ پایان"
                  minDate={formData.startDate || undefined}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate}</p>
                )}
              </>
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
