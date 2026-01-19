"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  GripVertical,
  Edit,
  Eye,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { getLevelById, type LevelTask } from "@/lib/career-tasks";
import { getCareerPathBySlug } from "@/lib/career-paths";
import { cn } from "@/lib/utils";

// Mock task performance data
const MOCK_TASK_STATS: Record<string, {
  views: number;
  started: number;
  completed: number;
  avgDays: number;
  dropOffRate: number;
}> = {
  "acc-0-1": { views: 1240, started: 1180, completed: 1020, avgDays: 0.2, dropOffRate: 18 },
  "acc-0-2": { views: 1020, started: 940, completed: 890, avgDays: 0.3, dropOffRate: 13 },
  "acc-0-3": { views: 890, started: 820, completed: 810, avgDays: 0.1, dropOffRate: 9 },
  "acc-1-1": { views: 1016, started: 850, completed: 620, avgDays: 1.8, dropOffRate: 39 },
  "acc-1-2": { views: 620, started: 580, completed: 540, avgDays: 0.9, dropOffRate: 13 },
  "acc-1-3": { views: 540, started: 520, completed: 500, avgDays: 0.4, dropOffRate: 7 },
  "acc-2-1": { views: 500, started: 380, completed: 210, avgDays: 3.2, dropOffRate: 58 },
  "acc-2-2": { views: 210, started: 180, completed: 140, avgDays: 2.1, dropOffRate: 33 },
  "acc-2-3": { views: 140, started: 120, completed: 100, avgDays: 1.5, dropOffRate: 29 },
};

