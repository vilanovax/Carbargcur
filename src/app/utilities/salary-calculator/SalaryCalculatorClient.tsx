"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { Calculator, Info, CheckCircle, ArrowLeft, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";
import { SalaryCalculatorConfig } from "@/lib/calculator-config";

interface Props {
  config: SalaryCalculatorConfig;
}

export default function SalaryCalculatorClient({ config }: Props) {
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [childrenCount, setChildrenCount] = useState<string>("0");
  const [overtimeHours, setOvertimeHours] = useState<string>("0");
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [result, setResult] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const calculateSalary = () => {
    const base = parseFloat(baseSalary) || 0;
    const children = parseInt(childrenCount) || 0;
    const overtime = parseFloat(overtimeHours) || 0;

    if (base <= 0) {
      alert("لطفاً حقوق پایه را وارد کنید");
      return;
    }

    // استفاده از config برای محاسبات
    // 1. بیمه
    const insurance = hasInsurance ? (base * config.insurance.employee_rate) / 100 : 0;

    // 2. حق اولاد
    const childAllowance = Math.min(children, config.child_allowance.max_children) * config.child_allowance.amount_per_child;

    // 3. اضافه کاری
    const hourlyRate = base / config.overtime.base_hours;
    const overtimePay = overtime * hourlyRate * config.overtime.rate_multiplier;

    // 4. جمع درآمد قبل از مالیات
    const totalBeforeTax = base + childAllowance + overtimePay;

    // 5. مالیات پلکانی با استفاده از config
    let tax = 0;
    let remainingIncome = totalBeforeTax;

    for (const bracket of config.tax_brackets) {
      if (remainingIncome <= 0) break;

      const bracketMin = bracket.min;
      const bracketMax = bracket.max || Infinity;

      if (totalBeforeTax > bracketMin) {
        const taxableInThisBracket = Math.min(
          remainingIncome,
          bracketMax - bracketMin
        );
        tax += taxableInThisBracket * bracket.rate;
        remainingIncome -= taxableInThisBracket;
      }
    }

    // 6. خالص دریافتی
    const netSalary = totalBeforeTax - insurance - tax;

    setResult({
      baseSalary: base,
      insurance,
      tax,
      childAllowance,
      overtimePay,
      totalBeforeTax,
      netSalary,
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزار رایگان
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ماشین حساب حقوق و دستمزد
              </h1>
              <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                محاسبه دقیق حقوق خالص با احتساب بیمه، مالیات، حق اولاد و اضافه‌کاری
                <br />
                بر اساس قوانین حقوق و دستمزد سال {config.year.toLocaleString("fa-IR")}
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                ماشین حساب حقوق و دستمزد کاربرگ به شما کمک می‌کند تا حقوق خالص دریافتی خود را به‌صورت دقیق محاسبه کنید. این ابزار با در نظر گرفتن بیمه تأمین اجتماعی، مالیات پلکانی، حق اولاد و اضافه‌کاری طراحی شده و برای کارکنان، حسابداران و مدیران مالی کاربردی است.
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
                    <Label htmlFor="baseSalary">حقوق پایه (تومان)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      placeholder="مثال: ۱۵,۰۰۰,۰۰۰ تومان"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children">تعداد فرزندان</Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      max={config.child_allowance.max_children}
                      placeholder="0"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      حداکثر {config.child_allowance.max_children.toLocaleString("fa-IR")} فرزند - هر فرزند: {config.child_allowance.amount_per_child.toLocaleString("fa-IR")} تومان
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overtime">ساعات اضافه‌کاری</Label>
                    <Input
                      id="overtime"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={overtimeHours}
                      onChange={(e) => setOvertimeHours(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      ضریب: {config.overtime.rate_multiplier} - ساعات پایه: {config.overtime.base_hours.toLocaleString("fa-IR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="insurance"
                      checked={hasInsurance}
                      onChange={(e) => setHasInsurance(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="insurance" className="cursor-pointer">
                      مشمول بیمه تأمین اجتماعی هستم ({config.insurance.employee_rate}٪)
                    </Label>
                  </div>

                  <Button onClick={calculateSalary} className="w-full" size="lg">
                    محاسبه حقوق خالص
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
                      <p className="font-medium mb-2">
                        با وارد کردن اطلاعات،
                      </p>
                      <p className="text-sm">
                        حقوق خالص، بیمه و مالیات شما محاسبه می‌شود.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* خالص دریافتی - Hero Number */}
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border-2 border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">حقوق خالص دریافتی</p>
                        <p className="text-4xl font-bold text-primary">
                          {formatNumber(result.netSalary)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">تومان</p>
                      </div>

                      {/* جزئیات محاسبه */}
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-sm mb-3">جزئیات محاسبه</h3>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">• حقوق پایه</span>
                          <span className="font-medium">{formatNumber(result.baseSalary)} تومان</span>
                        </div>

                        {result.childAllowance > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600">• حق اولاد</span>
                            <span className="font-medium text-green-600">
                              {formatNumber(result.childAllowance)} تومان
                            </span>
                          </div>
                        )}

                        {result.overtimePay > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600">• اضافه‌کاری</span>
                            <span className="font-medium text-green-600">
                              {formatNumber(result.overtimePay)} تومان
                            </span>
                          </div>
                        )}

                        {result.insurance > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-600">• بیمه ({config.insurance.employee_rate}٪)</span>
                            <span className="font-medium text-red-600">
                              {formatNumber(result.insurance)} تومان
                            </span>
                          </div>
                        )}

                        {result.tax > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-600">• مالیات</span>
                            <span className="font-medium text-red-600">
                              {formatNumber(result.tax)} تومان
                            </span>
                          </div>
                        )}
                      </div>

                      {/* این محاسبه چگونه انجام شد */}
                      <div className="pt-4 border-t">
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto transition-colors"
                        >
                          این محاسبه چگونه انجام شد؟
                          <ChevronDown className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                        </button>

                        {showExplanation && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs space-y-2 text-muted-foreground">
                            <p><strong>• حقوق ساعتی:</strong> حقوق پایه ÷ {config.overtime.base_hours.toLocaleString("fa-IR")} ساعت</p>
                            <p><strong>• اضافه‌کاری:</strong> ساعات × حقوق ساعتی × {(config.overtime.rate_multiplier * 100).toFixed(0)}٪</p>
                            <p><strong>• بیمه:</strong> {config.insurance.employee_rate}٪ از حقوق پایه (سهم کارمند)</p>
                            <p><strong>• مالیات:</strong> محاسبه پلکانی بر اساس جمع درآمد</p>
                            <div className="pt-2 border-t mt-2">
                              <p className="font-semibold mb-1">پله‌های مالیاتی:</p>
                              {config.tax_brackets.map((bracket, idx) => (
                                <p key={idx}>
                                  {bracket.label}: {(bracket.rate * 100).toFixed(0)}٪
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Smart CTA - اتصال به Career Path */}
                      <div className="pt-6 border-t">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-5 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-right flex-1">
                              <p className="text-sm font-medium mb-2">
                                می‌خواهی خودت این محاسبات را به‌صورت حرفه‌ای انجام دهی؟
                              </p>
                              <p className="text-xs text-muted-foreground">
                                مسیر «حسابداری پایه تا حرفه‌ای» را در کاربرگ شروع کن
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="default" size="sm" className="w-full">
                            <Link href="/auth">
                              مشاهده مسیر یادگیری
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

            {/* این ماشین حساب چه چیزهایی را محاسبه می‌کند */}
            <Card className="mt-12 border-2">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">این ماشین حساب چه چیزهایی را محاسبه می‌کند؟</h2>
                <p className="text-muted-foreground mb-4">
                  این ابزار شامل محاسبه موارد زیر است:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">حقوق خالص دریافتی</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">بیمه سهم کارمند ({config.insurance.employee_rate}٪)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">مالیات حقوق به‌صورت پلکانی</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">حق اولاد (تا سقف قانونی)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">اضافه‌کاری بر اساس حقوق ساعتی</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* این ابزار برای چه کسانی مناسب است */}
            <Card className="mt-6 border-2">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">این ابزار برای چه کسانی مناسب است؟</h2>
                <p className="text-muted-foreground mb-4">
                  این ابزار برای افراد زیر طراحی شده است:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">کارمندان بخش دولتی و خصوصی</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">حسابداران و کمک‌حسابداران</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">مدیران منابع انسانی</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">افرادی که قصد یادگیری حقوق و دستمزد دارند</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational SEO Block - حقوق خالص چگونه محاسبه می‌شود */}
            <Card className="mt-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 border-2">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">حقوق خالص چگونه محاسبه می‌شود؟</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    حقوق خالص از کسر مواردی مانند بیمه و مالیات از حقوق ناخالص به‌دست می‌آید.
                  </p>
                  <p>
                    در محاسبه حقوق و دستمزد، عواملی مانند حقوق پایه، وضعیت بیمه، تعداد فرزندان و میزان اضافه‌کاری نقش مهمی دارند.
                  </p>
                  <p>
                    درک این محاسبات برای حسابداران و افرادی که قصد ورود به بازار کار مالی دارند، یک مهارت پایه محسوب می‌شود.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* نکات مهم - Legal + Trust */}
            <Card className="mt-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">نکات مهم:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• محاسبات بر اساس قوانین سال {config.year.toLocaleString("fa-IR")} انجام شده است.</li>
                  <li>• نرخ بیمه سهم کارمند {config.insurance.employee_rate}٪ حقوق پایه است.</li>
                  <li>• حق اولاد حداکثر برای {config.child_allowance.max_children.toLocaleString("fa-IR")} فرزند محاسبه می‌شود.</li>
                  <li>• نرخ اضافه‌کاری {(config.overtime.rate_multiplier * 100).toFixed(0)}٪ حقوق ساعتی است.</li>
                  <li>• مالیات به‌صورت پلکانی محاسبه می‌شود.</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground font-medium">
                    این ابزار آموزشی است و جایگزین مشاوره رسمی مالی یا حقوقی نیست.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
