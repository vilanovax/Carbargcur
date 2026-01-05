/**
 * Comprehensive Holland Assessment Scoring Logic
 *
 * Calculate career fit with job role suggestions
 */

import type { HollandAnswer, HollandDimension, HollandCareerFit } from './holland-types';
import type { HollandFullResult } from './holland-full-types';
import { HOLLAND_DIMENSION_MAP } from './holland-types';
import { getCareerCluster } from './holland-full-types';

/**
 * Calculate comprehensive Holland result from 36 answers
 * Returns top 3 dimensions + career cluster + job roles
 */
export function calculateHollandFullResult(answers: HollandAnswer[]): HollandFullResult {
  // Count scores per dimension (0-36)
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

  // Top 3 dimensions
  const primaryDimension = sortedDimensions[0];
  const secondaryDimension = sortedDimensions[1];
  const tertiaryDimension = sortedDimensions[2];

  const primary = HOLLAND_DIMENSION_MAP[primaryDimension];
  const secondary = HOLLAND_DIMENSION_MAP[secondaryDimension];
  const tertiary = HOLLAND_DIMENSION_MAP[tertiaryDimension];

  // Get career cluster based on primary + secondary
  const careerCluster = getCareerCluster(primary, secondary);

  return {
    primary,
    secondary,
    tertiary,
    scores,
    cluster: careerCluster.name,
    clusterDescription: careerCluster.description,
    roles: careerCluster.roles,
    completedAt: new Date().toISOString(),
  };
}