// Task type labels
const TASK_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  answer: { label: "پاسخ", color: "bg-blue-100 text-blue-700 border-blue-200" },
  vote: { label: "بررسی", color: "bg-green-100 text-green-700 border-green-200" },
  profile: { label: "پروفایل", color: "bg-purple-100 text-purple-700 border-purple-200" },
  case: { label: "Case Study", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function AdminLevelTasksPage({
  params,
}: {
  params: Promise<{ slug: string; levelId: string }>;
}) {
  const { slug, levelId } = use(params);
  const [level, setLevel] = useState<ReturnType<typeof getLevelById>>(null);
  const [pathTitle, setPathTitle] = useState<string>("");
  const [tasks, setTasks] = useState<LevelTask[]>([]);
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const foundLevel = getLevelById(levelId);
    if (foundLevel) {
      setLevel(foundLevel);
      setTasks(foundLevel.tasks);
      setTaskStates(Object.fromEntries(foundLevel.tasks.map((t) => [t.id, true])));
    }

    const path = getCareerPathBySlug(slug);
    if (path) {
      setPathTitle(path.title);
    }
  }, [slug, levelId]);

  const toggleTask = (taskId: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
    // TODO: Save to backend
  };

  const getCompletionRate = (taskId: string): number => {
    const stats = MOCK_TASK_STATS[taskId];
    if (!stats) return 0;
    return Math.round((stats.completed / stats.started) * 100);
  };

  const getPerformanceColor = (rate: number): string => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-amber-600";
    return "text-red-600";
  };

  if (!level) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  // Calculate overall stats
  const totalViews = tasks.reduce((sum, t) => sum + (MOCK_TASK_STATS[t.id]?.views || 0), 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + (MOCK_TASK_STATS[t.id]?.completed || 0), 0);
  const totalStarted = tasks.reduce((sum, t) => sum + (MOCK_TASK_STATS[t.id]?.started || 0), 0);
  const avgCompletionTime = tasks.reduce((sum, t) => sum + (MOCK_TASK_STATS[t.id]?.avgDays || 0), 0) / tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/career-paths/${slug}`}>
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت به مسیر
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{pathTitle}</span>
              <span>•</span>
              <span>Level {level.levelNumber}</span>
            </div>
            <h1 className="text-2xl font-bold">{level.title}</h1>
            <p className="text-sm text-muted-foreground">{level.goal}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/career-paths/${slug}/level/${levelId}`} target="_blank">
              <Eye className="w-4 h-4 ml-2" />
              مشاهده در اپ
            </Link>
          </Button>
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            افزودن Task
          </Button>
        </div>
      </div>

      {/* Level Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل Taskها</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل بازدیدها</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString("fa-IR")}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نرخ تکمیل کل</p>
                <p className="text-2xl font-bold">
                  {totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">زمان میانگین</p>
                <p className="text-2xl font-bold">{avgCompletionTime.toFixed(1)} روز</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>مدیریت Taskها</CardTitle>
          <CardDescription>
            ویرایش، ترتیب‌بندی و بررسی عملکرد هر Task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-12">ترتیب</TableHead>
                <TableHead>عنوان Task</TableHead>
                <TableHead className="text-center">نوع</TableHead>
                <TableHead className="text-center">بازدید</TableHead>
                <TableHead className="text-center">نرخ تکمیل</TableHead>
                <TableHead className="text-center">زمان میانگین</TableHead>
                <TableHead className="text-center">Rep</TableHead>
                <TableHead className="text-center">وضعیت</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => {
                const stats = MOCK_TASK_STATS[task.id] || {
                  views: 0,
                  started: 0,
                  completed: 0,
                  avgDays: 0,
                  dropOffRate: 0,
                };
                const completionRate = getCompletionRate(task.id);
                const isActive = taskStates[task.id];
                const isProblem = completionRate < 50 || stats.dropOffRate > 30;
                const typeStyle = TASK_TYPE_LABELS[task.type] || TASK_TYPE_LABELS.answer;

                return (
                  <TableRow key={task.id} className={cn(!isActive && "opacity-50")}>
                    {/* Drag Handle */}
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>

                    {/* Order */}
                    <TableCell>
                      <Badge variant="outline">{index + 1}</Badge>
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div className="max-w-xs">
                        <Link
                          href={`/admin/career-paths/${slug}/level/${levelId}/task/${task.id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {task.microcopy.title}
                        </Link>
                        {isProblem && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600">نیاز به بهبود</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className={typeStyle.color}>
                        {typeStyle.label}
                      </Badge>
                    </TableCell>

                    {/* Views */}
                    <TableCell className="text-center">
                      <span className="text-sm">{stats.views.toLocaleString("fa-IR")}</span>
                    </TableCell>

                    {/* Completion Rate */}
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Progress
                          value={completionRate}
                          className={cn(
                            "h-2 w-16",
                            completionRate < 50 && "[&>div]:bg-red-500",
                            completionRate >= 50 && completionRate < 70 && "[&>div]:bg-amber-500"
                          )}
                        />
                        <span className={cn("text-sm font-medium", getPerformanceColor(completionRate))}>
                          {completionRate}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Avg Time */}
                    <TableCell className="text-center">
                      <span className="text-sm">{stats.avgDays.toFixed(1)} روز</span>
                    </TableCell>

                    {/* Reputation */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        +{level.completionReward.reputation / tasks.length}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/career-paths/${slug}/level/${levelId}/task/${task.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {tasks.some((t) => {
        const stats = MOCK_TASK_STATS[t.id];
        return stats && (getCompletionRate(t.id) < 50 || stats.dropOffRate > 30);
      }) && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              پیشنهادهای بهبود
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks
              .filter((t) => {
                const stats = MOCK_TASK_STATS[t.id];
                return stats && (getCompletionRate(t.id) < 50 || stats.dropOffRate > 30);
              })
              .map((task) => {
                const stats = MOCK_TASK_STATS[task.id];
                const completionRate = getCompletionRate(task.id);

                return (
                  <div key={task.id} className="border-r-4 border-amber-400 pr-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-amber-800 dark:text-amber-300">
                          Task: {task.microcopy.title}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          {completionRate < 50 && (
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                              <TrendingDown className="w-4 h-4" />
                              <span>نرخ تکمیل پایین ({completionRate}%)</span>
                            </div>
                          )}
                          {stats.dropOffRate > 30 && (
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                              <TrendingDown className="w-4 h-4" />
                              <span>Drop-off بالا ({stats.dropOffRate}%)</span>
                            </div>
                          )}
                        </div>
                        <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 mt-2 mr-4 text-sm">
                          <li>بررسی و ساده‌سازی Microcopy</li>
                          <li>افزودن Helper/Hint واضح‌تر</li>
                          <li>کاهش Reputation Reward یا انتقال به Level بعد</li>
                          <li>تست A/B برای متن‌های مختلف</li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/career-paths/${slug}/level/${levelId}/task/${task.id}`}>
                          ویرایش Task
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Success Stories */}
      {tasks.some((t) => getCompletionRate(t.id) >= 80) && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Taskهای موفق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks
                .filter((t) => getCompletionRate(t.id) >= 80)
                .map((task) => (
                  <div key={task.id} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{task.microcopy.title}</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      {getCompletionRate(task.id)}% تکمیل
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
