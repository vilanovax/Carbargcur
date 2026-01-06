/**
 * Global header for the entire onboarding process
 * Shows above all steps with reassurance and context
 */

import { Shield } from "lucide-react";

export default function OnboardingHeader() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white border-b">
      <div className="container max-w-3xl mx-auto px-4 py-8 text-center">
        {/* Main Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          پروفایل حرفه‌ای شما، فقط در چند دقیقه
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-700 mb-3">
          این اطلاعات به ما کمک می‌کند شما را دقیق‌تر به فرصت‌های مناسب معرفی کنیم.
        </p>

        {/* Privacy Reassurance */}
        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200">
          <Shield className="h-4 w-4 text-green-600" />
          <span>اطلاعات شما فقط با اجازه شما نمایش داده می‌شود.</span>
        </div>
      </div>
    </div>
  );
}
