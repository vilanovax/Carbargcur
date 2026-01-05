import type { Assessment } from "@/components/assessments/AssessmentCard";

/**
 * Static assessments data
 * TODO: Move to database when backend is ready
 * TODO: Add real test logic and scoring algorithms
 * TODO: Track user progress and results
 */
export const ASSESSMENTS: Assessment[] = [
  {
    id: "professional-personality",
    category: "شخصیت حرفه‌ای",
    title: "آزمون شخصیت حرفه‌ای",
    description: "سبک کاری و تصمیم‌گیری شما را مشخص می‌کند.",
    duration: "حدود ۲ دقیقه",
    questions: 10,
    status: "active",
    showInProfile: true,
  },
  {
    id: "soft-skills",
    category: "مهارت‌های نرم",
    title: "ارزیابی مهارت‌های نرم",
    description: "حل مسئله، ارتباط مؤثر و مدیریت زمان.",
    status: "coming-soon",
  },
  {
    id: "technical-skills",
    category: "مهارت‌های تخصصی",
    title: "آزمون مهارت‌های تخصصی",
    description: "دانش فنی در حوزه‌های مالی و حسابداری.",
    status: "coming-soon",
  },
];

/**
 * Get assessment by ID
 */
export function getAssessmentById(id: string): Assessment | undefined {
  return ASSESSMENTS.find((a) => a.id === id);
}

/**
 * Get active assessments
 */
export function getActiveAssessments(): Assessment[] {
  return ASSESSMENTS.filter((a) => a.status === "active");
}

/**
 * Get coming soon assessments
 */
export function getComingSoonAssessments(): Assessment[] {
  return ASSESSMENTS.filter((a) => a.status === "coming-soon");
}
