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

interface MonthlyPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [loanTerm, setLoanTerm] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const months = parseInt(loanTerm) || 0;

    if (principal <= 0) {
      alert("لطفاً مبلغ وام را وارد کنید");
      return;
    }

    if (months <= 0) {
      alert("لطفاً مدت بازپرداخت را وارد کنید");
      return;
    }

    // محاسبه قسط ماهانه
    const monthlyRate = annualRate / 100 / 12;
    let monthlyPayment: number;

    if (monthlyRate === 0) {
      // اگر نرخ بهره صفر باشد
      monthlyPayment = principal / months;
    } else {
      // فرمول محاسبه قسط ماهانه (Amortization)
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                       (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    // محاسبه جدول اقساط (فقط ۱۲ قسط اول برای نمایش)
    const schedule: MonthlyPayment[] = [];
    let remainingBalance = principal;

    for (let month = 1; month <= Math.min(months, 12); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    setResult({
      loanAmount: principal,
      interestRate: annualRate,
      loanTerm: months,
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-br from-green-50/50 to-teal-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزار رایگان
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ماشین حساب وام
              </h1>
              <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                محاسبه دقیق قسط ماهانه وام و جدول بازپرداخت
                <br />
                با امکان مشاهده جزئیات هر قسط
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                ماشین حساب وام کاربرگ به شما کمک می‌کند تا قسط ماهانه، کل بهره قابل پرداخت و جدول بازپرداخت وام خود را محاسبه کنید. این ابزار برای افرادی که قصد دریافت وام دارند یا می‌خواهند هزینه‌های وام را برنامه‌ریزی کنند، طراحی شده است.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    اطلاعات وام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">مبلغ وام (تومان)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="مثال: ۱۰۰,۰۰۰,۰۰۰ تومان"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">نرخ بهره سالانه (درصد)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="مثال: ۱۸"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      نرخ بهره سالانه (برای وام بدون بهره، عدد ۰ را وارد کنید)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">مدت بازپرداخت (ماه)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      placeholder="مثال: ۳۶"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      تعداد ماه‌هایی که برای بازپرداخت وام زمان دارید
                    </p>
                  </div>

                  <Button onClick={calculateLoan} className="w-full" size="lg">
                    محاسبه اقساط وام
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
                        با وارد کردن اطلاعات وام،
                      </p>
                      <p className="text-sm">
                        قسط ماهانه و جدول بازپرداخت محاسبه می‌شود.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* قسط ماهانه - Hero Number */}
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border-2 border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">قسط ماهانه</p>
                        <p className="text-4xl font-bold text-primary">
                          {formatNumber(result.monthlyPayment)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">تومان</p>
                      </div>

                      {/* خلاصه محاسبات */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">کل پرداختی</p>
                          <p className="text-lg font-bold">{formatNumber(result.totalPayment)}</p>
                          <p className="text-xs text-muted-foreground">تومان</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">کل بهره</p>
                          <p className="text-lg font-bold">{formatNumber(result.totalInterest)}</p>
                          <p className="text-xs text-muted-foreground">تومان</p>
                        </div>
                      </div>

                      {/* جزئیات وام */}
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-sm mb-3">جزئیات وام</h3>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">• مبلغ وام</span>
                          <span className="font-medium">{formatNumber(result.loanAmount)} تومان</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">• نرخ بهره سالانه</span>
                          <span className="font-medium">{result.interestRate}٪</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">• مدت بازپرداخت</span>
                          <span className="font-medium">{result.loanTerm} ماه</span>
                        </div>
                      </div>

                      {/* جدول اقساط */}
                      <div className="pt-4 border-t">
                        <button
                          onClick={() => setShowSchedule(!showSchedule)}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto transition-colors"
                        >
                          مشاهده جدول اقساط ({result.schedule.length} قسط اول)
                          <ChevronDown className={`w-4 h-4 transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
                        </button>

                        {showSchedule && (
                          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                            {result.schedule.map((payment: MonthlyPayment) => (
                              <div key={payment.month} className="p-3 bg-muted/50 rounded-lg text-xs">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold">قسط {payment.month}</span>
                                  <span className="font-bold">{formatNumber(payment.payment)} تومان</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                  <div>اصل: {formatNumber(payment.principal)}</div>
                                  <div>بهره: {formatNumber(payment.interest)}</div>
                                </div>
                                <div className="mt-1 text-muted-foreground">
                                  باقیمانده: {formatNumber(payment.remainingBalance)} تومان
                                </div>
                              </div>
                            ))}
                            {result.loanTerm > 12 && (
                              <p className="text-xs text-center text-muted-foreground mt-2">
                                و {result.loanTerm - 12} قسط دیگر...
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* توضیح محاسبه */}
                      <div className="pt-4 border-t">
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto transition-colors"
                        >
                          قسط ماهانه چگونه محاسبه می‌شود؟
                          <ChevronDown className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                        </button>

                        {showExplanation && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-xs space-y-2 text-muted-foreground">
                            <p><strong>روش محاسبه:</strong> از فرمول استاندارد Amortization استفاده می‌شود.</p>
                            <p><strong>قسط ماهانه:</strong> شامل بخشی از اصل وام + بهره ماهانه</p>
                            <p><strong>نکته:</strong> در قسط‌های اولیه، سهم بهره بیشتر و در قسط‌های انتهایی، سهم اصل وام بیشتر است.</p>
                          </div>
                        )}
                      </div>

                      {/* Smart CTA - اتصال به Career Path */}
                      <div className="pt-6 border-t">
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 rounded-lg p-5 border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-right flex-1">
                              <p className="text-sm font-medium mb-2">
                                می‌خواهی تحلیل مالی و محاسبات وام را حرفه‌ای یاد بگیری؟
                              </p>
                              <p className="text-xs text-muted-foreground">
                                مسیر «مالی شرکتی پایه تا حرفه‌ای» را در کاربرگ شروع کن
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
                    <span className="text-sm">قسط ماهانه وام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">کل مبلغ قابل پرداخت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">کل بهره قابل پرداخت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">جدول اقساط ماهانه</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">تفکیک اصل و بهره در هر قسط</span>
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
                    <span className="text-sm">افرادی که قصد دریافت وام دارند</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">کارشناسان مالی و بانکی</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">مشاوران مالی</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">افرادی که می‌خواهند هزینه‌های وام را برنامه‌ریزی کنند</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational SEO Block */}
            <Card className="mt-6 bg-gradient-to-br from-green-50/50 to-teal-50/50 dark:from-green-950/10 dark:to-teal-950/10 border-2">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">قسط ماهانه وام چگونه محاسبه می‌شود؟</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    محاسبه قسط ماهانه وام بر اساس فرمول استاندارد Amortization انجام می‌شود که در آن هر قسط ماهانه شامل بخشی از اصل وام و بخشی بهره است.
                  </p>
                  <p>
                    در این روش، در قسط‌های اولیه، سهم بهره بیشتر و در قسط‌های انتهایی، سهم اصل وام بیشتر است. این باعث می‌شود که مانده بدهی شما به‌صورت پیوسته کاهش یابد.
                  </p>
                  <p>
                    درک نحوه محاسبه وام برای برنامه‌ریزی مالی شخصی و تصمیم‌گیری درباره دریافت وام بسیار مهم است.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* نکات مهم - Legal + Trust */}
            <Card className="mt-6 border-green-200 bg-green-50/50 dark:bg-green-950/10">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">نکات مهم:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• محاسبات بر اساس فرمول استاندارد Amortization انجام شده است.</li>
                  <li>• نرخ بهره به‌صورت ماهانه محاسبه و به اقساط اعمال می‌شود.</li>
                  <li>• این ابزار برای وام‌های مسکن، خودرو و سایر وام‌های مصرفی قابل استفاده است.</li>
                  <li>• هزینه‌های جانبی (کارمزد، بیمه و...) در این محاسبه لحاظ نشده است.</li>
                  <li>• برای وام‌های واقعی، حتماً با بانک یا موسسه مالی مشورت کنید.</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground font-medium">
                    این ابزار آموزشی است و جایگزین مشاوره رسمی مالی یا بانکی نیست.
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
