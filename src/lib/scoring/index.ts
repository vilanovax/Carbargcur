/**
 * Test Scoring Module
 *
 * Exports all scoring functions and types for MBTI, DISC, and Holland assessments
 */

export {
  // Main Engine
  calculateTestScore,

  // Helper Functions
  getDISCLabel,
  getHollandLabel,
  getMBTILabel,
  calculateTotalProfileBonus,
  generateExplanationPayload,

  // Types
  type TestType,
  type TestAnswer,
  type ScoringInput,
  type ScoringResult,
  type MBTIDimension,
  type MBTIPair,
  type MBTIResultPayload,
  type DISCDimension,
  type DISCResultPayload,
  type HollandDimension,
  type HollandResultPayload,
} from './TestScoringEngine';
