"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import {
  ACTIVITY_AREAS,
  FINANCE_SKILLS,
  IRAN_CITIES,
  EXPERIENCE_LEVELS,
  JOB_STATUS_OPTIONS,
  EDUCATION_DEGREES,
  FINANCE_FIELDS,
  PRESET_STORAGE_KEYS,
  loadPresets,
  savePresets,
  type PresetCategory,
} from "@/lib/presets";

type PresetType =
  | "activityAreas"
  | "financeSkills"
  | "cities"
  | "experienceLevels"
  | "jobStatus"
  | "educationDegrees"
  | "financeFields";

interface PresetSection {
  type: PresetType;
  title: string;
  description: string;
  defaultData: PresetCategory[];
  storageKey: string;
}

const PRESET_SECTIONS: PresetSection[] = [
  {
    type: "activityAreas",
    title: "حوزه‌های فعالیت مالی",
    description: "حوزه‌هایی که در هنگام ساخت پروفایل نمایش داده می‌شود",
    defaultData: ACTIVITY_AREAS,
    storageKey: PRESET_STORAGE_KEYS.ACTIVITY_AREAS,
  },
  {
    type: "financeSkills",
    title: "مهارت‌های مالی",
    description: "مهارت‌های پیش‌فرض برای انتخاب سریع",
    defaultData: FINANCE_SKILLS,
    storageKey: PRESET_STORAGE_KEYS.FINANCE_SKILLS,
  },
  {
    type: "cities",
    title: "شهرهای ایران",
    description: "لیست شهرها برای انتخاب محل سکونت",
    defaultData: IRAN_CITIES,
    storageKey: PRESET_STORAGE_KEYS.IRAN_CITIES,
  },
  {
    type: "experienceLevels",
    title: "سطوح تجربه",
    description: "بازه‌های تجربه کاری",
    defaultData: EXPERIENCE_LEVELS,
    storageKey: PRESET_STORAGE_KEYS.EXPERIENCE_LEVELS,
  },
  {
    type: "jobStatus",
    title: "وضعیت شغلی",
    description: "وضعیت‌های مختلف اشتغال",
    defaultData: JOB_STATUS_OPTIONS,
    storageKey: PRESET_STORAGE_KEYS.JOB_STATUS_OPTIONS,
  },
  {
    type: "educationDegrees",
    title: "مدارک تحصیلی",
    description: "مقاطع تحصیلی",
    defaultData: EDUCATION_DEGREES,
    storageKey: PRESET_STORAGE_KEYS.EDUCATION_DEGREES,
  },
  {
    type: "financeFields",
    title: "رشته‌های تحصیلی مالی",
    description: "رشته‌های مرتبط با حوزه مالی",
    defaultData: FINANCE_FIELDS,
    storageKey: PRESET_STORAGE_KEYS.FINANCE_FIELDS,
  },
];

export default function AdminPresetsPage() {
  const [presets, setPresets] = useState<Record<PresetType, PresetCategory[]>>(
    {} as Record<PresetType, PresetCategory[]>
  );

  const [newItems, setNewItems] = useState<Record<PresetType, { id: string; label: string; nameEn: string }>>({} as Record<PresetType, { id: string; label: string; nameEn: string }>);

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load all presets from localStorage
    const loaded: Record<PresetType, PresetCategory[]> = {} as Record<PresetType, PresetCategory[]>;

    PRESET_SECTIONS.forEach((section) => {
      loaded[section.type] = loadPresets(section.storageKey, section.defaultData);
    });

    setPresets(loaded);
  }, []);

  const handleAddItem = (type: PresetType) => {
    const newItem = newItems[type];
    if (!newItem || !newItem.id || !newItem.label) return;

    const updated = [...presets[type], { ...newItem }];
    setPresets({ ...presets, [type]: updated });
    setNewItems({ ...newItems, [type]: { id: "", label: "", nameEn: "" } });
    setHasChanges(true);
  };

  const handleDeleteItem = (type: PresetType, id: string) => {
    const updated = presets[type].filter((item) => item.id !== id);
    setPresets({ ...presets, [type]: updated });
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    PRESET_SECTIONS.forEach((section) => {
      savePresets(section.storageKey, presets[section.type]);
    });
    setHasChanges(false);
    alert("✅ تمام تغییرات ذخیره شد");
  };

  const handleResetSection = (type: PresetType, defaultData: PresetCategory[]) => {
    if (
      confirm("آیا مطمئن هستید که می‌خواهید این بخش را به حالت پیش‌فرض برگردانید؟")
    ) {
      setPresets({ ...presets, [type]: defaultData });
      setHasChanges(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">مدیریت پیش‌فرض‌ها</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت گزینه‌های پیش‌فرض اپلیکیشن
          </p>
        </div>

        {hasChanges && (
          <Button onClick={handleSaveAll} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            ذخیره تمام تغییرات
          </Button>
        )}
      </div>

      {/* Warning */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-900">
            ⚠️ توجه: این تغییرات فقط در مرورگر شما ذخیره می‌شود. برای دسترسی همه
            کاربران، باید از پنل ادمین سمت سرور استفاده کنید.
          </p>
        </CardContent>
      </Card>

      {/* Preset Sections */}
      {PRESET_SECTIONS.map((section) => (
        <Card key={section.type}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleResetSection(section.type, section.defaultData)
                }
                className="gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                بازگشت به پیش‌فرض
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Existing Items */}
            <div className="flex flex-wrap gap-2">
              {presets[section.type]?.map((item) => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="text-sm py-1.5 px-3 gap-2"
                >
                  {item.label}
                  {item.nameEn && (
                    <span className="text-xs text-muted-foreground">
                      ({item.nameEn})
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteItem(section.type, item.id)}
                    className="hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add New Item Form */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="شناسه (انگلیسی)"
                  value={newItems[section.type]?.id || ""}
                  onChange={(e) =>
                    setNewItems({
                      ...newItems,
                      [section.type]: {
                        ...newItems[section.type],
                        id: e.target.value,
                      },
                    })
                  }
                  className="font-mono text-sm"
                />
                <Input
                  placeholder="عنوان فارسی"
                  value={newItems[section.type]?.label || ""}
                  onChange={(e) =>
                    setNewItems({
                      ...newItems,
                      [section.type]: {
                        ...newItems[section.type],
                        label: e.target.value,
                      },
                    })
                  }
                />
                <Input
                  placeholder="عنوان انگلیسی (اختیاری)"
                  value={newItems[section.type]?.nameEn || ""}
                  onChange={(e) =>
                    setNewItems({
                      ...newItems,
                      [section.type]: {
                        ...newItems[section.type],
                        nameEn: e.target.value,
                      },
                    })
                  }
                />
                <Button
                  onClick={() => handleAddItem(section.type)}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  افزودن
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
