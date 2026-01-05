"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadFromStorage, getFirstIncompleteStep } from "@/lib/onboarding";

/**
 * Entry point for onboarding
 * Redirects to the first incomplete step
 */
export default function OnboardingEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const profile = loadFromStorage();
    const targetPath = getFirstIncompleteStep(profile);
    router.replace(targetPath);
  }, [router]);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 text-center">
      <p className="text-muted-foreground">در حال هدایت به مرحله بعد...</p>
    </div>
  );
}
