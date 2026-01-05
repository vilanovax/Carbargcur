/**
 * DISC Assessment Scoring Logic
 *
 * Calculate DISC profile from answers
 */

import type { DISCAnswer, DISCResult, DISCDimension, DISCStyle } from './disc-types';
import { DISC_DIMENSION_MAP } from './disc-types';

/**
 * Calculate DISC result from answers
 */
export function calculateDISCResult(answers: DISCAnswer[]): DISCResult {
  // Count scores per dimension
  const scores: Record<DISCDimension, number> = {
    D: 0,
    I: 0,
    S: 0,
    C: 0,
  };

  answers.forEach((answer) => {
    scores[answer.selectedDimension]++;
  });

  // Sort dimensions by score (descending)
  const sortedDimensions = (Object.keys(scores) as DISCDimension[])
    .sort((a, b) => scores[b] - scores[a]);

  // Primary style (highest score)
  const primaryDimension = sortedDimensions[0];
  const primary = DISC_DIMENSION_MAP[primaryDimension];

  // Secondary style (if close to primary - within 2 points)
  let secondary: DISCStyle | undefined;
  const secondaryDimension = sortedDimensions[1];
  const scoreDiff = scores[primaryDimension] - scores[secondaryDimension];

  if (scoreDiff <= 2 && scores[secondaryDimension] >= 3) {
    secondary = DISC_DIMENSION_MAP[secondaryDimension];
  }

  return {
    primary,
    secondary,
    scores,
    completedAt: new Date().toISOString(),
  };
}
