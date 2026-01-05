export type ResumeTheme = "classic" | "modern";

export interface ResumeThemeMetadata {
  id: ResumeTheme;
  label: string;
  description: string;
  isPremium?: boolean;
}

export const RESUME_THEMES: ResumeThemeMetadata[] = [
  {
    id: "classic",
    label: "قالب کلاسیک",
    description: "قالب ساده و متن‌محور مناسب برای همه مشاغل",
    isPremium: false,
  },
  {
    id: "modern",
    label: "قالب مدرن",
    description: "قالب دو ستونه حرفه‌ای با سلسله‌مراتب بصری بهتر",
    isPremium: false, // TODO: Change to true when premium features are ready
  },
];

export const DEFAULT_RESUME_THEME: ResumeTheme = "classic";
export const RESUME_THEME_STORAGE_KEY = "karbarg:resume:theme";

/**
 * Get selected resume theme from localStorage
 */
export function getSelectedResumeTheme(): ResumeTheme {
  if (typeof window === "undefined") return DEFAULT_RESUME_THEME;

  try {
    const saved = localStorage.getItem(RESUME_THEME_STORAGE_KEY);
    if (saved && (saved === "classic" || saved === "modern")) {
      return saved;
    }
  } catch (error) {
    console.error("Failed to load resume theme:", error);
  }

  return DEFAULT_RESUME_THEME;
}

/**
 * Save selected resume theme to localStorage
 */
export function saveSelectedResumeTheme(theme: ResumeTheme): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(RESUME_THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error("Failed to save resume theme:", error);
  }
}
