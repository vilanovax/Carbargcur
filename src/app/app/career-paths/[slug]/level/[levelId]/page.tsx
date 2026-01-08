"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  Lightbulb,
  PartyPopper,
  Target,
  PenLine,
  Eye,
  UserCog,
  Bookmark,
  FileText,
  Search,
  MessageSquarePlus,
  BookOpen,
  Briefcase,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getLevelById,
  getRandomEncouragement,
  type CareerLevel,
  type LevelTask,
  type TaskStatus,
} from "@/lib/career-tasks";
import { getCareerPathBySlug, PATH_COLORS } from "@/lib/career-paths";
import { cn } from "@/lib/utils";

// Icon mapping for CTAs
const CTA_ICONS: Record<string, React.ElementType> = {
  PenLine,
  Eye,
  UserCog,
  Bookmark,
  FileText,
  Search,
  MessageSquarePlus,
  BookOpen,
  Briefcase,
  UserCheck,
  Target,
};

// User task progress
interface UserTaskProgress {
  levelId: string;
  completedTasks: string[];
  inProgressTask: string | null;
  startedAt: string;
  completedAt: string | null;
}

export default function LevelDetailPage({
  params,
}: {
  params: Promise<{ slug: string; levelId: string }>;
}) {
  const { slug, levelId } = use(params);
  const router = useRouter();
  const [level, setLevel] = useState<CareerLevel | null>(null);
  const [pathTitle, setPathTitle] = useState<string>("");
  const [pathColor, setPathColor] = useState<string>("blue");
  const [progress, setProgress] = useState<UserTaskProgress | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [encouragement, setEncouragement] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    setMounted(true);

    const foundLevel = getLevelById(levelId);
    if (foundLevel) {
      setLevel(foundLevel);
    }

    const path = getCareerPathBySlug(slug);
    if (path) {
      setPathTitle(path.title);
      setPathColor(path.color);
    }

    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`karbarg:level-progress:${levelId}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    // Set random encouragement
    setEncouragement(getRandomEncouragement());
  }, [slug, levelId]);

  const getTaskStatus = (taskId: string): TaskStatus => {
    if (!progress) return "pending";
    if (progress.completedTasks.includes(taskId)) return "completed";
    if (progress.inProgressTask === taskId) return "in_progress";

    // Check if previous tasks are completed
    if (!level) return "locked";
    const taskIndex = level.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === 0) return "pending";

    const previousTasksCompleted = level.tasks
      .slice(0, taskIndex)
      .every((t) => progress.completedTasks.includes(t.id));

    return previousTasksCompleted ? "pending" : "locked";
  };

  const completeTask = (taskId: string) => {
    if (!level) return;

    const newProgress: UserTaskProgress = {
      levelId: level.id,
      completedTasks: [...(progress?.completedTasks || []), taskId],
      inProgressTask: null,
      startedAt: progress?.startedAt || new Date().toISOString(),
      completedAt: null,
    };

    // Check if all tasks are completed
    if (newProgress.completedTasks.length === level.tasks.length) {
      newProgress.completedAt = new Date().toISOString();
      setShowCompletion(true);
    }

    localStorage.setItem(`karbarg:level-progress:${levelId}`, JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  const getProgressPercent = (): number => {
    if (!level || !progress) return 0;
    return Math.round((progress.completedTasks.length / level.tasks.length) * 100);
  };

  const getNextIncompleteTask = (): LevelTask | null => {
    if (!level) return null;
    return level.tasks.find((t) => !progress?.completedTasks.includes(t.id)) || null;
  };

  if (!mounted || !level) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const colors = PATH_COLORS[pathColor] || PATH_COLORS.blue;
  const progressPercent = getProgressPercent();
  const completedCount = progress?.completedTasks.length || 0;
  const totalTasks = level.tasks.length;
  const isLevelComplete = completedCount === totalTasks;
  const nextTask = getNextIncompleteTask();

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl pb-32">
      {/* Level Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full animate-in zoom-in-95">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mb-4">
                <PartyPopper className="w-16 h-16 mx-auto text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">تبریک! 🎉</h2>
              <p className="text-lg mb-4">
                سطح «{level.title}» را با موفقیت کامل کردی
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6 text-right space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>+{level.completionReward.reputation} اعتبار تخصصی</span>
                </p>
                {level.completionReward.badge && (
                  <p className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>نشان: {level.completionReward.badge}</span>
                  </p>
                )}
                {level.completionReward.unlocks.length > 0 && (
                  <p className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>باز شدن سطح بعدی</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {level.completionReward.unlocks.length > 0 ? (
                  <Button onClick={() => router.push(`/app/career-paths/${slug}`)}>
                    رفتن به سطح بعدی
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                ) : (
                  <Button onClick={() => router.push(`/app/career-paths/${slug}`)}>
                    بازگشت به مسیر
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowCompletion(false)}>
                  بستن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/app/career-paths/${slug}`}>
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت به مسیر
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>مسیر: {pathTitle}</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Level {level.levelNumber} – {level.title}
        </h1>

        <p className="text-muted-foreground">{level.goal}</p>
      </div>

      {/* Progress Summary */}
      <Card className="mb-6 bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">پیشرفت این Level</span>
            <span className="text-sm font-bold">{progressPercent}٪</span>
          </div>
          <Progress value={progressPercent} className="h-2 mb-3" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {completedCount} فعالیت انجام شده
            </span>
            {!isLevelComplete && (
              <span className="flex items-center gap-1">
                <Circle className="w-4 h-4" />
                {totalTasks - completedCount} فعالیت باقی‌مانده
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      {!isLevelComplete && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">{encouragement}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-4 mb-6">
        {level.tasks.map((task, index) => {
          const status = getTaskStatus(task.id);
          const isCompleted = status === "completed";
          const isLocked = status === "locked";
          const isExpanded = expandedTask === task.id;
          const Icon = CTA_ICONS[task.microcopy.ctaIcon] || Target;

          return (
            <Card
              key={task.id}
              className={cn(
                "transition-all",
                isCompleted && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                isLocked && "opacity-60"
              )}
            >
              <CardContent className="p-4">
                {/* Task Header */}
                <button
                  onClick={() => !isLocked && setExpandedTask(isExpanded ? null : task.id)}
                  className="w-full text-right"
                  disabled={isLocked}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-semibold", isCompleted && "text-green-700 dark:text-green-300")}>
                          {task.microcopy.title}
                        </h3>
                        {isCompleted && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                            انجام شد
                          </Badge>
                        )}
                      </div>

                      {/* Status Message */}
                      <p className="text-sm text-muted-foreground">
                        {isCompleted
                          ? task.microcopy.completedMessage
                          : isLocked
                          ? "برای باز شدن: تکمیل فعالیت‌های قبلی"
                          : task.microcopy.pendingMessage}
                      </p>
                    </div>

                    {/* Expand Icon */}
                    {!isLocked && !isCompleted && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && !isLocked && !isCompleted && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Description */}
                    <p className="text-sm">{task.microcopy.description}</p>

                    {/* Helper */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{task.microcopy.helper}</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {task.actionUrl && (
                        <Button asChild className="flex-1">
                          <Link href={task.actionUrl}>
                            <Icon className="w-4 h-4 ml-2" />
                            {task.microcopy.cta}
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => completeTask(task.id)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        علامت‌گذاری به عنوان انجام شده
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Level Completion Summary (when complete) */}
      {isLevelComplete && !showCompletion && (
        <Card className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
          <CardContent className="py-4 text-center">
            <PartyPopper className="w-10 h-10 mx-auto text-green-600 mb-2" />
            <h3 className="font-bold text-green-700 dark:text-green-300 mb-1">
              این Level با موفقیت کامل شد!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              +{level.completionReward.reputation} اعتبار تخصصی
              {level.completionReward.badge && ` • نشان: ${level.completionReward.badge}`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suggested Q&A */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">سؤالات پیشنهادی برای تمرین بیشتر</p>
              <p className="text-xs text-muted-foreground mt-1">
                با پاسخ دادن به سؤالات مرتبط، مهارت‌هایت را تقویت کن
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/qa?category=accounting">
                مشاهده سؤالات
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
        <div className="container mx-auto max-w-3xl">
          {isLevelComplete ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-sm font-medium text-green-600 flex items-center gap-2 flex-1">
                <PartyPopper className="w-4 h-4" />
                این سطح را با موفقیت کامل کردی
              </p>
              {level.completionReward.unlocks.length > 0 ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/app/career-paths/${slug}`}>
                    رفتن به سطح بعدی
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/app/career-paths/${slug}`}>
                    بازگشت به مسیر
                  </Link>
                </Button>
              )}
            </div>
          ) : nextTask ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 text-center sm:text-right">
                <p className="text-xs text-muted-foreground">قدم بعدی شما:</p>
                <p className="text-sm font-medium">{nextTask.microcopy.title}</p>
              </div>
              <Button
                onClick={() => setExpandedTask(nextTask.id)}
                className="w-full sm:w-auto"
              >
                انجام فعالیت بعدی
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
