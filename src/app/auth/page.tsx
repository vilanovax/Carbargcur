"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicHeader from "@/components/layout/PublicHeader";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  // TODO: پیاده‌سازی منطق احراز هویت واقعی
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - TODO: implement auth");
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLogin ? "ورود به کاربرگ" : "ثبت‌نام در کاربرگ"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "به حساب کاربری خود وارد شوید"
                  : "ساخت حساب کاربری جدید"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* شماره موبایل */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">شماره موبایل</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="09123456789"
                    dir="ltr"
                    disabled
                    // TODO: اضافه کردن اعتبارسنجی فرمت ایرانی
                  />
                  <p className="text-xs text-muted-foreground">
                    فرمت: 09xxxxxxxxx
                  </p>
                </div>

                {/* رمز عبور */}
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="حداقل 8 کاراکتر"
                    disabled
                    // TODO: اضافه کردن اعتبارسنجی قدرت رمز
                  />
                </div>

                {/* نام کامل (فقط برای ثبت‌نام) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="علی محمدی"
                      disabled
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled>
                  {isLogin ? "ورود" : "ثبت‌نام"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-primary hover:underline"
                  >
                    {isLogin
                      ? "حساب کاربری ندارید؟ ثبت‌نام کنید"
                      : "قبلاً ثبت‌نام کرده‌اید؟ وارد شوید"}
                  </button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    اطلاعات شما به صورت امن ذخیره می‌شود.
                  </p>
                </div>
              </form>

              {/* TODO Notice */}
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="text-sm text-center">
                  <strong>توجه:</strong> این صفحه placeholder است.
                  <br />
                  احراز هویت در مراحل بعدی پیاده‌سازی خواهد شد.
                </p>
                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/app">مشاهده داشبورد (پیش‌نمایش)</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
