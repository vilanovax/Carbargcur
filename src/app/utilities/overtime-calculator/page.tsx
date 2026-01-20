"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { Calculator, Info, CheckCircle, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function OvertimeCalculatorPage() {
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [overtimeHours, setOvertimeHours] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calculateOvertime = () => {
    const base = parseFloat(baseSalary) || 0;
    const hours = parseFloat(overtimeHours) || 0;

    if (base <= 0) {
      alert("لطفاً حقوق پایه را وارد کنید");
      return;
    }

    if (hours <= 0) {
      alert("لطفاً ساعات اضافه‌کاری را وارد کنید");
      return;
    }

    // محاسبات
    const baseHours = 220; // ساعات کاری ماهانه
    const overtimeMultiplier = 1.4; // 140%

    const hourlyRate = base / baseHours;
    const overtimeHourlyRate = hourlyRate * overtimeMultiplier;
    const totalOvertimePay = overtimeHourlyRate * hours;
    const totalSalary = base + totalOvertimePay;

    setResult({
      baseSalary: base,
      hourlyRate,
      overtimeHourlyRate,
      overtimeHours: hours,
      overtimePay: totalOvertimePay,
      totalSalary,
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(Math.round(num));
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزار رایگان
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                محاسبه اضافه‌کاری و حقوق ساعتی
              </h1>
              <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                محاسبه سریع دستمزد اضافه‌کاری بر اساس حقوق ساعتی
                <br />
                ساده، سریع و دقیق
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                این ابزار به شما کمک می‌کند تا دستمزد اضافه‌کاری خود را بر اساس
                حقوق پایه و ساعات کار اضافی محاسبه کنید.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    ورود اطلاعات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">حقوق پایه ماهانه (تومان)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      placeholder="مثال: ۱۵,۰۰۰,۰۰۰ تومان"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      حقوق پایه بدون مزایا و اضافه‌کاری
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overtimeHours">ساعات اضافه‌کاری</Label>
                    <Input
                      id="overtimeHours"
                      type="number"
                      step="0.5"
                      placeholder="مثال: ۲۰ ساعت"
                      value={overtimeHours}
                      onChange={(e) => setOvertimeHours(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      تعداد ساعات کار اضافی در ماه
                    </p>
                  </div>

                  <Button onClick={calculateOvertime} className="w-full" size="lg">
                    محاسبه اضافه‌کاری
                  </Button>
                </CardContent>
              </Card>

              {/* Result Card */}
              <Card className={result ? "border-2 border-primary" : ""}>
                <CardHeader>
                  <CardTitle>نتیجه محاسبه</CardTitle>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-2">با وارد کردن اطلاعات،</p>
                      <p className="text-sm">
                        دستمزد اضافه‌کاری شما محاسبه می‌شود.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Total Overtime Pay */}
                      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-xl p-6 text-center border-2 border-orange-500/20">
                        <p className="text-sm text-muted-foreground mb-2">
                          دستمزد اضافه‌کاری
                        </p>
                        <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                          {formatNumber(result.overtimePay)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">تومان</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-sm mb-3">جزئیات محاسبه</h3>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            • حقوق پایه
                          </span>
                          <span className="font-medium">
                            {formatNumber(result.baseSalary)} تومان
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            • حقوق ساعتی
                          </span>
                          <span className="font-medium">
                            {formatNumber(result.hourlyRate)} تومان
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">
                            • نرخ اضافه‌کاری (×۱٫۴)
                          </span>
                          <span className="font-medium text-green-600">
                            {formatNumber(result.overtimeHourlyRate)} تومان
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            • ساعات اضافه‌کاری
                          </span>
                          <span className="font-medium">
                            {result.overtimeHours.toLocaleString("fa-IR")} ساعت
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t font-bold">
                          <span>جمع کل حقوق:</span>
                          <span className="text-primary">
                            {formatNumber(result.totalSalary)} تومان
                          </span>
                        </div>
                      </div>

                      {/* Formula Explanation */}
                      <div className="pt-4 border-t">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs space-y-2 text-muted-foreground">
                          <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            فرمول محاسبه:
                          </p>
                          <p>
                            <strong>حقوق ساعتی =</strong> حقوق پایه ÷ ۲۲۰ ساعت
                          </p>
                          <p>
                            <strong>نرخ اضافه‌کاری =</strong> حقوق ساعتی × ۱٫۴
                          </p>
                          <p>
                            <strong>دستمزد اضافه‌کاری =</strong> نرخ اضافه‌کاری ×
                            تعداد ساعات
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-6 border-t">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-5 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-right flex-1">
                              <p className="text-sm font-medium mb-2">
                                محاسبه کامل با بیمه و مالیات؟
                              </p>
                              <p className="text-xs text-muted-foreground">
                                از ماشین‌حساب حقوق و دستمزد کامل استفاده کنید
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="default" size="sm" className="w-full">
                            <Link href="/utilities/salary-calculator">
                              ماشین‌حساب کامل حقوق
                              <ArrowLeft className="w-4 h-4 mr-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">چگونه کار می‌کند؟</h2>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        ابتدا حقوق ساعتی از تقسیم حقوق پایه بر ۲۲۰ ساعت محاسبه
                        می‌شود
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        نرخ اضافه‌کاری معادل ۱٫۴ برابر (۱۴۰٪) حقوق ساعتی است
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        دستمزد اضافه‌کاری = نرخ اضافه‌کاری × تعداد ساعات
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">نکات مهم</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• ساعات پایه کاری ماهانه: ۲۲۰ ساعت</li>
                    <li>• ضریب اضافه‌کاری طبق قانون کار: ۱٫۴ (۱۴۰٪)</li>
                    <li>• این محاسبه شامل بیمه و مالیات نمی‌شود</li>
                    <li>• برای محاسبه کامل از ماشین‌حساب حقوق استفاده کنید</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
