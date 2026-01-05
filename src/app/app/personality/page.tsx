"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import AssessmentCard from "@/components/assessments/AssessmentCard";
import { ASSESSMENTS } from "@/lib/assessments";
import { Brain } from "lucide-react";

export default function AssessmentsPage() {
  const router = useRouter();

  const handleStartAssessment = (id: string) => {
    // TODO: Navigate to actual test page when implemented
    // For now, show alert
    alert(`آزمون "${id}" هنوز پیاده‌سازی نشده است.`);

    // Future implementation:
    // router.push(`/app/assessments/${id}`);
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">آزمون‌ها و ارزیابی‌ها</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          انجام آزمون‌ها اختیاری است، اما تکمیل آن‌ها شانس دیده‌شدن پروفایل شما را
          افزایش می‌دهد.
        </p>
      </div>

      {/* Assessments Grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {ASSESSMENTS.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            onStart={handleStartAssessment}
          />
        ))}
      </div>

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <div className="text-center space-y-1">
            <p className="text-xs md:text-sm font-medium text-primary">
              ✓ نتایج آزمون‌ها خصوصی هستند
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
              شما کنترل کامل دارید که کدام نتایج در پروفایل عمومی شما نمایش داده شود.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
