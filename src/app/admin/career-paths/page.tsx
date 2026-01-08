"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Compass,
  Plus,
  Eye,
  Edit,
  Copy,
  Users,
  Layers,
  TrendingUp,
  Calculator,
  Receipt,
  Shield,
  ClipboardCheck,
} from "lucide-react";
import { getActiveCareerPaths, PATH_COLORS, type CareerPath } from "@/lib/career-paths";
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

// Mock stats - will be replaced with real data
const MOCK_STATS: Record<string, { users: number; completionRate: number }> = {
  "accounting-basics": { users: 1240, completionRate: 62 },
  "tax-consultant": { users: 890, completionRate: 48 },
  "insurance-risk": { users: 456, completionRate: 71 },
  "corporate-finance": { users: 678, completionRate: 55 },
  "auditing": { users: 234, completionRate: 42 },
};

export default function AdminCareerPathsPage() {
  const paths = getActiveCareerPaths();
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(
    Object.fromEntries(paths.map((p) => [p.id, p.isActive]))
  );

  const toggleActive = (pathId: string) => {
    setActiveStates((prev) => ({
      ...prev,
      [pathId]: !prev[pathId],
    }));
    // TODO: Save to backend
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="w-6 h-6" />
            مسیرهای شغلی
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت مسیرها، سطوح و فعالیت‌های رشد کاربران
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 ml-2" />
          ایجاد مسیر جدید
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل مسیرها</p>
                <p className="text-2xl font-bold">{paths.length}</p>
              </div>
              <Compass className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کاربران فعال</p>
                <p className="text-2xl font-bold">
                  {Object.values(MOCK_STATS).reduce((sum, s) => sum + s.users, 0).toLocaleString("fa-IR")}
                </p>
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
                <p className="text-2xl font-bold">
                  {Math.round(
                    Object.values(MOCK_STATS).reduce((sum, s) => sum + s.completionRate, 0) /
                      Object.keys(MOCK_STATS).length
                  )}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل سطوح</p>
                <p className="text-2xl font-bold">
                  {paths.reduce((sum, p) => sum + p.steps.length, 0)}
                </p>
              </div>
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paths Table */}
      <Card>
        <CardHeader>
          <CardTitle>لیست مسیرها</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>عنوان مسیر</TableHead>
                <TableHead className="text-center">سطوح</TableHead>
                <TableHead className="text-center">کاربران</TableHead>
                <TableHead className="text-center">نرخ تکمیل</TableHead>
                <TableHead className="text-center">وضعیت</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paths.map((path) => {
                const Icon = ICONS[path.icon] || Compass;
                const colors = PATH_COLORS[path.color] || PATH_COLORS.blue;
                const stats = MOCK_STATS[path.id] || { users: 0, completionRate: 0 };
                const levels = getLevelsForPath(path.id);
                const isActive = activeStates[path.id];

                return (
                  <TableRow key={path.id}>
                    {/* Icon */}
                    <TableCell>
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          colors.light,
                          "dark:bg-opacity-20"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", colors.text)} />
                      </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/career-paths/${path.slug}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {path.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{path.subtitle}</p>
                      </div>
                    </TableCell>

                    {/* Levels */}
                    <TableCell className="text-center">
                      <Badge variant="outline">{levels.length || path.steps.length}</Badge>
                    </TableCell>

                    {/* Users */}
                    <TableCell className="text-center">
                      <span className="font-medium">{stats.users.toLocaleString("fa-IR")}</span>
                    </TableCell>

                    {/* Completion Rate */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          stats.completionRate >= 60 && "bg-green-50 text-green-700 border-green-200",
                          stats.completionRate >= 40 &&
                            stats.completionRate < 60 &&
                            "bg-amber-50 text-amber-700 border-amber-200",
                          stats.completionRate < 40 && "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {stats.completionRate}%
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleActive(path.id)}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/app/career-paths/${path.slug}`} target="_blank">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/career-paths/${path.slug}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="w-4 h-4" />
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
    </div>
  );
}
