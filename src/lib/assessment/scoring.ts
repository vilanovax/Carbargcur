import type { Answer, AssessmentResult, Dimension, WorkStyleTrait } from './types';

export function calculateResult(answers: Answer[]): AssessmentResult {
  const dimensionScores: Record<Dimension, Record<WorkStyleTrait, number>> = {
    'information-processing': {} as Record<WorkStyleTrait, number>,
    'decision-making': {} as Record<WorkStyleTrait, number>,
    'work-structure': {} as Record<WorkStyleTrait, number>,
    'collaboration-style': {} as Record<WorkStyleTrait, number>,
  };

  const dimensionMap: Record<number, Dimension> = {
    1: 'information-processing', 2: 'information-processing', 3: 'information-processing',
    4: 'decision-making', 5: 'decision-making', 6: 'decision-making',
    7: 'work-structure', 8: 'work-structure', 9: 'work-structure',
    10: 'collaboration-style', 11: 'collaboration-style', 12: 'collaboration-style',
  };

  answers.forEach((answer) => {
    const dimension = dimensionMap[answer.questionId];
    const trait = answer.trait;
    if (!dimensionScores[dimension][trait]) {
      dimensionScores[dimension][trait] = 0;
    }
    dimensionScores[dimension][trait]++;
  });

  const dominantStyles: WorkStyleTrait[] = [];
  const dimensionResults: Record<Dimension, { trait: WorkStyleTrait; score: number }[]> = {
    'information-processing': [], 'decision-making': [], 'work-structure': [], 'collaboration-style': [],
  };

  Object.entries(dimensionScores).forEach(([dimension, traits]) => {
    const sortedTraits = Object.entries(traits)
      .map(([trait, score]) => ({ trait: trait as WorkStyleTrait, score }))
      .sort((a, b) => b.score - a.score);
    dimensionResults[dimension as Dimension] = sortedTraits;
    if (sortedTraits.length > 0 && sortedTraits[0].score >= 2) {
      dominantStyles.push(sortedTraits[0].trait);
    }
  });

  return { styles: dominantStyles, dimensionScores: dimensionResults, completedAt: new Date().toISOString() };
}

export function generateSummary(styles: WorkStyleTrait[]): string {
  if (styles.length === 0) {
    return 'نتیجه آزمون شما نشان‌دهنده تعادل میان روش‌های مختلف کاری است.';
  }
  const styleDescriptions: Record<WorkStyleTrait, string> = {
    analytical: 'دقت و تحلیل', 'big-picture': 'دیدگاه کلی', logical: 'تفکر منطقی', 'value-driven': 'توجه به ارزش‌ها',
    structured: 'نظم و برنامه‌ریزی', flexible: 'انعطاف و سازگاری', independent: 'استقلال در کار', 'team-oriented': 'همکاری تیمی',
  };
  const descriptions = styles.map((s) => styleDescriptions[s]).filter(Boolean);
  if (descriptions.length === 1) {
    return 'سبک کاری شما با ' + descriptions[0] + ' مشخص می‌شود.';
  } else if (descriptions.length === 2) {
    return 'سبک کاری شما ترکیبی از ' + descriptions[0] + ' و ' + descriptions[1] + ' است.';
  } else if (descriptions.length === 3) {
    return 'سبک کاری شما شامل ' + descriptions[0] + '، ' + descriptions[1] + ' و ' + descriptions[2] + ' می‌باشد.';
  } else {
    const first3 = descriptions.slice(0, 3).join('، ');
    return 'سبک کاری شما ترکیبی متوازن از ' + first3 + ' و سایر ویژگی‌ها است.';
  }
}
