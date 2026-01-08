"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  Target,
  Zap,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface KPIs {
  ctr: number;
  conversion: number;
  avgTimeToAction: string;
  avgReputationLift: number;
  fatigueRate: number;
}

interface MicrocopyRow {
  microcopyId: string;
  triggerRule: string;
  views: number;
  ctr: number;
  conversion: number;
  avgRepPlus: number;
  cooldown: string;
  status: "green" | "yellow" | "red";
  isEnabled: boolean;
}

interface SegmentAnalysis {
  [microcopyId: string]: {
    [segment: string]: {
      ctr: number;
      conversion: number;
    };
  };
}

interface Funnel {
  microcopyId: string;
  shown: number;
  clicked: number;
  actions: number;
}

interface DashboardData {
  kpis: KPIs;
  microcopyTable: MicrocopyRow[];
  segmentAnalysis: SegmentAnalysis;
  funnel: Funnel | null;
  meta: {
    days: number;
    totalShown: number;
    totalClicked: number;
    totalActions: number;
  };
}

export default function MicrocopyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("7");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedMicrocopy, setSelectedMicrocopy] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session, days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/microcopy/stats?days=${days}`);

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/app");
          return;
        }
        throw new Error("خطا در دریافت داده‌ها");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const toggleMicrocopy = async (id: string, currentState: boolean) => {
    setTogglingId(id);
    try {
      const response = await fetch("/api/admin/microcopy/definitions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isEnabled: !currentState }),
      });

      if (!response.ok) {
        throw new Error("خطا در تغییر وضعیت");
      }

      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          microcopyTable: prev.microcopyTable.map((m) =>
            m.microcopyId === id ? { ...m, isEnabled: !currentState } : m
          ),
        };
      });

      toast.success(currentState ? "غیرفعال شد" : "فعال شد");
    } catch (error) {
      toast.error("خطا در تغییر وضعیت");
    } finally {
      setTogglingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusColors = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    green: "عالی",
    yellow: "نیاز به بهبود",
    red: "ضعیف",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" />
              داشبورد عملکرد Microcopy
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              تحلیل اثربخشی پیام‌های انگیزشی
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">۷ روز اخیر</SelectItem>
                <SelectItem value="14">۱۴ روز اخیر</SelectItem>
                <SelectItem value="30">۳۰ روز اخیر</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="p-4 text-center">
                <MousePointerClick className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-700">{data.kpis.ctr}%</p>
                <p className="text-xs text-blue-600 font-medium">نرخ کلیک (CTR)</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardContent className="p-4 text-center">
                <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-700">{data.kpis.conversion}%</p>
                <p className="text-xs text-green-600 font-medium">نرخ تبدیل</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-700">{data.kpis.avgTimeToAction}</p>
                <p className="text-xs text-purple-600 font-medium">میانگین زمان تا اقدام</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-700">+{data.kpis.avgReputationLift}</p>
                <p className="text-xs text-amber-600 font-medium">میانگین افزایش اعتبار</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-700">{data.kpis.fatigueRate}%</p>
                <p className="text-xs text-red-600 font-medium">نرخ خستگی</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Performance Table */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                عملکرد هر Microcopy
              </CardTitle>
              <CardDescription>کلیک روی هر ردیف برای مشاهده جزئیات</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شناسه</TableHead>
                    <TableHead>بازدید</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>تبدیل</TableHead>
                    <TableHead>Rep+</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>فعال</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.microcopyTable.map((row) => (
                    <TableRow
                      key={row.microcopyId}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        selectedMicrocopy === row.microcopyId ? "bg-slate-100" : ""
                      }`}
                      onClick={() => setSelectedMicrocopy(row.microcopyId)}
                    >
                      <TableCell className="font-mono text-xs">
                        {row.microcopyId}
                      </TableCell>
                      <TableCell>{row.views.toLocaleString("fa-IR")}</TableCell>
                      <TableCell>{row.ctr}%</TableCell>
                      <TableCell>{row.conversion}%</TableCell>
                      <TableCell>+{row.avgRepPlus}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[row.status]}>
                          {statusLabels[row.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={row.isEnabled}
                          disabled={togglingId === row.microcopyId}
                          onCheckedChange={() =>
                            toggleMicrocopy(row.microcopyId, row.isEnabled)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.microcopyTable || data.microcopyTable.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        داده‌ای برای نمایش وجود ندارد
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Funnel */}
            {data?.funnel && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    قیف تبدیل
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {data.funnel.microcopyId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">نمایش داده شده</span>
                      <span className="font-bold">{data.funnel.shown}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">کلیک شده</span>
                      <span className="font-bold">{data.funnel.clicked}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${data.funnel.shown > 0 ? (data.funnel.clicked / data.funnel.shown) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">اقدام کرده</span>
                      <span className="font-bold">{data.funnel.actions}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{
                          width: `${data.funnel.shown > 0 ? (data.funnel.actions / data.funnel.shown) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Segment Analysis */}
            {selectedMicrocopy && data?.segmentAnalysis[selectedMicrocopy] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    تحلیل سگمنت‌ها
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    {selectedMicrocopy}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(data.segmentAnalysis[selectedMicrocopy]).map(
                    ([segment, stats]) => (
                      <div
                        key={segment}
                        className="p-3 bg-slate-50 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {segment === "new"
                              ? "تازه‌کار"
                              : segment === "junior"
                                ? "مبتدی"
                                : "حرفه‌ای"}
                          </Badge>
                          <span
                            className={`text-sm font-bold ${
                              stats.conversion >= 30
                                ? "text-green-600"
                                : stats.conversion >= 15
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {stats.conversion}% تبدیل
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>CTR: {stats.ctr}%</span>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {/* Summary Stats */}
            {data && (
              <Card className="bg-slate-50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">کل نمایش‌ها</span>
                    <span className="font-medium">{data.meta.totalShown.toLocaleString("fa-IR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">کل کلیک‌ها</span>
                    <span className="font-medium">{data.meta.totalClicked.toLocaleString("fa-IR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">کل اقدامات</span>
                    <span className="font-medium">{data.meta.totalActions.toLocaleString("fa-IR")}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
