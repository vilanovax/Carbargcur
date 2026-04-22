"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

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
  matchedQuestionsCount?: number;
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
  matchedQuestionsCount = 0,
}: CategoryFilterProps) {
  // Merge default "همه" with dynamic categories
  const allCategories: Category[] = [
    { value: null, label: "همه", icon: "📋" },
    ...categories.filter((c) => c.value !== null),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allCategories.map((cat) => (
        <Button
          key={cat.value || "all"}
          variant={selected === cat.value ? "default" : "outline"}
          size="sm"
          className={cn("h-8 gap-1", selected === cat.value && "bg-primary")}
          onClick={() => onSelect(cat.value)}
        >
          {cat.icon && <span className="text-sm">{cat.icon}</span>}
          {cat.label}
        </Button>
      ))}

      {showMyExpertiseFilter && onMyExpertiseChange && (
        <label
          className={cn(
            "ml-auto flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer transition-colors",
            myExpertiseOnly
              ? "border-indigo-300 bg-indigo-50 text-indigo-900"
              : "border-slate-200 bg-white text-muted-foreground hover:border-slate-300"
          )}
          title={
            matchedQuestionsCount > 0
              ? `${matchedQuestionsCount} سؤال مطابق تخصص شما`
              : "پاسخ در حوزه تخصصی = اعتبار تخصصی بالاتر"
          }
        >
          <Target className="w-3.5 h-3.5" />
          <span>فقط تخصص من</span>
          <Switch
            id="my-expertise"
            checked={myExpertiseOnly}
            onCheckedChange={onMyExpertiseChange}
            className="ml-1"
          />
        </label>
      )}
    </div>
  );
}
