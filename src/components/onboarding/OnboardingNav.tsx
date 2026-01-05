"use client";

import { Button } from "@/components/ui/button";

type OnboardingNavProps = {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
};

export default function OnboardingNav({
  onBack,
  onNext,
  backLabel = "مرحله قبل",
  nextLabel = "ادامه",
  nextDisabled = false,
  showBack = true,
}: OnboardingNavProps) {
  return (
    <div className="flex gap-3 mt-6">
      {showBack && onBack && (
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          {backLabel}
        </Button>
      )}
      {onNext && (
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={showBack ? "flex-1" : "w-full"}
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
