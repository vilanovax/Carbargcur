"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Target } from "lucide-react";
import ExpertLevelBadge from "./ExpertLevelBadge";
import BadgeDisplay from "./BadgeDisplay";

interface ExpertiseCardProps {
  data: {
    expertLevel: {
      code: string;
      titleFa: string;
      titleEn: string;
      description: string;
      colors?: {
        bg: string;
        text: string;
        border: string;
      };
    };
    expertScore: number;
    nextLevel?: {
      level: {
        code: string;
        titleFa: string;
      };
      pointsNeeded: number;
      progress: number;
    } | null;
    stats: {
      totalAnswers: number;
      helpfulReactions: number;
      expertReactions: number;
      featuredAnswers: number;
    };
    badges: {
      code: string;
      titleFa: string;
      description?: string;
      icon: string;
      category: string;
    }[];
  };
  variant?: "full" | "compact";
}

export default function ExpertiseCard({
  data,
  variant = "full",
}: ExpertiseCardProps) {
  const { expertLevel, expertScore, nextLevel, stats, badges } = data;

  if (variant === "compact") {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">سطح تخصص</span>
            </div>
            <ExpertLevelBadge level={expertLevel} size="sm" />
          </div>

          {badges.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">نشان‌ها</span>
              <BadgeDisplay badges={badges} maxDisplay={4} size="sm" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-4 h-4" />
          سطح تخصص
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level */}
        <div className="flex items-center justify-between">
          <ExpertLevelBadge level={expertLevel} size="lg" />
          <div className="text-left">
            <p className="text-2xl font-bold">{expertScore}</p>
            <p className="text-xs text-muted-foreground">امتیاز تخصص</p>
          </div>
        </div>

        {/* Level Description */}
        <p className="text-sm text-muted-foreground">{expertLevel.description}</p>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>تا سطح بعدی</span>
              </div>
              <span className="font-medium">{nextLevel.level.titleFa}</span>
            </div>
            <Progress value={nextLevel.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {nextLevel.pointsNeeded} امتیاز دیگر نیاز دارید
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-700">{stats.totalAnswers}</p>
            <p className="text-xs text-blue-600">پاسخ تخصصی</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <p className="text-lg font-bold text-amber-700">{stats.expertReactions}</p>
            <p className="text-xs text-amber-600">واکنش متخصصانه</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">نشان‌های کسب شده</span>
            </div>
            <BadgeDisplay badges={badges} maxDisplay={6} size="md" />
          </div>
        )}

        {/* Empty Badges State */}
        {badges.length === 0 && (
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              با فعالیت بیشتر، نشان‌های تخصصی کسب کنید
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
