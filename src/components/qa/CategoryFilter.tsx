"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Category {
  value: string | null;
  label: string;
  icon?: string | null;
}

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
  categories?: Category[];
  showMyExpertiseFilter?: boolean;
  myExpertiseOnly?: boolean;
  onMyExpertiseChange?: (value: boolean) => void;
}

const defaultCategories: Category[] = [
  { value: null, label: "همه", icon: "📋" },
  { value: "accounting", label: "حسابداری", icon: "📊" },
  { value: "finance", label: "مالی", icon: "💰" },
  { value: "tax", label: "مالیات", icon: "🏛️" },
  { value: "insurance", label: "بیمه", icon: "🛡️" },
  { value: "investment", label: "بورس", icon: "📈" },
  { value: "audit", label: "حسابرسی", icon: "🔍" },
  { value: "budgeting", label: "بودجه", icon: "📋" },
  { value: "cost", label: "بهای تمام‌شده", icon: "⚙️" },
];

export default function CategoryFilter({
  selected,
  onSelect,
  categories = defaultCategories,
  showMyExpertiseFilter = false,
  myExpertiseOnly = false,
  onMyExpertiseChange,
}: CategoryFilterProps) {
  // Merge default "همه" with dynamic categories
  const allCategories: Category[] = [
    { value: null, label: "همه", icon: "📋" },
    ...categories.filter((c) => c.value !== null),
  ];

  return (
    <div className="space-y-4">
      {/* My Expertise Filter Toggle */}
      {showMyExpertiseFilter && onMyExpertiseChange && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <Label htmlFor="my-expertise" className="text-sm font-medium text-indigo-800 cursor-pointer">
              فقط سؤال‌های مرتبط با تخصص من
            </Label>
          </div>
          <Switch
            id="my-expertise"
            checked={myExpertiseOnly}
            onCheckedChange={onMyExpertiseChange}
          />
        </div>
      )}

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map((cat) => (
          <Button
            key={cat.value || "all"}
            variant={selected === cat.value ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 gap-1",
              selected === cat.value && "bg-primary"
            )}
            onClick={() => onSelect(cat.value)}
          >
            {cat.icon && <span className="text-sm">{cat.icon}</span>}
            {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
