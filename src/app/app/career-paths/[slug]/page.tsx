"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Receipt,
  Shield,
  TrendingUp,
  ClipboardCheck,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
  Bookmark,
  BookmarkCheck,
  Play,
  Target,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  getCareerPathBySlug,
  TARGET_AUDIENCE_LABELS,
  PATH_COLORS,
  type CareerPath,
  type CareerPathStep,
} from "@/lib/career-paths";
import { getLevelsForPath } from "@/lib/career-tasks";
import { cn } from "@/lib/utils";

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Calculator,
  Receipt,
  Shield,
  TrendingUp,
  ClipboardCheck,
};

// User progress type
interface UserPathProgress {
  pathId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
  savedForLater?: boolean;
}

export default function CareerPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [path, setPath] = useState<CareerPath | null>(null);
  const [progress, setProgress] = useState<UserPathProgress | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const foundPath = getCareerPathBySlug(slug);
    if (foundPath) {
      setPath(foundPath);
    }

    // Load progress from localStorage
    const savedProgress = localStorage.getItem("karbarg:career-progress");
    if (savedProgress) {
      const allProgress = JSON.parse(savedProgress);
      if (allProgress[slug]) {
        setProgress(allProgress[slug]);
      }
    }
  }, [slug]);

  const startPath = () => {
    if (!path) return;

    const newProgress: UserPathProgress = {
      pathId: path.id,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedProgress = localStorage.getItem("karbarg:career-progress");
    const allProgress = savedProgress ? JSON.parse(savedProgress) : {};
    allProgress[path.id] = newProgress;
    localStorage.setItem("karbarg:career-progress", JSON.stringify(allProgress));

    setProgress(newProgress);
  };

  const saveForLater = () => {
    if (!path) return;

    const savedProgress = localStorage.getItem("karbarg:career-progress");
    const allProgress = savedProgress ? JSON.parse(savedProgress) : {};

    if (allProgress[path.id]) {
      allProgress[path.id].savedForLater = !allProgress[path.id].savedForLater;
    } else {
      allProgress[path.id] = {
        pathId: path.id,
        currentStep: -1,
        completedSteps: [],
        startedAt: "",
        savedForLater: true,
      };
    }

    localStorage.setItem("karbarg:career-progress", JSON.stringify(allProgress));
    setProgress(allProgress[path.id]);
  };

  const isStepCompleted = (stepId: string): boolean => {
    return progress?.completedSteps.includes(stepId) || false;
  };

  const isStepLocked = (stepIndex: number): boolean => {
    if (!progress) return stepIndex > 0;
    return stepIndex > progress.currentStep + 1;
  };

  const isStepCurrent = (stepIndex: number): boolean => {
    if (!progress) return stepIndex === 0;
    return stepIndex === progress.currentStep;
  };

  const getProgressPercent = (): number => {
    if (!path || !progress) return 0;
    return Math.round((progress.completedSteps.length / path.steps.length) * 100);
  };

  if (!mounted || !path) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const Icon = ICONS[path.icon] || Target;
  const colors = PATH_COLORS[path.color] || PATH_COLORS.blue;
  const audience = TARGET_AUDIENCE_LABELS[path.targetAudience];
  const progressPercent = getProgressPercent();
  const isStarted = progress && progress.startedAt;
  const isSaved = progress?.savedForLater;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl pb-28">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/app/career-paths">
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به مسیرها
        </Link>
      </Button>

      {/* Hero Section */}
      <Card className={cn("mb-6 overflow-hidden", colors.border)}>
        <div className={cn("h-2", colors.bg)} />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
                colors.light,
                "dark:bg-opacity-20"
              )}
            >
              <Icon className={cn("w-8 h-8", colors.text)} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{path.title}</h1>
              <p className="text-muted-foreground mb-3">{path.subtitle}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {audience.icon} {audience.label}
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 ml-1" />
                  {path.estimatedMonths} ماه
                </Badge>
                <Badge variant="outline">{path.steps.length} مرحله</Badge>
              </div>

              <p className="text-sm text-foreground/80">{path.description}</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
            {!isStarted ? (
              <>
                <Button onClick={startPath} size="lg" className="flex-1">
                  <Play className="w-4 h-4 ml-2" />
                  شروع این مسیر
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={saveForLater}
                  className="flex-1"
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 ml-2" />
                      ذخیره شده
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 ml-2" />
                      ذخیره برای بعد
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button size="lg" className="flex-1">
                <ArrowLeft className="w-4 h-4 ml-2" />
                ادامه مسیر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview (if started) */}
      {isStarted && (
        <Card className="mb-6 bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">پیشرفت شما در این مسیر</span>
              <span className="text-sm font-bold">{progressPercent}٪</span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                سطح فعلی:{" "}
                <span className="font-medium text-foreground">
                  {path.steps[progress?.currentStep || 0]?.title}
                </span>
              </span>
              {(progress?.currentStep || 0) < path.steps.length - 1 && (
                <span>
                  سطح بعدی: {path.steps[(progress?.currentStep || 0) + 1]?.title}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline / Steps */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          مراحل مسیر
        </h2>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-border" />

          {/* Steps */}
          <div className="space-y-4">
            {path.steps.map((step, index) => {
              const completed = isStepCompleted(step.id);
              const locked = isStepLocked(index);
              const current = isStepCurrent(index);
              const expanded = expandedStep === step.id;

              return (
                <div key={step.id} className="relative pr-12">
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      "absolute right-0 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background z-10",
                      completed && "bg-green-500 border-green-500 text-white",
                      current && !completed && "border-primary bg-primary/10",
                      locked && "border-muted bg-muted text-muted-foreground"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : locked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Card */}
                  <Card
                    className={cn(
                      "transition-all",
                      completed && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                      current && !completed && "ring-1 ring-primary/30",
                      locked && "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <button
                        onClick={() => setExpandedStep(expanded ? null : step.id)}
                        className="w-full text-right"
                        disabled={locked}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold flex items-center gap-2">
                              {step.title}
                              {completed && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-100 text-green-700 border-green-300"
                                >
                                  تکمیل شده
                                </Badge>
                              )}
                              {current && !completed && (
                                <Badge variant="outline" className="text-xs">
                                  در حال انجام
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                          {!locked && (
                            <div className="mr-2">
                              {expanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expanded && !locked && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* Skills */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              مهارت‌های این مرحله:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {step.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>زمان تقریبی: {step.estimatedWeeks} هفته</span>
                          </div>

                          {/* CTA for current step */}
                          {current && !completed && (() => {
                            const levels = getLevelsForPath(path.id);
                            const stepLevel = levels.find(l => l.stepId === step.id);
                            return stepLevel ? (
                              <Button size="sm" className="w-full" asChild>
                                <Link href={`/app/career-paths/${slug}/level/${stepLevel.id}`}>
                                  مشاهده جزئیات
                                </Link>
                              </Button>
                            ) : (
                              <Button size="sm" className="w-full">
                                شروع این مرحله
                              </Button>
                            );
                          })()}
                        </div>
                      )}

                      {/* Locked Message */}
                      {locked && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          برای باز شدن: تکمیل مراحل قبلی
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outcomes Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            با تکمیل این مسیر به چه می‌رسی؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {path.outcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Related Q&A Section */}
      <Card className="mb-6 bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">سؤالات پیشنهادی برای این مسیر</p>
                <p className="text-xs text-muted-foreground">
                  با پاسخ دادن به سؤالات مرتبط، مهارت‌هایت را تقویت کن
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/app/qa?category=${path.relatedCategories[0]}`}>
                مشاهده سؤالات
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
        <div className="container mx-auto max-w-3xl">
          {!isStarted ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-sm text-muted-foreground flex-1 text-center sm:text-right">
                برای شروع مسیر {path.title} آماده‌ای؟
              </p>
              <Button onClick={startPath} className="w-full sm:w-auto">
                <Play className="w-4 h-4 ml-2" />
                شروع این مسیر
              </Button>
            </div>
          ) : (() => {
            const currentStep = path.steps[progress?.currentStep || 0];
            const levels = getLevelsForPath(path.id);
            const currentLevel = levels.find(l => l.stepId === currentStep?.id);
            return (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 text-center sm:text-right">
                  <p className="text-xs text-muted-foreground">قدم بعدی شما:</p>
                  <p className="text-sm font-medium">
                    {currentStep?.title}
                  </p>
                </div>
                {currentLevel ? (
                  <Button className="w-full sm:w-auto" asChild>
                    <Link href={`/app/career-paths/${slug}/level/${currentLevel.id}`}>
                      <ArrowLeft className="w-4 h-4 ml-2" />
                      انجام فعالیت بعدی
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    انجام فعالیت بعدی
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
