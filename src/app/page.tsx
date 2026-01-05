import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicHeader from "@/components/layout/PublicHeader";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <section className="text-center mb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              رزومه‌ی حرفه‌ای شما، دقیقاً برای بازار کار مالی
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              کاربرگ جایی‌ست برای دیده‌شدن تخصص شما در حسابداری، بورس، بیمه و صنایع مالی — بدون شلوغی شبکه‌های اجتماعی.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link href="/auth">ساخت پروفایل حرفه‌ای</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">بیشتر بدانید</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              بدون نیاز به پرداخت • بدون نمایش عمومی اجباری • کنترل کامل روی دیده‌شدن
            </p>
          </section>

          {/* Features - Placeholder */}
          <section id="features" className="grid md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">پروفایل حرفه‌ای</h3>
                <p className="text-muted-foreground">
                  ساخت پروفایل کامل با تمرکز بر حوزه‌های مالی، حسابداری، بورس و بیمه
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">رزومه قابل اشتراک</h3>
                <p className="text-muted-foreground">
                  ایجاد لینک اختصاصی برای اشتراک‌گذاری پروفایل و دانلود رزومه PDF
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">آزمون شخصیت‌شناسی</h3>
                <p className="text-muted-foreground">
                  شناخت بهتر خود و نمایش ویژگی‌های شخصیتی به کارفرمایان
                </p>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 bg-secondary rounded-lg">
            <h2 className="text-3xl font-bold mb-4">آماده برای شروع هستید؟</h2>
            <p className="text-muted-foreground mb-6">
              ساخت پروفایل رایگان است و کمتر از 5 دقیقه زمان می‌برد
            </p>
            <Button asChild size="lg">
              <Link href="/auth">همین حالا شروع کنید</Link>
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}
