/**
 * Holland Career Assessment Types (RIASEC)
 *
 * Work-oriented career fit assessment
 */

export type HollandDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type HollandCareerFit =
  | 'practical'      // R → عملی / اجرایی
  | 'analytical'     // I → تحلیلی / پژوهشی
  | 'creative'       // A → خلاق / نوآور
  | 'social'         // S → انسانی / آموزشی
  | 'enterprising'   // E → مدیریتی / تجاری
  | 'conventional';  // C → ساختارمند / دفتری

export interface HollandQuestion {
  id: number;
  text: string;
  options: Record<HollandDimension, string>;
}

export interface HollandAnswer {
  questionId: number;
  selectedDimension: HollandDimension;
}

export interface HollandResult {
  primary: HollandCareerFit;
  secondary?: HollandCareerFit;
  scores: Record<HollandDimension, number>;
  completedAt: string;
}

export interface HollandCareerFitInfo {
  label: string;
  description: string;
  fullDescription: string;
}

// Mapping from dimension to career fit
export const HOLLAND_DIMENSION_MAP: Record<HollandDimension, HollandCareerFit> = {
  R: 'practical',
  I: 'analytical',
  A: 'creative',
  S: 'social',
  E: 'enterprising',
  C: 'conventional',
};

// Career fit information in Persian
export const HOLLAND_CAREER_FITS: Record<HollandCareerFit, HollandCareerFitInfo> = {
  practical: {
    label: 'عملی / اجرایی',
    description: 'شما در نقش‌های عملی و اجرایی موفق‌ترید',
    fullDescription: 'شما در مشاغلی که نیاز به کار عملی، اجرا و تعامل با ابزار دارند عملکرد بهتری دارید. نقش‌های فنی، تولیدی و اجرایی برای شما مناسب است.',
  },
  analytical: {
    label: 'تحلیلی / پژوهشی',
    description: 'شما در نقش‌های تحلیلی و پژوهشی موفق‌ترید',
    fullDescription: 'شما در مشاغلی که نیاز به تحلیل، تحقیق و حل مسائل پیچیده دارند عملکرد بهتری دارید. نقش‌های تحلیلگری، پژوهش و علمی برای شما مناسب است.',
  },
  creative: {
    label: 'خلاق / نوآور',
    description: 'شما در نقش‌های خلاق و نوآور موفق‌ترید',
    fullDescription: 'شما در مشاغلی که نیاز به خلاقیت، نوآوری و ایده‌پردازی دارند عملکرد بهتری دارید. نقش‌های طراحی، محتوا و ابداعی برای شما مناسب است.',
  },
  social: {
    label: 'انسانی / آموزشی',
    description: 'شما در نقش‌های انسانی و آموزشی موفق‌ترید',
    fullDescription: 'شما در مشاغلی که نیاز به تعامل با انسان، آموزش و حمایت دارند عملکرد بهتری دارید. نقش‌های آموزشی، مشاوره و خدماتی برای شما مناسب است.',
  },
  enterprising: {
    label: 'مدیریتی / تجاری',
    description: 'شما در نقش‌های مدیریتی و تجاری موفق‌ترید',
    fullDescription: 'شما در مشاغلی که نیاز به رهبری، مدیریت و تصمیم‌گیری دارند عملکرد بهتری دارید. نقش‌های مدیریتی، فروش و کسب‌وکار برای شما مناسب است.',
  },
  conventional: {
    label: 'ساختارمند / دفتری',
    description: 'شما در نقش‌های ساختارمند و دفتری موفق‌ترید',
    fullDescription: 'شما در مشاغلی که نیاز به نظم، دقت و کار با فرآیندهای مشخص دارند عملکرد بهتری دارید. نقش‌های اداری، مالی و سازمانی برای شما مناسب است.',
  },
};

/**
 * Get career fit information
 */
export function getHollandCareerFitInfo(careerFit: HollandCareerFit): HollandCareerFitInfo {
  return HOLLAND_CAREER_FITS[careerFit];
}
