/**
 * Full Assessment Scoring Logic
 *
 * Advanced scoring for 48-question comprehensive test
 * Calculates detailed dimension scores (0-100)
 */

import type { Answer, WorkStyleTrait, Dimension, AssessmentResult } from './types';

/**
 * Calculate comprehensive assessment result with dimension scores
 */
export function calculateFullResult(answers: Answer[]): AssessmentResult & { scores: Record<Dimension, number> } {
  // Group answers by dimension
  const dimensionAnswers = answers.reduce((acc, answer) => {
    const dim = getDimensionForAnswer(answer);
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(answer);
    return acc;
  }, {} as Record<Dimension, Answer[]>);

  // Calculate scores for each dimension (0-100)
  const scores: Record<Dimension, number> = {
    'information-processing': 0,
    'decision-making': 0,
    'work-structure': 0,
    'collaboration-style': 0,
  };

  // Count trait occurrences per dimension
  const dimensionTraitCounts: Record<Dimension, Record<string, number>> = {
    'information-processing': {},
    'decision-making': {},
    'work-structure': {},
    'collaboration-style': {},
  };

  // Count traits per dimension
  Object.entries(dimensionAnswers).forEach(([dimension, dimAnswers]) => {
    dimAnswers.forEach(answer => {
      const trait = answer.trait;
      if (!dimensionTraitCounts[dimension as Dimension][trait]) {
        dimensionTraitCounts[dimension as Dimension][trait] = 0;
      }
      dimensionTraitCounts[dimension as Dimension][trait]++;
    });
  });

  // Calculate percentage scores
  // Each dimension has 12 questions
  Object.keys(scores).forEach(dim => {
    const dimension = dim as Dimension;
    const traits = dimensionTraitCounts[dimension];
    const totalQuestions = 12;

    // Get the dominant trait count
    const traitCounts = Object.values(traits);
    const maxCount = Math.max(...traitCounts, 0);

    // Score = (dominant trait count / total questions) * 100
    scores[dimension] = Math.round((maxCount / totalQuestions) * 100);
  });

  // Determine dominant styles (3-4 styles)
  // A style is dominant if it appears >= 7 times in its dimension
  const dominantStyles: WorkStyleTrait[] = [];

  Object.entries(dimensionTraitCounts).forEach(([_, traits]) => {
    Object.entries(traits).forEach(([trait, count]) => {
      if (count >= 7) {
        dominantStyles.push(trait as WorkStyleTrait);
      }
    });
  });

  // Ensure we have 3-4 styles (fallback to top traits if needed)
  if (dominantStyles.length < 3) {
    const allTraits = Object.entries(dimensionTraitCounts).flatMap(([_, traits]) =>
      Object.entries(traits).map(([trait, count]) => ({ trait: trait as WorkStyleTrait, count }))
    );

    allTraits.sort((a, b) => b.count - a.count);

    allTraits.forEach(({ trait }) => {
      if (dominantStyles.length < 4 && !dominantStyles.includes(trait)) {
        dominantStyles.push(trait);
      }
    });
  }

  // Limit to top 4
  const finalStyles = dominantStyles.slice(0, 4);

  return {
    styles: finalStyles,
    dimensionScores: {} as any, // Not used in new structure
    completedAt: new Date().toISOString(),
    scores,
  };
}

/**
 * Get dimension for an answer based on question ID
 * Questions 1-12: Information Processing
 * Questions 13-24: Decision Making
 * Questions 25-36: Work Structure
 * Questions 37-48: Collaboration Style
 */
function getDimensionForAnswer(answer: Answer): Dimension {
  const qId = answer.questionId;

  if (qId >= 1 && qId <= 12) return 'information-processing';
  if (qId >= 13 && qId <= 24) return 'decision-making';
  if (qId >= 25 && qId <= 36) return 'work-structure';
  if (qId >= 37 && qId <= 48) return 'collaboration-style';

  return 'information-processing'; // fallback
}

/**
 * Generate comprehensive summary text based on styles
 */
