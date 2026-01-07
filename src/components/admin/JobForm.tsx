"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Loader2 } from "lucide-react";

interface JobFormData {
  id?: string;
  title: string;
  company: string;
  description: string;
  city: string;
  employmentType: string;
  experienceLevel: string;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  preferredBehavior: {
    primary: string;
    traits: string[];
  };
  preferredCareerFit: {
    primary: string;
    secondary: string;
  };
  salaryMin: string;
  salaryMax: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  isEdit?: boolean;
}

const defaultFormData: JobFormData = {
  title: "",
  company: "",
  description: "",
  city: "",
  employmentType: "full-time",
  experienceLevel: "mid",
  minExperienceYears: null,
  maxExperienceYears: null,
  requiredSkills: [],
  preferredSkills: [],
  preferredBehavior: { primary: "", traits: [] },
  preferredCareerFit: { primary: "", secondary: "" },
  salaryMin: "",
  salaryMax: "",
  isFeatured: false,
  isActive: true,
};

const cities = [
  "تهران",
  "اصفهان",
  "مشهد",
  "شیراز",
  "تبریز",
  "کرج",
  "اهواز",
  "قم",
  "کرمانشاه",
  "رشت",
];

const discStyles = [
  { value: "result-oriented", label: "نتیجه‌گرا (D)" },
  { value: "people-oriented", label: "مردم‌گرا (I)" },
  { value: "stable", label: "ثبات‌طلب (S)" },
  { value: "precise", label: "دقیق (C)" },
];

const hollandTypes = [
  { value: "realistic", label: "عملگرا (R)" },
  { value: "investigative", label: "پژوهشگر (I)" },
  { value: "artistic", label: "هنرمند (A)" },
  { value: "social", label: "اجتماعی (S)" },
  { value: "enterprising", label: "کارآفرین (E)" },
  { value: "conventional", label: "قراردادی (C)" },
];

export default function JobForm({ initialData, isEdit = false }: JobFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newRequiredSkill, setNewRequiredSkill] = useState("");
  const [newPreferredSkill, setNewPreferredSkill] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("عنوان شغل الزامی است");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit
        ? `/api/admin/jobs/${initialData?.id}`
        : "/api/admin/jobs";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          minExperienceYears: formData.minExperienceYears || null,
          maxExperienceYears: formData.maxExperienceYears || null,
          preferredBehavior: formData.preferredBehavior.primary
            ? formData.preferredBehavior
            : null,
          preferredCareerFit: formData.preferredCareerFit.primary
            ? formData.preferredCareerFit
            : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "خطا در ذخیره شغل");
      }

      router.push("/admin/jobs");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = (type: "required" | "preferred") => {
    const skill = type === "required" ? newRequiredSkill : newPreferredSkill;
    if (!skill.trim()) return;

    const key = type === "required" ? "requiredSkills" : "preferredSkills";
    if (!formData[key].includes(skill.trim())) {
      setFormData({
        ...formData,
        [key]: [...formData[key], skill.trim()],
      });
    }

    if (type === "required") {
      setNewRequiredSkill("");
    } else {
      setNewPreferredSkill("");
    }
  };

  const removeSkill = (type: "required" | "preferred", skill: string) => {
    const key = type === "required" ? "requiredSkills" : "preferredSkills";
    setFormData({
      ...formData,
      [key]: formData[key].filter((s) => s !== skill),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات اصلی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان شغل *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="مثال: حسابدار ارشد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">نام شرکت</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="مثال: شرکت پارسیان"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">توضیحات شغل</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="شرح وظایف، مزایا و سایر اطلاعات..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>شهر</Label>
              <Select
                value={formData.city}
                onValueChange={(value) =>
                  setFormData({ ...formData, city: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب شهر" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع استخدام</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, employmentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">تمام‌وقت</SelectItem>
                  <SelectItem value="part-time">پاره‌وقت</SelectItem>
                  <SelectItem value="contract">قراردادی</SelectItem>
                  <SelectItem value="remote">دورکاری</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>سطح تجربه</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, experienceLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">کارشناس (۱-۳ سال)</SelectItem>
                  <SelectItem value="mid">میان‌رده (۳-۵ سال)</SelectItem>
                  <SelectItem value="senior">ارشد (۵+ سال)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minExp">حداقل سال تجربه</Label>
              <Input
                id="minExp"
                type="number"
                min="0"
                max="30"
                value={formData.minExperienceYears || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minExperienceYears: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxExp">حداکثر سال تجربه</Label>
              <Input
                id="maxExp"
                type="number"
                min="0"
                max="30"
                value={formData.maxExperienceYears || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxExperienceYears: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>مهارت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Skills */}
          <div className="space-y-3">
            <Label>مهارت‌های الزامی</Label>
            <div className="flex gap-2">
              <Input
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                placeholder="نام مهارت..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill("required"))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill("required")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("required", skill)}
                    className="hover:text-red-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="space-y-3">
            <Label>مهارت‌های مطلوب</Label>
            <div className="flex gap-2">
              <Input
                value={newPreferredSkill}
                onChange={(e) => setNewPreferredSkill(e.target.value)}
                placeholder="نام مهارت..."
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addSkill("preferred"))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill("preferred")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("preferred", skill)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>ترجیحات شخصیتی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>سبک رفتاری ترجیحی (DISC)</Label>
              <Select
                value={formData.preferredBehavior.primary}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    preferredBehavior: {
                      ...formData.preferredBehavior,
                      primary: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {discStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تیپ شغلی اولیه (Holland)</Label>
              <Select
                value={formData.preferredCareerFit.primary}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    preferredCareerFit: {
                      ...formData.preferredCareerFit,
                      primary: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {hollandTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>تیپ شغلی ثانویه (Holland)</Label>
            <Select
              value={formData.preferredCareerFit.secondary}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  preferredCareerFit: {
                    ...formData.preferredCareerFit,
                    secondary: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید (اختیاری)" />
              </SelectTrigger>
              <SelectContent>
                {hollandTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Salary & Status */}
      <Card>
        <CardHeader>
          <CardTitle>حقوق و وضعیت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">حداقل حقوق (تومان)</Label>
              <Input
                id="salaryMin"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                placeholder="مثال: ۲۵,۰۰۰,۰۰۰"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">حداکثر حقوق (تومان)</Label>
              <Input
                id="salaryMax"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                placeholder="مثال: ۴۰,۰۰۰,۰۰۰"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
              <Label htmlFor="isFeatured">شغل ویژه</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">فعال</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/jobs")}
        >
          انصراف
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          {isEdit ? "ذخیره تغییرات" : "ایجاد شغل"}
        </Button>
      </div>
    </form>
  );
}
