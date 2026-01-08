"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles, Target, TrendingUp } from "lucide-react";

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
    <div className="space-y-4">
      {/* HERO: My Expertise Filter Toggle - Most important action */}
      {showMyExpertiseFilter && onMyExpertiseChange && (
        <div
          className={cn(
            "p-4 rounded-xl border-2 transition-all cursor-pointer",
            myExpertiseOnly
              ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-400 shadow-md"
              : "bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-200 hover:border-indigo-300"
          )}
          onClick={() => onMyExpertiseChange(!myExpertiseOnly)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                myExpertiseOnly ? "bg-indigo-200" : "bg-indigo-100"
              )}>
                <Target className={cn(
                  "w-5 h-5",
                  myExpertiseOnly ? "text-indigo-700" : "text-indigo-600"
                )} />
              </div>
              <div>
                <Label
                  htmlFor="my-expertise"
                  className={cn(
                    "text-sm font-bold cursor-pointer block",
                    myExpertiseOnly ? "text-indigo-900" : "text-indigo-800"
                  )}
                >
                  سؤال‌های مرتبط با تخصص من
                </Label>
                <p className="text-xs text-indigo-600 mt-0.5">
                  {myExpertiseOnly && matchedQuestionsCount > 0
                    ? `${matchedQuestionsCount} سؤال دقیقاً مطابق تخصص شما`
                    : "پاسخ به این سؤالات = بیشترین اثر در پروفایل"}
                </p>
              </div>
            </div>
            <Switch
              id="my-expertise"
              checked={myExpertiseOnly}
              onCheckedChange={onMyExpertiseChange}
            />
          </div>
          {/* Incentive microcopy */}
          {!myExpertiseOnly && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-indigo-200">
              <TrendingUp className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] text-indigo-600">
                پاسخ در حوزه تخصصی = اعتبار تخصصی بالاتر
              </span>
            </div>
          )}
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