export function generateFullSummary(styles: WorkStyleTrait[]): string {
  const summaries: Record<string, string> = {
    'analytical-logical-structured-independent':
      'شما یک متخصص تحلیل‌گر هستید که با دقت و استقلال کار می‌کنید. در محیط‌های ساختارمند و داده‌محور بهترین عملکرد را دارید.',

    'analytical-logical-structured-team-oriented':
      'شما یک تحلیلگر سیستماتیک هستید که در تیم‌های منظم موفق می‌شوید. ترکیب دقت فردی و همکاری تیمی نقطه قوت شماست.',

    'analytical-logical-flexible-independent':
      'شما یک حل‌کننده مسئله مستقل هستید که با منطق و انعطاف کار می‌کنید. در پروژه‌های پیچیده و غیرمتعارف موفق‌ترید.',

    'analytical-logical-flexible-team-oriented':
      'شما یک تحلیلگر منعطف هستید که در تیم‌های پویا موفق می‌شوید. توانایی تطبیق منطقی با تغییرات نقطه قوت شماست.',

    'analytical-value-driven-structured-independent':
      'شما ترکیبی از دقت تحلیلی و ملاحظات انسانی دارید. در نقش‌های مشاوره‌ای و پژوهشی موفق‌ترید.',

    'analytical-value-driven-structured-team-oriented':
      'شما یک تحلیلگر همدل هستید که در تیم‌های انسان‌محور موفق می‌شوید. ترکیب داده و احساس نقطه قوت شماست.',

    'big-picture-logical-structured-independent':
      'شما یک استراتژیست منطقی هستید که با دید کلان کار می‌کنید. در نقش‌های برنامه‌ریزی و مدیریت موفق‌ترید.',

    'big-picture-logical-structured-team-oriented':
      'شما یک رهبر استراتژیک هستید که تیم را به سمت اهداف بلندمدت هدایت می‌کنید. ترکیب دید کلان و سازماندهی نقطه قوت شماست.',

    'big-picture-logical-flexible-independent':
      'شما یک نوآور استراتژیک هستید که با سرعت و چابکی کار می‌کنید. در محیط‌های پویا و استارتاپی موفق‌ترید.',

    'big-picture-logical-flexible-team-oriented':
      'شما یک رهبر چابک هستید که تیم را در تغییرات سریع هدایت می‌کنید. تطبیق استراتژیک با موقعیت‌ها نقطه قوت شماست.',

    'big-picture-value-driven-structured-independent':
      'شما یک ایده‌پرداز ارزش‌محور هستید که با برنامه‌ریزی کار می‌کنید. در نقش‌های توسعه محصول و خدمات موفق‌ترید.',

    'big-picture-value-driven-structured-team-oriented':
      'شما یک رهبر الهام‌بخش هستید که تیم را با چشم‌انداز روشن هدایت می‌کنید. ایجاد فرهنگ سازمانی مثبت نقطه قوت شماست.',

    'big-picture-value-driven-flexible-independent':
      'شما یک خلاق ارزش‌محور هستید که با آزادی عمل بهترین نتیجه را می‌دهید. در نقش‌های نوآورانه و خلاقانه موفق‌ترید.',

    'big-picture-value-driven-flexible-team-oriented':
      'شما یک رهبر انسان‌گرا هستید که تیم را با انعطاف و همدلی هدایت می‌کنید. ایجاد تیم‌های پرانرژی نقطه قوت شماست.',

    'analytical-logical-independent':
      'شما یک متخصص تحلیلی هستید که به‌طور مستقل و با دقت کار می‌کنید. در نقش‌های تخصصی و پژوهشی موفق‌ترید.',

    'analytical-structured-team-oriented':
      'شما یک تحلیلگر سیستماتیک هستید که در تیم‌های منظم موفق می‌شوید. دقت در کار تیمی نقطه قوت شماست.',

    'logical-structured-independent':
      'شما یک متخصص منظم هستید که با استقلال و نظم کار می‌کنید. در نقش‌های عملیاتی و مدیریتی موفق‌ترید.',
  };

  // Create key from sorted styles
  const key = styles.sort().join('-');

  // Return specific summary or generic one
  return summaries[key] ||
    `سبک کاری شما ترکیبی از ${styles.join('، ')} است. این ترکیب منحصربه‌فرد به شما کمک می‌کند در محیط‌های متنوع موفق باشید.`;
}

/**
 * Get dimension label in Persian
 */
export function getDimensionLabel(dimension: Dimension): string {
  const labels: Record<Dimension, string> = {
    'information-processing': 'پردازش اطلاعات',
    'decision-making': 'تصمیم‌گیری',
    'work-structure': 'ساختار کار',
    'collaboration-style': 'تعامل کاری',
  };

  return labels[dimension];
}
