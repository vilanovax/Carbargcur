"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, CheckCircle } from "lucide-react";

export type AssessmentStatus = "active" | "coming-soon" | "completed";

export interface Assessment {
  id: string;
  category: string;
  title: string;
  description: string;
  duration?: string;
  questions?: number;
  status: AssessmentStatus;
  showInProfile?: boolean;
}

interface AssessmentCardProps {
  assessment: Assessment;
  onStart?: (id: string) => void;
}

export default function AssessmentCard({
  assessment,
  onStart,
}: AssessmentCardProps) {
  const isActive = assessment.status === "active";
  const isComingSoon = assessment.status === "coming-soon";
  const isCompleted = assessment.status === "completed";

  const handleClick = () => {
    if (isActive && onStart) {
      onStart(assessment.id);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="mb-2 text-xs"
            >
              {assessment.category}
            </Badge>
            <CardTitle className="text-lg md:text-xl">
              {assessment.title}
            </CardTitle>
          </div>
          {isCompleted && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {assessment.description}
        </p>

        {/* Meta Info - Only for active tests */}
        {isActive && (assessment.duration || assessment.questions) && (
          <div className="flex flex-wrap gap-4 text-xs md:text-sm text-muted-foreground">
            {assessment.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{assessment.duration}</span>
              </div>
            )}
            {assessment.questions && (
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                <span>{assessment.questions} سوال</span>
              </div>
            )}
          </div>
        )}

        {/* Helper Text */}
        {isActive && assessment.showInProfile && (
          <p className="text-xs text-primary bg-primary/5 p-2 rounded border border-primary/20">
            نتیجه این آزمون در پروفایل عمومی شما نمایش داده می‌شود.
          </p>
        )}

        {isComingSoon && (
          <p className="text-xs text-muted-foreground bg-secondary p-2 rounded">
            این آزمون در نسخه‌های بعدی فعال خواهد شد.
          </p>
        )}

        {/* CTA Button */}
        <Button
          onClick={handleClick}
          disabled={!isActive}
          className="w-full text-xs md:text-sm"
          variant={isActive ? "default" : "outline"}
        >
          {isActive && "شروع آزمون"}
          {isComingSoon && "به‌زودی فعال می‌شود"}
          {isCompleted && "مشاهده نتایج"}
        </Button>
      </CardContent>
    </Card>
  );
}
