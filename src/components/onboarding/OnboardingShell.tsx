"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OnboardingProgress from "./OnboardingProgress";
import OnboardingHeader from "./OnboardingHeader";

type OnboardingShellProps = {
  currentStep: number; // 1-5
  title: string;
  description?: string;
  children: React.ReactNode;
  showGlobalHeader?: boolean; // Show the global onboarding header (default: true for step 1)
};

export default function OnboardingShell({
  currentStep,
  title,
  description,
  children,
  showGlobalHeader = currentStep === 1,
}: OnboardingShellProps) {
  return (
    <>
      {/* Global Header - only on first step or when explicitly enabled */}
      {showGlobalHeader && <OnboardingHeader />}

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
    </>
  );
}
