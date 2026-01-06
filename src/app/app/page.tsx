import DashboardRouter from "@/components/dashboard/DashboardRouter";

/**
 * Main Dashboard Page
 *
 * Uses DashboardRouter to automatically select:
 * - Zero-State Mode: For new users with no data
 * - Normal Mode: For users with some profile progress
 *
 * This ensures new users get onboarding-focused experience,
 * while existing users see metrics and progress tracking.
 */
export default function DashboardPage() {
  return <DashboardRouter />;
}
