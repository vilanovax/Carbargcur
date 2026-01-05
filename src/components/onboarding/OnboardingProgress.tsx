"use client";

type Step = {
  id: number;
  label: string;
  path: string;
};

const STEPS: Step[] = [
  { id: 1, label: "اطلاعات پایه", path: "/app/profile/onboarding/step-1-basic" },
  { id: 2, label: "وضعیت شغلی", path: "/app/profile/onboarding/step-2-status" },
  { id: 3, label: "مهارت‌ها", path: "/app/profile/onboarding/step-3-skills" },
  { id: 4, label: "خلاصه", path: "/app/profile/onboarding/step-4-summary" },
  { id: 5, label: "بازبینی", path: "/app/profile/onboarding/review" },
];

type OnboardingProgressProps = {
  currentStep: number; // 1-5
};

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step labels - visible on desktop */}
      <div className="hidden md:flex justify-between">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center gap-1 ${
              step.id === currentStep
                ? "text-primary font-semibold"
                : step.id < currentStep
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step.id === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step.id < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step.id < currentStep ? "✓" : step.id}
            </div>
            <span className="text-xs text-center">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Mobile: just show "Step X of 5" */}
      <div className="md:hidden text-center text-sm text-muted-foreground">
        مرحله {currentStep} از {STEPS.length}
      </div>
    </div>
  );
}
