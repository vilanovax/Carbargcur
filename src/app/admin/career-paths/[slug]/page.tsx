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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Eye,
  Edit,
  Plus,
  GripVertical,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Save,
  Layers,
} from "lucide-react";
import {
  getCareerPathBySlug,
  PATH_COLORS,
  TARGET_AUDIENCE_LABELS,
  type CareerPath,
} from "@/lib/career-paths";
import { getLevelsForPath, type CareerLevel } from "@/lib/career-tasks";
import { cn } from "@/lib/utils";

// Mock performance stats
const MOCK_LEVEL_STATS: Record<string, { users: number; completionRate: number; avgDays: number }> = {
  "acc-level-0": { users: 1240, completionRate: 82, avgDays: 0.5 },
  "acc-level-1": { users: 1016, completionRate: 61, avgDays: 1.8 },
  "acc-level-2": { users: 620, completionRate: 34, avgDays: 3.2 },
  "acc-level-3": { users: 211, completionRate: 18, avgDays: 5.1 },
  "acc-level-4": { users: 38, completionRate: 8, avgDays: 7.0 },
};

export default function AdminPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [path, setPath] = useState<CareerPath | null>(null);
  const [levels, setLevels] = useState<CareerLevel[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPath, setEditedPath] = useState<Partial<CareerPath>>({});

  useEffect(() => {
    const foundPath = getCareerPathBySlug(slug);
    if (foundPath) {
      setPath(foundPath);
      setEditedPath(foundPath);
    }
    setLevels(getLevelsForPath(slug === "accounting-basics" ? "accounting-basics" : slug));
  }, [slug]);

  const handleSave = () => {
    // TODO: Save to backend
    setIsEditing(false);
  };

  if (!path) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const colors = PATH_COLORS[path.color] || PATH_COLORS.blue;
  const totalUsers = Object.values(MOCK_LEVEL_STATS).reduce((max, s) => Math.max(max, s.users), 0);
  const avgCompletion = Math.round(
    Object.values(MOCK_LEVEL_STATS).reduce((sum, s) => sum + s.completionRate, 0) /
      Object.keys(MOCK_LEVEL_STATS).length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/career-paths">
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{path.title}</h1>
            <p className="text-sm text-muted-foreground">{path.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/career-paths/${slug}`} target="_blank">
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
              <Settings className="w-4 h-4 ml-2" />
              ویرایش تنظیمات
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کاربران فعال</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString("fa-IR")}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">میانگین تکمیل</p>
                <p className="text-2xl font-bold">{avgCompletion}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تعداد سطوح</p>
                <p className="text-2xl font-bold">{levels.length}</p>
              </div>
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مدت تخمینی</p>
                <p className="text-2xl font-bold">{path.estimatedMonths} ماه</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Path Settings (Editable) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>تنظیمات مسیر</CardTitle>
            <CardDescription>اطلاعات پایه مسیر را ویرایش کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان مسیر</Label>
                <Input
                  id="title"
                  value={editedPath.title || ""}
                  onChange={(e) => setEditedPath({ ...editedPath, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">زیرعنوان</Label>
                <Input
                  id="subtitle"
                  value={editedPath.subtitle || ""}
                  onChange={(e) => setEditedPath({ ...editedPath, subtitle: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={editedPath.description || ""}
                onChange={(e) => setEditedPath({ ...editedPath, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">مخاطب هدف</Label>
                <Select
                  value={editedPath.targetAudience}
                  onValueChange={(v) =>
                    setEditedPath({ ...editedPath, targetAudience: v as CareerPath["targetAudience"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TARGET_AUDIENCE_LABELS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="months">مدت تخمینی (ماه)</Label>
                <Input
                  id="months"
                  type="number"
                  value={editedPath.estimatedMonths || ""}
                  onChange={(e) =>
                    setEditedPath({ ...editedPath, estimatedMonths: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={editedPath.isActive}
                    onCheckedChange={(checked) => setEditedPath({ ...editedPath, isActive: checked })}
                  />
                  <span className="text-sm">
                    {editedPath.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Levels List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>سطوح مسیر</CardTitle>
            <CardDescription>مدیریت سطوح و فعالیت‌های هر مرحله</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            افزودن سطح
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-12">ترتیب</TableHead>
                <TableHead>عنوان سطح</TableHead>
                <TableHead className="text-center">Taskها</TableHead>
                <TableHead className="text-center">کاربران</TableHead>
                <TableHead className="text-center">نرخ تکمیل</TableHead>
                <TableHead className="text-center">زمان میانگین</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((level, index) => {
                const stats = MOCK_LEVEL_STATS[level.id] || { users: 0, completionRate: 0, avgDays: 0 };
                const isLowCompletion = stats.completionRate < 40;

                return (
                  <TableRow key={level.id}>
                    {/* Drag Handle */}
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>

                    {/* Order */}
                    <TableCell>
                      <Badge variant="outline">{level.levelNumber}</Badge>
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/career-paths/${slug}/level/${level.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {level.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{level.goal}</p>
                      </div>
                    </TableCell>

                    {/* Tasks */}
                    <TableCell className="text-center">
                      <Badge variant="secondary">{level.tasks.length}</Badge>
                    </TableCell>

                    {/* Users */}
                    <TableCell className="text-center">
                      {stats.users.toLocaleString("fa-IR")}
                    </TableCell>

                    {/* Completion Rate */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={stats.completionRate}
                          className={cn("h-2 w-16", isLowCompletion && "[&>div]:bg-red-500")}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            isLowCompletion && "text-red-600 font-medium"
                          )}
                        >
                          {stats.completionRate}%
                        </span>
                        {isLowCompletion && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>

                    {/* Avg Time */}
                    <TableCell className="text-center">
                      <span className="text-sm text-muted-foreground">
                        {stats.avgDays} روز
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/career-paths/${slug}/level/${level.id}`}>
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

      {/* System Recommendations */}
      {levels.some((l) => (MOCK_LEVEL_STATS[l.id]?.completionRate || 0) < 40) && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              پیشنهاد سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {levels
              .filter((l) => (MOCK_LEVEL_STATS[l.id]?.completionRate || 0) < 40)
              .map((level) => (
                <div key={level.id} className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    سطح «{level.title}» نرخ تکمیل پایینی دارد (
                    {MOCK_LEVEL_STATS[level.id]?.completionRate}%)
                  </p>
                  <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 mt-1 mr-4">
                    <li>بررسی Microcopy تسک‌های این سطح</li>
                    <li>ساده‌سازی فعالیت‌های سخت</li>
                    <li>افزودن Helper/Hint برای کاهش ترس</li>
                  </ul>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
