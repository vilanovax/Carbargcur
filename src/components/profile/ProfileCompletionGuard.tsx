import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { type ProfileCompletionResult } from "@/lib/profileCompletion";

interface ProfileCompletionGuardProps {
  completion: ProfileCompletionResult;
  variant?: "resume" | "minimal";
}

export default function ProfileCompletionGuard({
  completion,
  variant = "resume",
}: ProfileCompletionGuardProps) {
  if (completion.isComplete) {
    return null; // Don't show guard if profile is complete
  }

  if (variant === "minimal") {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="text-xs md:text-sm font-medium text-destructive">
              پروفایل شما هنوز کامل نشده است.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              برای ساخت و دانلود رزومه PDF، تکمیل اطلاعات ضروری الزامی است.
            </p>
            {completion.missingRequired.length > 0 && (
              <Button asChild size="sm" className="text-xs">
                <Link href={completion.missingRequired[0].actionHref}>
                  تکمیل پروفایل
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg md:text-xl">
              رزومه هنوز آماده نیست
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground">
              تکمیل {completion.percentage}٪
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          برای دانلود رزومه PDF، ابتدا باید پروفایل خود را کامل کنید. تکمیل
          اطلاعات زیر الزامی است:
        </p>

        {/* Missing Required Steps */}
        {completion.missingRequired.length > 0 && (
          <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
            <p className="text-xs md:text-sm font-semibold">
              موارد ضروری باقی‌مانده:
            </p>
            <div className="space-y-2">
              {completion.missingRequired.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start justify-between gap-3 p-2 md:p-3 bg-background rounded-lg"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <XCircle className="w-4 h-4 md:w-5 md:h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm">{step.title}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-xs flex-shrink-0">
                    <Link href={step.actionHref}>تکمیل</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Required Steps */}
        {completion.requiredSteps.some((s) => s.completed) && (
          <div className="space-y-3">
            <p className="text-xs md:text-sm font-semibold text-muted-foreground">
              موارد تکمیل شده:
            </p>
            <div className="space-y-2">
              {completion.requiredSteps
                .filter((s) => s.completed)
                .map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                    <span className="line-through">{step.title}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4 border-t">
          <Button asChild className="flex-1 text-xs md:text-sm">
            <Link
              href={
                completion.missingRequired[0]?.actionHref ||
                "/app/profile/onboarding"
              }
            >
              تکمیل پروفایل
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 text-xs md:text-sm"
          >
            <Link href="/app">بازگشت به داشبورد</Link>
          </Button>
        </div>

        {/* Helper Message */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-xs text-center leading-relaxed">
              تکمیل پروفایل فقط چند دقیقه زمان می‌برد و کیفیت رزومه شما را بهبود
              می‌بخشد.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
