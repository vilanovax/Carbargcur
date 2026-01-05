/**
 * Holland Assessment Scoring Logic
 *
 * Calculate career fit from answers
 */

import type { HollandAnswer, HollandResult, HollandDimension, HollandCareerFit } from './holland-types';
import { HOLLAND_DIMENSION_MAP } from './holland-types';

/**
 * Calculate Holland result from answers
 */
export function calculateHollandResult(answers: HollandAnswer[]): HollandResult {
  // Count scores per dimension
  const scores: Record<HollandDimension, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  answers.forEach((answer) => {
    scores[answer.selectedDimension]++;
  });

  // Sort dimensions by score (descending)
  const sortedDimensions = (Object.keys(scores) as HollandDimension[])
    .sort((a, b) => scores[b] - scores[a]);

  // Primary career fit (highest score)
  const primaryDimension = sortedDimensions[0];
  const primary = HOLLAND_DIMENSION_MAP[primaryDimension];

  // Secondary career fit (second highest, if significant)
  let secondary: HollandCareerFit | undefined;
  const secondaryDimension = sortedDimensions[1];

  // Include secondary if it has at least 2 points
  if (scores[secondaryDimension] >= 2) {
    secondary = HOLLAND_DIMENSION_MAP[secondaryDimension];
  }

  return {
    primary,
    secondary,
    scores,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Generate combined explanation based on primary and secondary
 */
export function generateHollandExplanation(primary: HollandCareerFit, secondary?: HollandCareerFit): string {
  // Simple mapping based on combination
  if (!secondary) {
    return `نتیجه شما نشان می‌دهد در نقش‌هایی که به این مهارت نیاز دارند عملکرد بهتری خواهید داشت.`;
  }

  // Combined explanations
  const combinations: Record<string, string> = {
    'practical-analytical': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به تحلیل و اجرای عملی دارند، مانند مهندسی و فناوری، عملکرد بهتری دارید.',
    'practical-conventional': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به دقت، نظم و اجرا دارند، مانند تولید و عملیات، عملکرد بهتری دارید.',
    'analytical-creative': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به تحلیل و خلاقیت دارند، مانند پژوهش و طراحی، عملکرد بهتری دارید.',
    'analytical-conventional': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به تحلیل، دقت و ساختار دارند، مانند مالی و تحلیل داده، عملکرد بهتری دارید.',
    'creative-social': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به خلاقیت و تعامل با مردم دارند، مانند طراحی UX و محتوا، عملکرد بهتری دارید.',
    'creative-enterprising': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به خلاقیت و کسب‌وکار دارند، مانند مارکتینگ و کارآفرینی، عملکرد بهتری دارید.',
    'social-enterprising': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به ارتباط و مدیریت دارند، مانند منابع انسانی و فروش، عملکرد بهتری دارید.',
    'enterprising-conventional': 'نتیجه شما نشان می‌دهد در نقش‌هایی که نیاز به مدیریت و نظم دارند، مانند مدیریت پروژه و عملیات، عملکرد بهتری دارید.',
  };

  const key = `${primary}-${secondary}`;
  const reverseKey = `${secondary}-${primary}`;

  return combinations[key] || combinations[reverseKey] || 'نتیجه شما نشان می‌دهد ترکیبی از مهارت‌های متنوع دارید که در نقش‌های مختلف می‌توانید موفق باشید.';
}
