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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">آزمون شخصیت‌شناسی</h1>
        <p className="text-muted-foreground">
          سبک کاری شما چیست؟
        </p>
      </div>

      {!hasStarted ? (
        <Card>
          <CardHeader>
            <CardTitle>درباره این آزمون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              این آزمون کوتاه کمک می‌کند کارفرما بهتر با شیوه کاری شما آشنا شود.
            </p>

            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-5 h-5 text-primary"
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
                <span>مدت زمان: ۲ دقیقه</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-5 h-5 text-primary"
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
                <span>تعداد سوالات: 10 سوال</span>
              </div>
            </div>

            <Button
              onClick={() => setHasStarted(true)}
              className="w-full"
              disabled
            >
              شروع آزمون
            </Button>

            {/* TODO Notice */}
            <Card className="bg-secondary/50 border-0">
              <CardContent className="p-4">
                <p className="text-xs text-center">
                  <strong>توجه:</strong> این صفحه placeholder است. آزمون واقعی در
                  مراحل بعدی پیاده‌سازی می‌شود.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سوال 1 از 10</CardTitle>
              <span className="text-sm text-muted-foreground">10%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary" style={{ width: "10%" }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{mockQuestions[0]}</p>

            {/* Scale 1-5 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>کاملاً مخالفم</span>
                <span>کاملاً موافقم</span>
              </div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    disabled
                    className="w-12 h-12 rounded-full border-2 hover:border-primary transition-colors disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" disabled>
                قبلی
              </Button>
              <Button className="flex-1" disabled>
                بعدی
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
