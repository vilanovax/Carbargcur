/**
 * Assessment Module Exports
 */

// Types
export type { DISCDimension, DISCStyle, DISCStyleInfo } from './disc-types';
export type { HollandDimension, HollandCareerFit, HollandCareerFitInfo } from './holland-types';

// DISC
export { DISC_STYLES, DISC_DIMENSION_MAP, getDISCStyleInfo, isValidDISCStyle } from './disc-types';

// Holland
export { HOLLAND_CAREER_FITS, HOLLAND_DIMENSION_MAP, getHollandCareerFitInfo } from './holland-types';

// AI Explanation Engine
export {
  generateDISCExplanation,
  generateHollandExplanation,
  generateCompactDISCExplanation,
  generateCompactHollandExplanation,
  type AssessmentExplanation,
  type CompactExplanation,
  type CareerSuggestion,
  type TeamDynamic,
  type ExplanationSection,
} from './AIExplanationEngine';
