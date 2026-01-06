"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Award } from "lucide-react";
import type { Certification } from "@/lib/onboarding";

interface CertificationRepeaterProps {
  value: Certification[];
  onChange: (certifications: Certification[]) => void;
  error?: string;
}

/**
 * Certification Repeater - Add/remove certifications (max 3)
 * For professional courses and certificates
 */
export default function CertificationRepeater({
  value = [],
  onChange,
  error,
}: CertificationRepeaterProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (value.length < 3) {
      onChange([...value, { name: "", provider: "" }]);
      setEditingIndex(value.length);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleUpdate = (index: number, field: keyof Certification, newValue: string) => {
    const updated = value.map((cert, i) =>
      i === index ? { ...cert, [field]: newValue } : cert
    );
    onChange(updated);
  };

  const canAddMore = value.length < 3;

  return (
    <div className="space-y-4">
      {/* Existing Certifications */}
      {value.map((cert, index) => (
        <Card key={index} className="relative border-blue-200 bg-blue-50/30">
          <CardContent className="p-4 space-y-3">
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 left-2 p-1 hover:bg-red-100 rounded-full transition-colors text-muted-foreground hover:text-red-600"
              aria-label="حذف گواهی"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Certification Name */}
            <div className="space-y-1.5">
              <Label htmlFor={`cert-name-${index}`} className="text-sm font-medium">
                نام دوره یا گواهی
              </Label>
              <Input
                id={`cert-name-${index}`}
                value={cert.name}
                onChange={(e) => handleUpdate(index, "name", e.target.value)}
                placeholder="مثال: CPA، CFA، ACCA، CFE"
                className="text-sm"
              />
            </div>

            {/* Provider (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor={`cert-provider-${index}`} className="text-sm font-medium text-muted-foreground">
                برگزارکننده (اختیاری)
              </Label>
              <Input
                id={`cert-provider-${index}`}
                value={cert.provider || ""}
                onChange={(e) => handleUpdate(index, "provider", e.target.value)}
                placeholder="مثال: جامعه حسابداران رسمی ایران"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Button */}
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="w-full border-dashed border-2 h-auto py-4"
        >
          <Plus className="h-4 w-4 ml-2" />
          {value.length === 0
            ? "افزودن اولین گواهی یا دوره"
            : `افزودن گواهی (حداکثر ${3 - value.length} مورد دیگر)`}
        </Button>
      )}

      {/* Helper Text */}
      <div className="flex items-start gap-2">
        <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {value.length === 0 ? (
            "این بخش برای بسیاری از نقش‌های مالی بسیار تعیین‌کننده است."
          ) : value.length < 3 ? (
            "می‌توانید تا ۳ گواهی یا دوره مهم اضافه کنید."
          ) : (
            <span className="text-green-600 font-medium">
              حداکثر تعداد گواهی‌ها اضافه شد.
            </span>
          )}
        </p>
      </div>

      {/* Certification Count Indicator */}
      {value.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-6 h-1 rounded-full transition-colors ${
                  index < value.length ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span>{value.length} از ۳ گواهی</span>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
