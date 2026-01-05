/**
 * Personality Assessment Types and Mappings
 *
 * Two-tier MBTI-based work style assessment system:
 * - Quick Test (12 questions, 3 min) - Free, default
 * - Full Test (40-60 questions, 10 min) - Premium, detailed analysis
 */

import type { WorkStyleTrait, Dimension } from './assessment/types';

// Personality type keys (4 types for MVP - legacy)
export type PersonalityType = "analytical" | "executive" | "structured" | "team_oriented";

// Quick test result (12 questions, free)
export interface QuickTestResult {
  styles: WorkStyleTrait[]; // 2-3 dominant work style traits
  completedAt: string; // ISO date string
}

// Full test result (40-60 questions, premium)
export interface FullTestResult {
  styles: WorkStyleTrait[]; // 3-4 dominant work style traits (more accurate)
  scores: Record<Dimension, number>; // Detailed scores per dimension (0-100)
  completedAt: string; // ISO date string
}

// Combined personality result structure
export interface PersonalityResult {
  type?: PersonalityType; // Legacy field for simple personality type
  quick?: QuickTestResult; // Quick test results (12 questions)
  full?: FullTestResult; // Full test results (40-60 questions)
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
