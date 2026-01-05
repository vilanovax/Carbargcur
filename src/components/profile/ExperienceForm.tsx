"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkExperience } from "@/lib/onboarding";

type ExperienceFormProps = {
  experience?: WorkExperience; // undefined for new, defined for edit
  onSave: (experience: WorkExperience) => void;
  onCancel: () => void;
};

export default function ExperienceForm({
  experience,
  onSave,
  onCancel,
}: ExperienceFormProps) {
  const [formData, setFormData] = useState<Partial<WorkExperience>>(
    experience || {
      title: "",
      company: "",
      fromYear: "",
      toYear: "",
      description: "",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof WorkExperience, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
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

    if (!formData.fromYear?.trim()) {
      newErrors.fromYear = "سال شروع الزامی است.";
    }

    if (!formData.toYear?.trim()) {
      newErrors.toYear = "سال پایان الزامی است.";
    }

    if (formData.description && formData.description.length > 120) {
      newErrors.description = "توضیحات نباید بیشتر از ۱۲۰ کاراکتر باشد.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate ID for new experience
    const finalData: WorkExperience = {
      id: experience?.id || Date.now().toString(),
      title: formData.title!.trim(),
      company: formData.company!.trim(),
      fromYear: formData.fromYear!.trim(),
      toYear: formData.toYear!.trim(),
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
              onChange={(e) => handleChange("title", e.target.value)}
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
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="مثال: شرکت سرمایه‌گذاری البرز"
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company}</p>
            )}
          </div>

          {/* From/To Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fromYear">
                از سال <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fromYear"
                type="text"
                value={formData.fromYear || ""}
                onChange={(e) => handleChange("fromYear", e.target.value)}
                placeholder="۱۴۰۰"
                dir="ltr"
              />
              {errors.fromYear && (
                <p className="text-sm text-destructive">{errors.fromYear}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toYear">
                تا سال <span className="text-destructive">*</span>
              </Label>
              <Input
                id="toYear"
                type="text"
                value={formData.toYear || ""}
                onChange={(e) => handleChange("toYear", e.target.value)}
                placeholder="اکنون"
              />
              {errors.toYear && (
                <p className="text-sm text-destructive">{errors.toYear}</p>
              )}
            </div>
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
              onChange={(e) => handleChange("description", e.target.value)}
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
