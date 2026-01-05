"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OnboardingProgress from "./OnboardingProgress";

type OnboardingShellProps = {
  currentStep: number; // 1-5
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function OnboardingShell({
  currentStep,
  title,
  description,
  children,
}: OnboardingShellProps) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <OnboardingProgress currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {/* Privacy notice */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        اطلاعات شما بدون اجازه در اختیار هیچ سازمانی قرار نمی‌گیرد.
      </p>
    </div>
  );
}
