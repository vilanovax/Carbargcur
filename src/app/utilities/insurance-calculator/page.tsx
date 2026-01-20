"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { Calculator, Info, CheckCircle, ArrowLeft, BookOpen, PieChart } from "lucide-react";
import Link from "next/link";

export default function InsuranceCalculatorPage() {
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calculateInsurance = () => {
    const base = parseFloat(baseSalary) || 0;

    if (base <= 0) {
      alert("لطفاً حقوق پایه را وارد کنید");
      return;
    }

    // نرخ‌های بیمه طبق قانون
    const employeeRate = 7; // سهم کارمند: 7%
    const employerRate = 20; // سهم کارفرما: 20%
    const totalRate = 27; // جمع کل: 27%

    const employeeShare = (base * employeeRate) / 100;
    const employerShare = (base * employerRate) / 100;
    const totalInsurance = employeeShare + employerShare;

    const employeePercentage = (employeeShare / totalInsurance) * 100;
    const employerPercentage = (employerShare / totalInsurance) * 100;

    setResult({
      baseSalary: base,
      employeeShare,
      employerShare,
      totalInsurance,
      employeeRate,
      employerRate,
      totalRate,
      employeePercentage,
      employerPercentage,
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(Math.round(num));
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزار رایگان
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                محاسبه حق بیمه تأمین اجتماعی
              </h1>
              <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                محاسبه سهم کارمند و کارفرما از حق بیمه
                <br />
                بر اساس قوانین سازمان تأمین اجتماعی
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                این ابزار به شما کمک می‌کند تا حق بیمه تأمین اجتماعی را بر اساس
                حقوق پایه محاسبه کنید و سهم کارمند و کارفرما را جداگانه ببینید.
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
                    <Label htmlFor="baseSalary">حقوق پایه مشمول بیمه (تومان)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      placeholder="مثال: ۱۵,۰۰۰,۰۰۰ تومان"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      حقوق پایه بدون مزایا و کمک‌هزینه‌ها
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">نرخ‌های بیمه:</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• سهم کارمند: ۷٪</li>
                      <li>• سهم کارفرما: ۲۰٪</li>
                      <li>• جمع کل: ۲۷٪</li>
                    </ul>
                  </div>

                  <Button onClick={calculateInsurance} className="w-full" size="lg">
                    محاسبه حق بیمه
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
                        حق بیمه شما محاسبه می‌شود.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Total Insurance */}
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border-2 border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">
                          جمع کل حق بیمه
                        </p>
                        <p className="text-4xl font-bold text-primary">
                          {formatNumber(result.totalInsurance)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">تومان</p>
                      </div>

                      {/* Shares Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                          <p className="text-xs text-muted-foreground mb-1">
                            سهم کارمند
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatNumber(result.employeeShare)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ({result.employeeRate}٪)
                          </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="text-xs text-muted-foreground mb-1">
                            سهم کارفرما
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatNumber(result.employerShare)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ({result.employerRate}٪)
                          </p>
                        </div>
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
                          <span className="text-sm text-red-600">
                            • کسر از حقوق (۷٪)
                          </span>
                          <span className="font-medium text-red-600">
                            {formatNumber(result.employeeShare)} تومان
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">
                            • پرداختی کارفرما (۲۰٪)
                          </span>
                          <span className="font-medium text-green-600">
                            {formatNumber(result.employerShare)} تومان
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t font-bold">
                          <span>خالص دریافتی کارمند:</span>
                          <span className="text-primary">
                            {formatNumber(result.baseSalary - result.employeeShare)}{" "}
                            تومان
                          </span>
                        </div>
                      </div>

                      {/* Visual Distribution */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <PieChart className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">توزیع حق بیمه:</h4>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>سهم کارمند</span>
                              <span>{result.employeePercentage.toFixed(1)}٪</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${result.employeePercentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>سهم کارفرما</span>
                              <span>{result.employerPercentage.toFixed(1)}٪</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${result.employerPercentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Formula */}
                      <div className="pt-4 border-t">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs space-y-2 text-muted-foreground">
                          <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            فرمول محاسبه:
                          </p>
                          <p>
                            <strong>سهم کارمند =</strong> حقوق پایه × ۷٪
                          </p>
                          <p>
                            <strong>سهم کارفرما =</strong> حقوق پایه × ۲۰٪
                          </p>
                          <p>
                            <strong>جمع کل =</strong> حقوق پایه × ۲۷٪
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
                                می‌خواهید قوانین بیمه را یاد بگیرید؟
                              </p>
                              <p className="text-xs text-muted-foreground">
                                در مسیر حسابداری، فصل بیمه و قوانین کار را مطالعه کنید
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="default" size="sm" className="w-full">
                            <Link href="/learning/accounting">
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

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">سهم کارمند (۷٪)</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    این مبلغ از حقوق کارمند کسر می‌شود
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>کسر از فیش حقوقی</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>بیمه درمانی</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>بیمه بازنشستگی</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">سهم کارفرما (۲۰٪)</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    این مبلغ توسط کارفرما پرداخت می‌شود
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>هزینه اضافی کارفرما</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>بیمه بیکاری</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>بیمه حوادث کار</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">نکات مهم</h2>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>• نرخ‌ها طبق قانون تأمین اجتماعی</li>
                    <li>• مشمول تمام کارکنان قراردادی</li>
                    <li>• سقف و کف حقوق مشمول بیمه وجود دارد</li>
                    <li>• پرداخت ماهانه الزامی است</li>
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
