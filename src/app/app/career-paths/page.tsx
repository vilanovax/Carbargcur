"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Compass,
  Calculator,
  Receipt,
  Shield,
  TrendingUp,
  ClipboardCheck,
  Clock,
  ArrowLeft,
  Sparkles,
  Target,
} from "lucide-react";
import {
  getActiveCareerPaths,
  TARGET_AUDIENCE_LABELS,
  PATH_COLORS,
  type CareerPath,
} from "@/lib/career-paths";
import { loadFocusedFromStorage } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Calculator,
  Receipt,
  Shield,
  TrendingUp,
  ClipboardCheck,
};

// Mock user progress (will be replaced with real data later)
interface UserPathProgress {
  pathId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
}

export default function CareerPathsPage() {
  const [paths] = useState<CareerPath[]>(getActiveCareerPaths());
  const [userProgress, setUserProgress] = useState<Record<string, UserPathProgress>>({});
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load user profile for recommendations
    const profile = loadFocusedFromStorage();
    if (profile?.experienceLevel) {
      setExperienceLevel(profile.experienceLevel);
    }

    // Load user progress from localStorage (will be replaced with API)
    const savedProgress = localStorage.getItem("karbarg:career-progress");
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Check if path is recommended for user
  const isRecommended = (path: CareerPath): boolean => {
    if (!experienceLevel) return false;
    if (experienceLevel === "entry" || experienceLevel === "junior") {
      return path.targetAudience === "beginner";
    }
    return path.targetAudience === "intermediate" || path.targetAudience === "all";
  };

  // Get progress percentage for a path
  const getProgressPercent = (path: CareerPath): number => {
    const progress = userProgress[path.id];
    if (!progress) return 0;
    return Math.round((progress.completedSteps.length / path.steps.length) * 100);
  };

  // Check if path is started
  const isStarted = (pathId: string): boolean => {
    return !!userProgress[pathId];
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Compass className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">مسیر شغلی‌ات را انتخاب کن</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          و قدم‌به‌قدم به یک متخصص تبدیل شو
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          هر مسیر شامل مهارت‌ها، فعالیت‌های عملی و پیشرفت قابل مشاهده است
        </p>
      </div>

      {/* Recommendation Banner */}
      {experienceLevel && (experienceLevel === "entry" || experienceLevel === "junior") && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm">
                <span className="font-medium">اگر تازه‌کاری،</span>{" "}
                مسیرهای با نشان{" "}
                <Badge variant="outline" className="mx-1 text-xs">
                  🔰 مناسب تازه‌کار
                </Badge>{" "}
                برای شروع پیشنهاد می‌شوند
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Paths Grid */}
      <div className="grid gap-4">
        {paths.map((path) => {
          const Icon = ICONS[path.icon] || Target;
          const colors = PATH_COLORS[path.color] || PATH_COLORS.blue;
          const audience = TARGET_AUDIENCE_LABELS[path.targetAudience];
          const progress = getProgressPercent(path);
          const started = isStarted(path.id);
          const recommended = isRecommended(path);

          return (
            <Card
              key={path.id}
              className={cn(
                "relative overflow-hidden transition-shadow hover:shadow-md",
                recommended && "ring-1 ring-primary/30",
                colors.border
              )}
            >
              {/* Recommended Badge */}
              {recommended && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-xs">
                    <Sparkles className="w-3 h-3 ml-1" />
                    پیشنهادی
                  </Badge>
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center",
                      colors.light,
                      "dark:bg-opacity-20"
                    )}
                  >
                    <Icon className={cn("w-7 h-7", colors.text)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold">{path.title}</h2>
                      <Badge variant="outline" className="text-xs">
                        {audience.icon} {audience.label}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3">{path.subtitle}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.estimatedMonths} ماه
                      </span>
                      <span>{path.steps.length} مرحله</span>
                    </div>

                    {/* Progress (if started) */}
                    {started && progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">پیشرفت شما</span>
                          <span className="font-medium">{progress}٪</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* CTA */}
                    <Button asChild className="w-full md:w-auto">
                      <Link href={`/app/career-paths/${path.slug}`}>
                        {started ? "ادامه مسیر" : "مشاهده مسیر"}
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="py-6 text-center">
          <h3 className="font-medium mb-2">مسیر مورد نظرت رو پیدا نکردی؟</h3>
          <p className="text-sm text-muted-foreground mb-4">
            به زودی مسیرهای بیشتری اضافه می‌شود. نظرت رو با ما در میان بگذار.
          </p>
          <Button variant="outline" asChild>
            <Link href="/app/qa/ask">پیشنهاد مسیر جدید</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
