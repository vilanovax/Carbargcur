/**
 * Personality Assessment Types and Mappings
 *
 * Simple work style classifications for professional profiles
 * Based on Karbarg assessment system
 */

// Personality type keys (4 types for MVP)
export type PersonalityType = "analytical" | "executive" | "structured" | "team_oriented";

// Personality result structure
export interface PersonalityResult {
  type: PersonalityType;
  completedAt?: Date;
}

// Static personality type definitions with Persian labels and descriptions
export const PERSONALITY_TYPES: Record<
  PersonalityType,
  {
    label: string; // Badge label
    description: string; // One-line description
  }
> = {
  analytical: {
    label: "تحلیلی",
    description: "مناسب محیط‌های ساختارمند و تصمیم‌گیری مبتنی بر داده",
  },
  executive: {
    label: "اجرایی",
    description: "متمرکز بر نتیجه و اجرای سریع تصمیم‌ها",
  },
  structured: {
    label: "ساختارمند",
    description: "علاقه‌مند به فرآیندهای مشخص و چارچوب‌های روشن",
  },
  team_oriented: {
    label: "تیمی",
    description: "موفق در همکاری گروهی و ارتباط مؤثر",
  },
};

/**
 * Helper function to get personality type info
 */
export function getPersonalityInfo(type: PersonalityType) {
  return PERSONALITY_TYPES[type];
}

/**
 * Check if a personality type is valid
 */
export function isValidPersonalityType(type: string): type is PersonalityType {
  return type in PERSONALITY_TYPES;
}
