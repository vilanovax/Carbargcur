import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export default function ResumePage() {
  // TODO: چک کردن اینکه پروفایل کامل است یا نه
  const hasCompleteProfile = false;

  // TODO: دریافت از backend
  const requirements = [
    { completed: true, label: "نام و عنوان شغلی", link: "/app/profile/onboarding/step-1-basics" },
    { completed: false, label: "حداقل ۳ مهارت", link: "/app/profile/onboarding/step-3-skills" },
    { completed: false, label: "حداقل یک سابقه کاری", link: "/app/profile/onboarding/step-4-experience" },
    { completed: false, label: "تحصیلات", link: "/app/profile/onboarding/step-5-education" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">رزومه حرفه‌ای</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            رزومه شما به صورت خودکار از پروفایل ساخته می‌شود
          </p>
        </div>
        <Button disabled={!hasCompleteProfile} className="text-xs md:text-sm whitespace-nowrap">
          دانلود فایل PDF
        </Button>
      </div>

      {hasCompleteProfile ? (
        <Card className="shadow-sm">
          <CardContent className="p-6 md:p-8">
            {/* TODO: نمایش پیش‌نمایش رزومه */}
            <div className="border-2 border-dashed rounded-lg p-8 md:p-12 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">
                پیش‌نمایش رزومه اینجا نمایش داده می‌شود
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="p-6 md:p-8 text-center space-y-3">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-semibold">رزومه شما آماده نیست</h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                برای دریافت فایل PDF رزومه، ابتدا باید پروفایل خود را کامل کنید. رزومه به صورت خودکار ساخته می‌شود.
              </p>
            </div>

            <div className="p-4 md:p-6 border-t bg-secondary/30">
              <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-4">موارد مورد نیاز برای رزومه:</h3>
              <div className="space-y-2 md:space-y-3">
                {requirements.map((req, index) => (
                  <Link
                    key={index}
                    href={req.link}
                    className="flex items-center gap-2 md:gap-3 text-xs md:text-sm p-2 md:p-3 rounded-lg hover:bg-background/50 transition-colors"
                  >
                    {req.completed ? (
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={req.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                      {req.label}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 md:mt-6 pt-4 border-t">
                <Button asChild className="w-full text-xs md:text-sm">
                  <Link href="/app/profile/onboarding">تکمیل پروفایل</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center font-medium leading-relaxed">
            رزومه شما تنها زمانی برای کارفرمایان قابل مشاهده است که خودتان آن را ارسال کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
