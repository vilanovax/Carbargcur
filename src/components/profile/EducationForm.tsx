"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEGREE_OPTIONS, type Education } from "@/lib/onboarding";

type EducationFormProps = {
  education?: Education;
  onSave: (education: Education) => void;
  onCancel: () => void;
};

export default function EducationForm({
  education,
  onSave,
  onCancel,
}: EducationFormProps) {
  const [formData, setFormData] = useState<Education>(
    education || {
      degree: undefined,
      field: undefined,
      university: undefined,
    }
  );

  const handleChange = (field: keyof Education, value: string) => {
    setFormData({ ...formData, [field]: value || undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // At least one field must be filled
    if (!formData.degree && !formData.field && !formData.university) {
      alert("لطفاً حداقل یکی از فیلدها را پر کنید.");
      return;
    }

    onSave(formData);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">تحصیلات</CardTitle>
        <p className="text-sm text-muted-foreground">این بخش اختیاری است.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Degree */}
          <div className="space-y-2">
            <Label htmlFor="degree">مقطع تحصیلی</Label>
            <Select
              value={formData.degree || ""}
              onValueChange={(value) => handleChange("degree", value)}
            >
              <SelectTrigger id="degree">
                <SelectValue placeholder="انتخاب مقطع..." />
              </SelectTrigger>
              <SelectContent>
                {DEGREE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field */}
          <div className="space-y-2">
            <Label htmlFor="field">رشته تحصیلی</Label>
            <Input
              id="field"
              type="text"
              value={formData.field || ""}
              onChange={(e) => handleChange("field", e.target.value)}
              placeholder="مثال: حسابداری"
            />
          </div>

          {/* University */}
          <div className="space-y-2">
            <Label htmlFor="university">نام دانشگاه</Label>
            <Input
              id="university"
              type="text"
              value={formData.university || ""}
              onChange={(e) => handleChange("university", e.target.value)}
              placeholder="مثال: دانشگاه تهران"
            />
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
