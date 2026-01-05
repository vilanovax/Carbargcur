/**
 * Work Style Assessment Types
 * Based on MBTI framework but focused on work preferences
 */

export type WorkStyleTrait =
  | 'analytical'
  | 'big-picture'
  | 'logical'
  | 'value-driven'
  | 'structured'
  | 'flexible'
  | 'independent'
  | 'team-oriented';

export type Dimension =
  | 'information-processing'
  | 'decision-making'
  | 'work-structure'
  | 'collaboration-style';

export interface Question {
  id: number;
  dimension: Dimension;
  text: string;
  options: {
    a: {
      text: string;
      trait: WorkStyleTrait;
    };
    b: {
      text: string;
      trait: WorkStyleTrait;
    };
  };
}

export interface Answer {
  questionId: number;
  selectedOption: 'a' | 'b';
  trait: WorkStyleTrait;
}

export interface AssessmentResult {
  styles: WorkStyleTrait[];
  dimensionScores: Record<Dimension, { trait: WorkStyleTrait; score: number }[]>;
  completedAt: string;
}

export interface TraitInfo {
  title: string;
  description: string;
  dimension: Dimension;
}
