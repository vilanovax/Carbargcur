import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // TODO: دریافت اطلاعات کاربر از API
  const mockUser = {
    name: "علی محمدی",
    profileCompletion: 60,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">خوش آمدید، {mockUser.name}</h1>
        <p className="text-muted-foreground">داشبورد شخصی شما</p>
      </div>

      {/* Profile Completion Card */}
      <Card>
        <CardHeader>
          <CardTitle>تکمیل پروفایل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>پروفایل شما {mockUser.profileCompletion}% تکمیل شده</span>
                <span className="text-sm text-muted-foreground">
                  {mockUser.profileCompletion}/100
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${mockUser.profileCompletion}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              پروفایل کامل‌تر شانس دیده‌شدن شما را افزایش می‌دهد
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/app/profile/onboarding">شروع آنبوردینگ</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/app/profile/edit">ویرایش پروفایل</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
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
            <h3 className="font-semibold mb-2">آزمون شخصیت‌شناسی</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {/* TODO: چک کردن اینکه آزمون داده شده یا نه */}
              شخصیت خود را بشناسید و به کارفرمایان نشان دهید
            </p>
            <Button asChild variant="outline">
              <Link href="/app/personality">شروع آزمون</Link>
            </Button>
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
            <h3 className="font-semibold mb-2">پیش‌نمایش رزومه</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {/* TODO: نمایش تاریخ آخرین به‌روزرسانی */}
              مشاهده و دانلود رزومه حرفه‌ای خود
            </p>
            <Button asChild variant="outline">
              <Link href="/app/resume">مشاهده رزومه</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* TODO Notice */}
      <Card className="bg-secondary/50">
        <CardContent className="p-6">
          <p className="text-sm text-center">
            <strong>توجه:</strong> این صفحه placeholder است. داده‌های واقعی در
            مراحل بعدی پیاده‌سازی خواهند شد.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
