"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PersonalityTestPage() {
  const [hasStarted, setHasStarted] = useState(false);

  // TODO: پیاده‌سازی آزمون واقعی
  const mockQuestions = [
    "من فردی برون‌گرا و اجتماعی هستم",
    "من دوست دارم کارهایم را با برنامه‌ریزی دقیق انجام دهم",
    "من به آزمایش ایده‌های جدید علاقه‌مند هستم",
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">آزمون شخصیت‌شناسی</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          سبک کاری خود را بشناسید و به کارفرمایان نشان دهید
        </p>
      </div>

      {!hasStarted ? (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl">درباره این آزمون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-3">
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                این آزمون کوتاه به کارفرما کمک می‌کند بهتر با شیوه کاری، تصمیم‌گیری و ارتباط شما آشنا شود.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                پاسخ‌های شما خصوصی هستند و فقط زمانی در پروفایل عمومی نمایش داده می‌شوند که شما تایید کنید.
              </p>
            </div>

            <div className="bg-secondary/50 p-4 md:p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-3 text-xs md:text-sm">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>مدت زمان: حدود ۲ دقیقه</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>تعداد سوالات: ۱۰ سوال</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>نتیجه بلافاصله نمایش داده می‌شود</span>
              </div>
            </div>

            <Button
              onClick={() => setHasStarted(true)}
              className="w-full text-xs md:text-sm"
              disabled
            >
              شروع آزمون (به زودی فعال می‌شود)
            </Button>

            {/* Trust Message */}
            <Card className="bg-primary/5 border-primary/20 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-center font-medium leading-relaxed">
                  نتایج آزمون صرفاً برای کمک به شناخت بهتر شماست و هیچ پاسخ درست یا غلطی وجود ندارد.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">سوال ۱ از ۱۰</CardTitle>
              <span className="text-xs md:text-sm text-muted-foreground">۱۰٪</span>
            </div>
            <div className="h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden mt-2 md:mt-3">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: "10%" }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8">
            <p className="text-sm md:text-lg leading-relaxed">{mockQuestions[0]}</p>

            {/* Scale 1-5 */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-3">
                <span>کاملاً مخالفم</span>
                <span>کاملاً موافقم</span>
              </div>
              <div className="flex gap-2 md:gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    disabled
                    className="w-10 h-10 md:w-14 md:h-14 text-sm md:text-base rounded-full border-2 hover:border-primary transition-colors disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 md:gap-3 pt-2">
              <Button variant="outline" disabled className="text-xs md:text-sm">
                قبلی
              </Button>
              <Button className="flex-1 text-xs md:text-sm" disabled>
                بعدی
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
