"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Save,
  Eye,
  Code,
  Type,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { getLevelById, type LevelTask, type TaskMicrocopy } from "@/lib/career-tasks";
import { getCareerPathBySlug } from "@/lib/career-paths";
import { cn } from "@/lib/utils";

// Mock performance data
const MOCK_PERFORMANCE = {
  views: 1016,
  started: 850,
  completed: 620,
  avgDays: 1.8,
  dropOffAfterView: 16,
  dropOffAfterStart: 27,
  last14Days: {
    views: [45, 52, 48, 61, 58, 72, 68, 55, 63, 59, 71, 65, 58, 62],
    completions: [28, 31, 29, 38, 35, 42, 40, 33, 38, 36, 41, 39, 35, 37],
  },
};

export default function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string; levelId: string; taskId: string }>;
}) {
  const { slug, levelId, taskId } = use(params);
  const [task, setTask] = useState<LevelTask | null>(null);
  const [levelTitle, setLevelTitle] = useState<string>("");
  const [pathTitle, setPathTitle] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedMicrocopy, setEditedMicrocopy] = useState<TaskMicrocopy | null>(null);
  const [abVersion, setAbVersion] = useState<"A" | "B">("A");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const level = getLevelById(levelId);
    if (level) {
      setLevelTitle(level.title);
      const foundTask = level.tasks.find((t) => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setEditedMicrocopy(foundTask.microcopy);
      }
    }

    const path = getCareerPathBySlug(slug);
    if (path) {
      setPathTitle(path.title);
    }
  }, [slug, levelId, taskId]);

  const handleSave = () => {
    // TODO: Save to backend
    if (task && editedMicrocopy) {
      setTask({ ...task, microcopy: editedMicrocopy });
    }
    setIsEditing(false);
  };

  if (!task || !editedMicrocopy) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const completionRate = Math.round((MOCK_PERFORMANCE.completed / MOCK_PERFORMANCE.started) * 100);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/career-paths/${slug}/level/${levelId}`}>
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت به Level
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{pathTitle}</span>
              <span>•</span>
              <span>{levelTitle}</span>
            </div>
            <h1 className="text-2xl font-bold">{task.microcopy.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/career-paths/${slug}/level/${levelId}`} target="_blank">
              <Eye className="w-4 h-4 ml-2" />
              مشاهده در اپ
            </Link>
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                انصراف
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 ml-2" />
                ذخیره تغییرات
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              ویرایش Microcopy
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="microcopy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="microcopy">
            <Type className="w-4 h-4 ml-2" />
            Microcopy
          </TabsTrigger>
          <TabsTrigger value="meta">
            <Code className="w-4 h-4 ml-2" />
            تنظیمات Task
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="w-4 h-4 ml-2" />
            عملکرد
          </TabsTrigger>
        </TabsList>

        {/* Microcopy Tab */}
        <TabsContent value="microcopy" className="space-y-6">
          {/* A/B Testing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    A/B Testing
                  </CardTitle>
                  <CardDescription>تست چند نسخه متن برای بهبود نرخ تکمیل</CardDescription>
                </div>
                <RadioGroup value={abVersion} onValueChange={(v) => setAbVersion(v as "A" | "B")}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="A" id="version-a" />
                      <Label htmlFor="version-a">نسخه A (پیش‌فرض)</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="B" id="version-b" />
                      <Label htmlFor="version-b">نسخه B (آزمایشی)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">نحوه کار A/B Testing:</p>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>۸۰٪ کاربران نسخه A را می‌بینند</li>
                      <li>۲۰٪ کاربران نسخه B را می‌بینند</li>
                      <li>پس از ۱۴ روز، نسخه برتر به‌صورت خودکار انتخاب می‌شود</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Microcopy Editor */}
          <Card>
            <CardHeader>
              <CardTitle>ویرایش متن‌ها (نسخه {abVersion})</CardTitle>
              <CardDescription>
                تمام متن‌هایی که کاربر در مراحل مختلف می‌بیند
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  عنوان Task <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={editedMicrocopy.title}
                  onChange={(e) =>
                    setEditedMicrocopy({ ...editedMicrocopy, title: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="پاسخ به یک سؤال ساده حسابداری"
                />
                <p className="text-xs text-muted-foreground">
                  این عنوان در لیست Taskها و کارت Task نمایش داده می‌شود
                </p>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  توضیحات <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={editedMicrocopy.description}
                  onChange={(e) =>
                    setEditedMicrocopy({ ...editedMicrocopy, description: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                  placeholder="حتی یک پاسخ کوتاه هم قابل قبول است..."
                />
                <p className="text-xs text-muted-foreground">
                  توضیح کاملی که کاربر وقتی Task را باز می‌کند می‌بیند
                </p>
              </div>

              <Separator />

              {/* Helper/Hint */}
              <div className="space-y-2">
                <Label htmlFor="helper">
                  Helper / نکته راهنما
                </Label>
                <Textarea
                  id="helper"
                  value={editedMicrocopy.helper}
                  onChange={(e) =>
                    setEditedMicrocopy({ ...editedMicrocopy, helper: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={2}
                  placeholder="اگر مطمئن نیستی، توضیح ساده‌ی خودت را بنویس..."
                />
                <p className="text-xs text-muted-foreground">
                  نکته‌ای که با آیکون 💡 نمایش داده می‌شود و کاربر را راهنمایی می‌کند
                </p>
              </div>

              <Separator />

              {/* CTA Labels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta">
                    دکمه اصلی (CTA) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cta"
                    value={editedMicrocopy.cta}
                    onChange={(e) =>
                      setEditedMicrocopy({ ...editedMicrocopy, cta: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="نوشتن پاسخ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaIcon">آیکون دکمه</Label>
                  <Select
                    value={editedMicrocopy.ctaIcon}
                    onValueChange={(v) =>
                      setEditedMicrocopy({ ...editedMicrocopy, ctaIcon: v })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PenLine">PenLine (قلم)</SelectItem>
                      <SelectItem value="Eye">Eye (چشم)</SelectItem>
                      <SelectItem value="UserCog">UserCog (تنظیمات کاربر)</SelectItem>
                      <SelectItem value="Bookmark">Bookmark (نشانک)</SelectItem>
                      <SelectItem value="Search">Search (جستجو)</SelectItem>
                      <SelectItem value="Target">Target (هدف)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Status Messages */}
              <div className="space-y-4">
                <h3 className="font-semibold">پیام‌های وضعیت</h3>

                <div className="space-y-2">
                  <Label htmlFor="pendingMessage">
                    پیام Pending <span className="text-xs text-muted-foreground">(قبل از شروع)</span>
                  </Label>
                  <Input
                    id="pendingMessage"
                    value={editedMicrocopy.pendingMessage}
                    onChange={(e) =>
                      setEditedMicrocopy({ ...editedMicrocopy, pendingMessage: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="اولین پاسخ شما، مسیر رشدتان را فعال می‌کند."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completedMessage">
                    پیام Completed <span className="text-xs text-muted-foreground">(بعد از تکمیل)</span>
                  </Label>
                  <Input
                    id="completedMessage"
                    value={editedMicrocopy.completedMessage}
                    onChange={(e) =>
                      setEditedMicrocopy({ ...editedMicrocopy, completedMessage: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="پاسخ شما ثبت شد و در پیشرفت این مسیر حساب شد."
                  />
                </div>
              </div>

              <Separator />

              {/* Toast Message */}
              <div className="space-y-4">
                <h3 className="font-semibold">پیام موفقیت (Toast)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="toastMessage">پیام</Label>
                    <Input
                      id="toastMessage"
                      value={editedMicrocopy.completionToast.message}
                      onChange={(e) =>
                        setEditedMicrocopy({
                          ...editedMicrocopy,
                          completionToast: {
                            ...editedMicrocopy.completionToast,
                            message: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="اولین پاسخ شما ثبت شد"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toastReward">پاداش</Label>
                    <Input
                      id="toastReward"
                      value={editedMicrocopy.completionToast.reward}
                      onChange={(e) =>
                        setEditedMicrocopy({
                          ...editedMicrocopy,
                          completionToast: {
                            ...editedMicrocopy.completionToast,
                            reward: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="+۵ اعتبار تخصصی"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Tab */}
        <TabsContent value="meta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات Task</CardTitle>
              <CardDescription>مشخصات فنی و قوانین تکمیل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>نوع Task</Label>
                  <Input value={task.type} disabled />
                </div>
                <div className="space-y-2">
                  <Label>ترتیب</Label>
                  <Input value="1" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>وضعیت</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <span className="text-sm">{isActive ? "فعال" : "غیرفعال"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Validation Rule (Read-only)</Label>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <pre>{JSON.stringify(task.validation, null, 2)}</pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  قوانین تکمیل Task توسط backend تعیین می‌شود
                </p>
              </div>

              {task.actionUrl && (
                <div className="space-y-2">
                  <Label>لینک هدف</Label>
                  <Input value={task.actionUrl} disabled />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">بازدیدها</p>
                    <p className="text-2xl font-bold">{MOCK_PERFORMANCE.views.toLocaleString("fa-IR")}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">شروع شده</p>
                    <p className="text-2xl font-bold">{MOCK_PERFORMANCE.started.toLocaleString("fa-IR")}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((MOCK_PERFORMANCE.started / MOCK_PERFORMANCE.views) * 100)}% از بازدید
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">تکمیل شده</p>
                    <p className="text-2xl font-bold">{MOCK_PERFORMANCE.completed.toLocaleString("fa-IR")}</p>
                    <p className="text-xs text-green-600">{completionRate}% نرخ تکمیل</p>
                  </div>
                  <CheckCircle2 className={cn("w-8 h-8", completionRate >= 70 ? "text-green-500" : "text-amber-500")} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">زمان میانگین</p>
                    <p className="text-2xl font-bold">{MOCK_PERFORMANCE.avgDays.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">روز</p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Details */}
          <Card>
            <CardHeader>
              <CardTitle>جزئیات عملکرد (۱۴ روز اخیر)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Drop-off بعد از مشاهده</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        MOCK_PERFORMANCE.dropOffAfterView > 20 && "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {MOCK_PERFORMANCE.dropOffAfterView}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${MOCK_PERFORMANCE.dropOffAfterView}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Drop-off بعد از شروع</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        MOCK_PERFORMANCE.dropOffAfterStart > 30 && "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {MOCK_PERFORMANCE.dropOffAfterStart}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${MOCK_PERFORMANCE.dropOffAfterStart}%` }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Recommendations based on data */}
              {(completionRate < 60 || MOCK_PERFORMANCE.dropOffAfterStart > 25) && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                        پیشنهادات بهبود عملکرد:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-400 mr-4">
                        {completionRate < 60 && (
                          <li>نرخ تکمیل پایین است - Microcopy را ساده‌تر کنید</li>
                        )}
                        {MOCK_PERFORMANCE.dropOffAfterStart > 25 && (
                          <li>Drop-off بالا - Helper/Hint واضح‌تر اضافه کنید</li>
                        )}
                        <li>A/B تست برای متن‌های مختلف انجام دهید</li>
                        <li>بازخورد کاربران را بررسی کنید</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
