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
import { TaxCalculatorConfig } from "@/lib/calculator-config";

interface Props {
  config: TaxCalculatorConfig;
}

export default function TaxCalculatorClient({ config }: Props) {
  const [income, setIncome] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const calculateTax = () => {
    const totalIncome = parseFloat(income) || 0;

    if (totalIncome <= 0) {
      alert("لطفاً مبلغ درآمد را وارد کنید");
      return;
    }

    let tax = 0;
    const brackets: Array<{ bracket: string; amount: number; tax: number }> = [];
    let remainingIncome = totalIncome;

    // محاسبه پلکانی مالیات با استفاده از config
    for (const bracket of config.tax_brackets) {
      if (remainingIncome <= 0) break;

      const bracketFrom = bracket.from;
      const bracketTo = bracket.to || Infinity;

      if (totalIncome > bracketFrom) {
        const taxableInThisBracket = Math.min(
          remainingIncome,
          bracketTo - bracketFrom
        );
        const taxForThisBracket = taxableInThisBracket * bracket.rate;
        tax += taxForThisBracket;
        remainingIncome -= taxableInThisBracket;

        brackets.push({
          bracket: bracket.label,
          amount: taxableInThisBracket,
          tax: taxForThisBracket,
        });
      }
    }

    const netIncome = totalIncome - tax;
    const effectiveRate = totalIncome > 0 ? (tax / totalIncome) * 100 : 0;

    setResult({
      totalIncome,
      tax,
      netIncome,
      effectiveRate,
      brackets: brackets.reverse(), // نمایش از پایین به بالا
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزار رایگان
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ماشین حساب مالیات حقوق
              </h1>
              <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                محاسبه دقیق مالیات حقوق به‌صورت پلکانی
                <br />
                بر اساس قوانین مالیاتی سال ۱۴۰۳
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                ماشین حساب مالیات حقوق کاربرگ به شما کمک می‌کند تا مالیات قابل پرداخت خود را بر اساس سیستم مالیات پلکانی محاسبه کنید. این ابزار برای کارکنان، حسابداران و هر کسی که می‌خواهد مالیات حقوق خود را بفهمد، طراحی شده است.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    اطلاعات ورودی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="income">درآمد سالانه مشمول مالیات (تومان)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="مثال: ۲۵,۰۰۰,۰۰۰ تومان"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      مجموع درآمد سالانه (حقوق پایه + مزایا + حق اولاد + اضافه‌کاری)
                    </p>
                  </div>

                  {/* نرخ‌های مالیاتی */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-3">نرخ‌های مالیاتی ۱۴۰۳:</h4>
                    <div className="space-y-2 text-xs">
                      {TAX_BRACKETS_1403.map((bracket, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{bracket.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={calculateTax} className="w-full" size="lg">
                    محاسبه مالیات
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
                        با وارد کردن درآمد سالانه،
                      </p>
                      <p className="text-sm">
                        مالیات پلکانی و درآمد خالص شما محاسبه می‌شود.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* مالیات قابل پرداخت - Hero Number */}
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border-2 border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">مالیات قابل پرداخت</p>
                        <p className="text-4xl font-bold text-primary">
                          {formatNumber(result.tax)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">تومان</p>
                      </div>

                      {/* خلاصه محاسبات */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">درآمد خالص</p>
                          <p className="text-lg font-bold">{formatNumber(result.netIncome)}</p>
                          <p className="text-xs text-muted-foreground">تومان</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">نرخ مؤثر</p>
                          <p className="text-lg font-bold">{result.effectiveRate.toFixed(2)}٪</p>
                          <p className="text-xs text-muted-foreground">از درآمد کل</p>
                        </div>
                      </div>

                      {/* جزئیات محاسبه پلکانی */}
                      <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-bold text-sm mb-3">جزئیات محاسبه پلکانی</h3>

                        {result.brackets.map((item: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">{item.bracket}</span>
                              <span className="text-sm font-medium">
                                {formatNumber(item.amount)} تومان
                              </span>
                            </div>
                            {item.tax > 0 && (
                              <div className="flex justify-between items-center pr-4">
                                <span className="text-xs text-red-600">مالیات این پله:</span>
                                <span className="text-xs font-medium text-red-600">
                                  {formatNumber(item.tax)} تومان
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* این محاسبه چگونه انجام شد */}
                      <div className="pt-4 border-t">
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto transition-colors"
                        >
                          مالیات پلکانی چیست؟
                          <ChevronDown className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                        </button>

                        {showExplanation && (
                          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-xs space-y-2 text-muted-foreground">
                            <p><strong>مالیات پلکانی:</strong> در این سیستم، درآمد شما به چند پله تقسیم می‌شود و هر پله با نرخ متفاوتی مالیات می‌دهد.</p>
                            <p><strong>مثال:</strong> اگر درآمد شما ۲۵ میلیون تومان باشد:</p>
                            <p className="pr-4">• ۱۰ میلیون اول → معاف از مالیات</p>
                            <p className="pr-4">• ۱۰ میلیون دوم → ۱۰٪ مالیات</p>
                            <p className="pr-4">• ۵ میلیون باقیمانده → ۱۵٪ مالیات</p>
                          </div>
                        )}
                      </div>

                      {/* Smart CTA - اتصال به Career Path */}
                      <div className="pt-6 border-t">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-5 border border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-right flex-1">
                              <p className="text-sm font-medium mb-2">
                                می‌خواهی قوانین مالیات را به‌صورت حرفه‌ای یاد بگیری؟
                              </p>
                              <p className="text-xs text-muted-foreground">
                                مسیر «مالیات پایه تا حرفه‌ای» را در کاربرگ شروع کن
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
                    <span className="text-sm">مالیات قابل پرداخت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">درآمد خالص پس از کسر مالیات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">نرخ مؤثر مالیات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">جزئیات محاسبه پلکانی</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">مالیات هر پله به‌صورت جداگانه</span>
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
                    <span className="text-sm">حسابداران و کارشناسان مالیاتی</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">صاحبان مشاغل آزاد</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">افرادی که قصد یادگیری قوانین مالیاتی دارند</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational SEO Block - مالیات پلکانی چگونه محاسبه می‌شود */}
            <Card className="mt-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 border-2">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">مالیات پلکانی چگونه محاسبه می‌شود؟</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    مالیات پلکانی یک سیستم مالیاتی عادلانه است که در آن درآمد به چند بخش (پله) تقسیم می‌شود و هر بخش با نرخ متفاوتی مشمول مالیات می‌شود.
                  </p>
                  <p>
                    در سیستم مالیات پلکانی ایران، افرادی که درآمد کمتری دارند، مالیات کمتری می‌پردازند. مثلاً تا سقف ۱۰ میلیون تومان درآمد سالانه، کاملاً از مالیات معاف هستید.
                  </p>
                  <p>
                    درک صحیح سیستم مالیات پلکانی برای حسابداران، کارشناسان مالیاتی و هر فردی که درآمد دارد، ضروری است. این دانش به شما کمک می‌کند تا بهتر برنامه‌ریزی مالی کنید.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* نکات مهم - Legal + Trust */}
            <Card className="mt-6 border-purple-200 bg-purple-50/50 dark:bg-purple-950/10">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">نکات مهم:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• محاسبات بر اساس قوانین مالیاتی سال ۱۴۰۳ انجام شده است.</li>
                  <li>• نرخ‌های مالیاتی به‌صورت پلکانی اعمال می‌شوند.</li>
                  <li>• درآمد تا سقف ۱۰ میلیون تومان معاف از مالیات است.</li>
                  <li>• معافیت‌های خاص (نظیر معافیت سربازی) در این محاسبه لحاظ نشده است.</li>
                  <li>• محاسبه بر اساس درآمد سالانه مشمول مالیات است.</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-muted-foreground font-medium">
                    این ابزار آموزشی است و جایگزین مشاوره رسمی مالیاتی یا حقوقی نیست.
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
