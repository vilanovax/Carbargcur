/**
 * AI Explanation Engine
 *
 * Generates rich, contextual explanations for assessment results.
 * Designed to be:
 * - Explainable: Every insight has a clear source
 * - Contextual: Relevant to finance/accounting domain
 * - Actionable: Practical suggestions for career development
 */

import type { DISCStyle, DISCDimension } from './disc-types';
import type { HollandCareerFit, HollandDimension } from './holland-types';
import type { DISCAssessmentResult, HollandAssessmentResult } from '../onboarding';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ExplanationSection {
  title: string;
  content: string;
  highlights?: string[];
}

export interface CareerSuggestion {
  role: string;
  fit: 'high' | 'medium';
  reason: string;
}

export interface TeamDynamic {
  strength: string;
  challenge: string;
  tip: string;
}

export interface AssessmentExplanation {
  summary: string;
  sections: ExplanationSection[];
  careerSuggestions: CareerSuggestion[];
  teamDynamics: TeamDynamic;
  developmentAreas: string[];
  forEmployers: string;
}

// ============================================
// DISC EXPLANATIONS
// ============================================

const DISC_DETAILED_INFO: Record<DISCStyle, {
  summary: string;
  workStyle: string;
  communication: string;
  decisionMaking: string;
  stressResponse: string;
  motivation: string;
  careers: CareerSuggestion[];
  teamStrength: string;
  teamChallenge: string;
  teamTip: string;
  development: string[];
  employerView: string;
}> = {
  'result-oriented': {
    summary: 'شما با تمرکز بر نتایج و دستیابی به اهداف، انرژی خود را صرف پیشبرد پروژه‌ها می‌کنید. سرعت عمل و قاطعیت از ویژگی‌های بارز شماست.',
    workStyle: 'شما ترجیح می‌دهید کنترل کارها را در دست داشته باشید و مستقل تصمیم بگیرید. چالش‌ها شما را برمی‌انگیزند و در محیط‌های پرسرعت عملکرد بهتری دارید.',
    communication: 'ارتباط شما مستقیم و صریح است. ترجیح می‌دهید سریع به اصل مطلب برسید و از جزئیات غیرضروری پرهیز کنید.',
    decisionMaking: 'تصمیم‌گیری سریع با تمرکز بر نتیجه نهایی. گاهی ممکن است جزئیات را نادیده بگیرید.',
    stressResponse: 'در شرایط فشار، ممکن است بیش از حد کنترل‌گر شوید. تنفس عمیق و تفویض اختیار کمک‌کننده است.',
    motivation: 'چالش‌های جدید، اختیار عمل و دیدن نتایج ملموس',
    careers: [
      { role: 'مدیر مالی (CFO)', fit: 'high', reason: 'نیاز به تصمیم‌گیری قاطع و هدف‌گرایی' },
      { role: 'مدیر پروژه مالی', fit: 'high', reason: 'پیشبرد پروژه‌ها با تمرکز بر نتیجه' },
      { role: 'سرپرست حسابرسی', fit: 'medium', reason: 'رهبری تیم و مدیریت زمان‌بندی' },
      { role: 'مدیر ریسک', fit: 'high', reason: 'تصمیم‌گیری سریع در شرایط نامطمئن' },
    ],
    teamStrength: 'پیشبرد پروژه‌ها و ایجاد جهت‌گیری واضح',
    teamChallenge: 'گاهی ممکن است نظرات دیگران را نادیده بگیرید',
    teamTip: 'قبل از تصمیم‌گیری، ۳۰ ثانیه برای شنیدن نظر تیم وقت بگذارید',
    development: [
      'تمرین گوش دادن فعال قبل از ارائه راه‌حل',
      'در نظر گرفتن احساسات همکاران در تصمیم‌گیری',
      'صبر بیشتر در فرآیندهای تیمی',
    ],
    employerView: 'این فرد در نقش‌های رهبری و مدیریت پروژه عملکرد عالی دارد. به او استقلال عمل بدهید و اهداف چالش‌برانگیز تعیین کنید.',
  },
  'people-oriented': {
    summary: 'شما با انرژی مثبت و توانایی ارتباط‌گیری، محیط کار را پرنشاط می‌کنید. در متقاعدسازی و ایجاد انگیزه در دیگران مهارت دارید.',
    workStyle: 'شما در محیط‌های تیمی و تعاملی عملکرد بهتری دارید. ایده‌های جدید را دوست دارید و از روتین فرار می‌کنید.',
    communication: 'ارتباط شما گرم، صمیمی و پرانرژی است. در جلسات فعال هستید و به راحتی با دیگران ارتباط برقرار می‌کنید.',
    decisionMaking: 'تصمیم‌گیری با در نظر گرفتن تأثیر بر افراد و با خوش‌بینی. گاهی جزئیات عملیاتی فراموش می‌شود.',
    stressResponse: 'در فشار ممکن است پراکنده شوید. فهرست کارها و اولویت‌بندی کمک‌کننده است.',
    motivation: 'تعامل اجتماعی، تنوع در کار و شناخت و تقدیر',
    careers: [
      { role: 'مدیر روابط بانکی', fit: 'high', reason: 'تعامل مستمر با مشتریان کلیدی' },
      { role: 'مشاور سرمایه‌گذاری', fit: 'high', reason: 'ارتباط‌گیری و متقاعدسازی مشتریان' },
      { role: 'آموزش‌دهنده مالی', fit: 'medium', reason: 'انتقال دانش با انرژی و جذابیت' },
      { role: 'مدیر فروش بیمه', fit: 'high', reason: 'شبکه‌سازی و ایجاد اعتماد' },
    ],
    teamStrength: 'ایجاد انرژی مثبت و حفظ روحیه تیم',
    teamChallenge: 'گاهی ممکن است روی جزئیات کم‌دقت باشید',
    teamTip: 'یک چک‌لیست ساده برای مرور جزئیات قبل از تحویل کار داشته باشید',
    development: [
      'تمرکز بیشتر روی جزئیات و پیگیری',
      'گوش دادن به انتقادات سازنده',
      'مدیریت زمان و اولویت‌بندی',
    ],
    employerView: 'این فرد برای نقش‌های ارتباطی و مشتری‌مدار عالی است. محیط تیمی و فرصت تعامل فراهم کنید.',
  },
  'stable': {
    summary: 'شما با ثبات، صبر و قابلیت اعتماد بالا، ستون اصلی تیم هستید. در حفظ هماهنگی و پشتیبانی از دیگران مهارت دارید.',
    workStyle: 'شما محیط‌های باثبات و قابل پیش‌بینی را ترجیح می‌دهید. صبور هستید و در کارهای تکراری و نیازمند دقت خوب عمل می‌کنید.',
    communication: 'ارتباط شما آرام، صبورانه و گوش‌دهنده است. قبل از پاسخ، خوب فکر می‌کنید.',
    decisionMaking: 'تصمیم‌گیری محتاطانه و با در نظر گرفتن تأثیر بر همه. ممکن است زمان‌بر باشد.',
    stressResponse: 'در فشار ممکن است بیش از حد محافظه‌کار شوید. تغییرات کوچک و تدریجی کمک‌کننده است.',
    motivation: 'امنیت شغلی، قدردانی و محیط هماهنگ',
    careers: [
      { role: 'حسابدار ارشد', fit: 'high', reason: 'نیاز به دقت و ثبات در کار روزانه' },
      { role: 'کارشناس بودجه', fit: 'high', reason: 'کار منظم و فرآیندمحور' },
      { role: 'متخصص تطبیق بانکی', fit: 'high', reason: 'کار دقیق و تکراری' },
      { role: 'کارشناس خزانه‌داری', fit: 'medium', reason: 'فرآیندهای منظم و قابل پیش‌بینی' },
    ],
    teamStrength: 'ایجاد ثبات و قابلیت اعتماد در تیم',
    teamChallenge: 'ممکن است در برابر تغییرات مقاومت کنید',
    teamTip: 'تغییرات را به مراحل کوچک تقسیم کنید تا راحت‌تر بپذیرید',
    development: [
      'پذیرش تدریجی تغییرات',
      'بیان نیازها و نظرات شخصی',
      'ریسک‌پذیری در تصمیمات کوچک',
    ],
    employerView: 'این فرد قابل‌اعتماد و وفادار است. در نقش‌های نیازمند ثبات و دقت عالی عمل می‌کند. تغییرات را تدریجی معرفی کنید.',
  },
  'precise': {
    summary: 'شما با دقت بالا، توجه به جزئیات و رعایت استانداردها، کیفیت کار را تضمین می‌کنید. در تحلیل و کنترل کیفیت مهارت دارید.',
    workStyle: 'شما کار با قواعد روشن و استانداردهای مشخص را ترجیح می‌دهید. قبل از شروع کار، نیاز به اطلاعات کامل دارید.',
    communication: 'ارتباط شما دقیق، مستند و مبتنی بر داده است. از ابهام پرهیز می‌کنید.',
    decisionMaking: 'تصمیم‌گیری مبتنی بر تحلیل و داده. ممکن است زمان‌بر باشد اما دقیق است.',
    stressResponse: 'در فشار ممکن است بیش از حد تحلیلی شوید. تعیین deadline مشخص کمک‌کننده است.',
    motivation: 'کیفیت کار، فرصت تحلیل عمیق و محیط منظم',
    careers: [
      { role: 'حسابرس', fit: 'high', reason: 'نیاز به دقت و رعایت استانداردها' },
      { role: 'تحلیلگر مالی', fit: 'high', reason: 'تحلیل داده‌ها و گزارش‌نویسی دقیق' },
      { role: 'کنترلر مالی', fit: 'high', reason: 'نظارت بر فرآیندها و کیفیت' },
      { role: 'متخصص IFRS', fit: 'high', reason: 'تسلط بر قواعد و استانداردها' },
    ],
    teamStrength: 'تضمین کیفیت و دقت در خروجی‌های تیم',
    teamChallenge: 'ممکن است بیش از حد روی جزئیات وقت بگذارید',
    teamTip: 'برای هر کار یک "حد کافی" تعریف کنید و به آن پایبند بمانید',
    development: [
      'پذیرش "کافی بودن" به جای "کامل بودن"',
      'اشتراک‌گذاری زودتر کارهای در حال انجام',
      'انعطاف‌پذیری در برابر ابهام',
    ],
    employerView: 'این فرد کیفیت کار را تضمین می‌کند. در نقش‌های نیازمند دقت و تحلیل عالی است. اطلاعات کامل و زمان کافی بدهید.',
  },
};

/**
 * Generate comprehensive DISC explanation
 */
export function generateDISCExplanation(result: DISCAssessmentResult): AssessmentExplanation {
  const info = DISC_DETAILED_INFO[result.primary];
  const secondaryInfo = result.secondary ? DISC_DETAILED_INFO[result.secondary] : null;

  const sections: ExplanationSection[] = [
    {
      title: 'سبک کاری شما',
      content: info.workStyle,
    },
    {
      title: 'شیوه ارتباط',
      content: info.communication,
    },
    {
      title: 'تصمیم‌گیری',
      content: info.decisionMaking,
    },
    {
      title: 'انگیزه‌بخش‌ها',
      content: info.motivation,
      highlights: info.motivation.split('، '),
    },
    {
      title: 'واکنش در فشار',
      content: info.stressResponse,
    },
  ];

  // Add secondary style blend if exists
  if (secondaryInfo) {
    sections.push({
      title: 'ترکیب سبک‌ها',
      content: `سبک ثانویه شما عناصری از "${getStyleLabel(result.secondary!)}" را اضافه می‌کند که به معنای ${getBlendDescription(result.primary, result.secondary!)} است.`,
    });
  }

  return {
    summary: info.summary,
    sections,
    careerSuggestions: info.careers,
    teamDynamics: {
      strength: info.teamStrength,
      challenge: info.teamChallenge,
      tip: info.teamTip,
    },
    developmentAreas: info.development,
    forEmployers: info.employerView,
  };
}

// ============================================
// HOLLAND EXPLANATIONS
// ============================================

const HOLLAND_DETAILED_INFO: Record<HollandCareerFit, {
  summary: string;
  interests: string;
  workPreferences: string;
  valueProposition: string;
  careers: CareerSuggestion[];
  teamStrength: string;
  teamChallenge: string;
  teamTip: string;
  development: string[];
  employerView: string;
}> = {
  'practical': {
    summary: 'شما با رویکرد عملی و اجرایی، در کارهایی که نتیجه ملموس دارند عملکرد عالی دارید. دست به کار شدن و حل مسائل واقعی انگیزه شماست.',
    interests: 'کارهای عملی، حل مسائل فنی، دیدن نتایج ملموس',
    workPreferences: 'محیط‌هایی با چالش‌های واقعی و فرصت اجرا',
    valueProposition: 'تبدیل ایده‌ها به عمل و حل مسائل عملیاتی',
    careers: [
      { role: 'حسابدار صنعتی', fit: 'high', reason: 'ترکیب دانش مالی با درک عملیات' },
      { role: 'کارشناس بهای تمام‌شده', fit: 'high', reason: 'تحلیل عملیاتی و بهینه‌سازی' },
      { role: 'ممیز مالیاتی', fit: 'medium', reason: 'بررسی و حل مسائل واقعی' },
    ],
    teamStrength: 'اجرای سریع و حل مسائل عملی',
    teamChallenge: 'ممکن است از کارهای تئوری خسته شوید',
    teamTip: 'بین کارهای عملی و مستندسازی تعادل برقرار کنید',
    development: ['صبر در فرآیندهای تئوری', 'توجه به مستندسازی'],
    employerView: 'این فرد در نقش‌های اجرایی و عملیاتی عالی است. چالش‌های واقعی و فرصت اجرا بدهید.',
  },
  'analytical': {
    summary: 'شما با ذهن تحلیلی و علاقه به درک عمیق مسائل، در نقش‌های پژوهشی و تحلیلی می‌درخشید. کشف الگوها و حل مسائل پیچیده شما را برمی‌انگیزد.',
    interests: 'تحلیل داده، پژوهش، حل مسائل پیچیده',
    workPreferences: 'فرصت تفکر عمیق، دسترسی به داده و استقلال فکری',
    valueProposition: 'بینش‌های ارزشمند از تحلیل داده‌ها',
    careers: [
      { role: 'تحلیلگر مالی', fit: 'high', reason: 'تحلیل داده‌ها و ارائه بینش' },
      { role: 'پژوهشگر اقتصادی', fit: 'high', reason: 'تحقیق و تحلیل عمیق' },
      { role: 'تحلیلگر ریسک', fit: 'high', reason: 'مدل‌سازی و پیش‌بینی' },
      { role: 'مشاور سرمایه‌گذاری', fit: 'medium', reason: 'تحلیل بازار و توصیه' },
    ],
    teamStrength: 'ارائه بینش‌های عمیق و مبتنی بر داده',
    teamChallenge: 'ممکن است بیش از حد تحلیل کنید',
    teamTip: 'برای تحلیل‌ها زمان مشخص تعیین کنید',
    development: ['تعادل بین تحلیل و اقدام', 'ارتباط ساده‌تر یافته‌ها'],
    employerView: 'این فرد برای نقش‌های تحلیلی و پژوهشی عالی است. فرصت تفکر عمیق و دسترسی به داده بدهید.',
  },
  'creative': {
    summary: 'شما با خلاقیت و نوآوری، راه‌حل‌های جدید می‌یابید. ایده‌پردازی و بهبود فرآیندها انگیزه شماست.',
    interests: 'نوآوری، بهبود فرآیندها، ایده‌های جدید',
    workPreferences: 'آزادی عمل، فرصت نوآوری، عدم محدودیت',
    valueProposition: 'ایده‌های خلاق برای بهبود و نوآوری',
    careers: [
      { role: 'مشاور تحول مالی', fit: 'high', reason: 'طراحی راه‌حل‌های جدید' },
      { role: 'طراح سیستم مالی', fit: 'high', reason: 'خلاقیت در طراحی فرآیندها' },
      { role: 'مدیر محصول فین‌تک', fit: 'medium', reason: 'نوآوری در خدمات مالی' },
    ],
    teamStrength: 'ارائه ایده‌های نو و دیدگاه‌های متفاوت',
    teamChallenge: 'ممکن است از روتین خسته شوید',
    teamTip: 'بخشی از وقت را به کارهای روتین اختصاص دهید',
    development: ['پذیرش محدودیت‌ها', 'تمرکز روی اجرا'],
    employerView: 'این فرد برای نقش‌های نیازمند نوآوری عالی است. آزادی عمل و فرصت خلاقیت بدهید.',
  },
  'social': {
    summary: 'شما با علاقه به کمک و توسعه دیگران، در نقش‌های آموزشی و حمایتی می‌درخشید. تأثیر مثبت روی افراد انگیزه شماست.',
    interests: 'آموزش، کمک به دیگران، توسعه افراد',
    workPreferences: 'تعامل با افراد، فرصت آموزش، محیط حمایتی',
    valueProposition: 'توسعه و توانمندسازی دیگران',
    careers: [
      { role: 'مدرس حسابداری', fit: 'high', reason: 'آموزش و توسعه دیگران' },
      { role: 'مشاور مالی شخصی', fit: 'high', reason: 'کمک به افراد در تصمیم‌گیری' },
      { role: 'مدیر منابع انسانی مالی', fit: 'medium', reason: 'توسعه کارکنان' },
    ],
    teamStrength: 'حمایت از اعضای تیم و ایجاد همبستگی',
    teamChallenge: 'ممکن است نیازهای خود را نادیده بگیرید',
    teamTip: 'زمانی را به نیازهای خود اختصاص دهید',
    development: ['تعادل بین کمک به دیگران و خود', 'قاطعیت در موقع لزوم'],
    employerView: 'این فرد برای نقش‌های آموزشی و حمایتی عالی است. فرصت تعامل و کمک به دیگران بدهید.',
  },
  'enterprising': {
    summary: 'شما با روحیه کارآفرینی و رهبری، در نقش‌های مدیریتی و تجاری عملکرد عالی دارید. دستیابی به اهداف بزرگ انگیزه شماست.',
    interests: 'رهبری، مذاکره، دستیابی به اهداف',
    workPreferences: 'استقلال، فرصت رشد، چالش‌های بزرگ',
    valueProposition: 'رهبری و پیشبرد اهداف سازمانی',
    careers: [
      { role: 'مدیر مالی', fit: 'high', reason: 'رهبری و تصمیم‌گیری استراتژیک' },
      { role: 'مدیر سرمایه‌گذاری', fit: 'high', reason: 'مدیریت سبد و مذاکره' },
      { role: 'بنیان‌گذار فین‌تک', fit: 'high', reason: 'کارآفرینی و نوآوری' },
      { role: 'مدیر فروش خدمات مالی', fit: 'medium', reason: 'رهبری تیم و دستیابی به اهداف' },
    ],
    teamStrength: 'ایجاد جهت‌گیری و انگیزه برای تیم',
    teamChallenge: 'ممکن است بیش از حد سریع پیش بروید',
    teamTip: 'مطمئن شوید تیم همراه شماست',
    development: ['گوش دادن به تیم', 'صبر در فرآیندها'],
    employerView: 'این فرد برای نقش‌های رهبری عالی است. استقلال و چالش‌های بزرگ بدهید.',
  },
  'conventional': {
    summary: 'شما با نظم، دقت و توجه به فرآیندها، در نقش‌های ساختارمند عملکرد عالی دارید. سازمان‌دهی و رعایت قواعد انگیزه شماست.',
    interests: 'نظم، سازمان‌دهی، رعایت فرآیندها',
    workPreferences: 'محیط منظم، قواعد روشن، ساختار مشخص',
    valueProposition: 'نظم و سازمان‌دهی در فرآیندها',
    careers: [
      { role: 'حسابدار', fit: 'high', reason: 'نظم و دقت در ثبت و گزارش' },
      { role: 'کارشناس انطباق', fit: 'high', reason: 'رعایت قواعد و مقررات' },
      { role: 'مدیر اداری مالی', fit: 'high', reason: 'سازمان‌دهی و نظم' },
      { role: 'حسابرس داخلی', fit: 'medium', reason: 'کنترل و نظارت بر فرآیندها' },
    ],
    teamStrength: 'ایجاد نظم و ساختار در تیم',
    teamChallenge: 'ممکن است از تغییرات ناگهانی ناراحت شوید',
    teamTip: 'برای تغییرات، یک دوره انتقال در نظر بگیرید',
    development: ['انعطاف‌پذیری در تغییرات', 'پذیرش ابهام'],
    employerView: 'این فرد برای نقش‌های ساختارمند عالی است. قواعد روشن و محیط منظم فراهم کنید.',
  },
};

/**
 * Generate comprehensive Holland explanation
 */
export function generateHollandExplanation(result: HollandAssessmentResult): AssessmentExplanation {
  const info = HOLLAND_DETAILED_INFO[result.primary];
  const secondaryInfo = result.secondary ? HOLLAND_DETAILED_INFO[result.secondary] : null;

  const sections: ExplanationSection[] = [
    {
      title: 'علایق شغلی',
      content: info.interests,
      highlights: info.interests.split('، '),
    },
    {
      title: 'ترجیحات کاری',
      content: info.workPreferences,
    },
    {
      title: 'ارزش شما برای سازمان',
      content: info.valueProposition,
    },
  ];

  if (secondaryInfo) {
    sections.push({
      title: 'ترکیب علایق',
      content: `علاقه ثانویه شما به "${getCareerFitLabel(result.secondary!)}" یعنی ${getHollandBlendDescription(result.primary, result.secondary!)}`,
    });
  }

  return {
    summary: info.summary,
    sections,
    careerSuggestions: info.careers,
    teamDynamics: {
      strength: info.teamStrength,
      challenge: info.teamChallenge,
      tip: info.teamTip,
    },
    developmentAreas: info.development,
    forEmployers: info.employerView,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStyleLabel(style: DISCStyle): string {
  const labels: Record<DISCStyle, string> = {
    'result-oriented': 'نتیجه‌محور',
    'people-oriented': 'ارتباط‌محور',
    'stable': 'پایدار',
    'precise': 'دقیق',
  };
  return labels[style];
}

function getCareerFitLabel(fit: HollandCareerFit): string {
  const labels: Record<HollandCareerFit, string> = {
    'practical': 'عملی / اجرایی',
    'analytical': 'تحلیلی / پژوهشی',
    'creative': 'خلاق / نوآور',
    'social': 'انسانی / آموزشی',
    'enterprising': 'مدیریتی / تجاری',
    'conventional': 'ساختارمند / دفتری',
  };
  return labels[fit];
}

function getBlendDescription(primary: DISCStyle, secondary: DISCStyle): string {
  const blends: Record<string, string> = {
    'result-oriented_people-oriented': 'ترکیب قدرت و جذابیت - رهبر تأثیرگذار',
    'result-oriented_stable': 'ترکیب قدرت و ثبات - رهبر قابل‌اعتماد',
    'result-oriented_precise': 'ترکیب قدرت و دقت - استراتژیست دقیق',
    'people-oriented_result-oriented': 'ترکیب جذابیت و قدرت - مذاکره‌کننده قوی',
    'people-oriented_stable': 'ترکیب جذابیت و ثبات - ارتباط‌گر صبور',
    'people-oriented_precise': 'ترکیب جذابیت و دقت - متقاعدکننده تحلیلی',
    'stable_result-oriented': 'ترکیب ثبات و قدرت - مجری قابل‌اعتماد',
    'stable_people-oriented': 'ترکیب ثبات و جذابیت - همکار دوست‌داشتنی',
    'stable_precise': 'ترکیب ثبات و دقت - متخصص قابل‌اعتماد',
    'precise_result-oriented': 'ترکیب دقت و قدرت - تحلیلگر قاطع',
    'precise_people-oriented': 'ترکیب دقت و جذابیت - مشاور دقیق',
    'precise_stable': 'ترکیب دقت و ثبات - کارشناس پایدار',
  };
  return blends[`${primary}_${secondary}`] || 'ترکیب منحصربه‌فرد';
}

function getHollandBlendDescription(primary: HollandCareerFit, secondary: HollandCareerFit): string {
  // Simplified blend descriptions
  return `شما ترکیبی از علایق "${getCareerFitLabel(primary)}" و "${getCareerFitLabel(secondary)}" دارید که فرصت‌های شغلی متنوعی را پیش روی شما می‌گذارد.`;
}

// ============================================
// COMPACT EXPLANATION FOR PUBLIC PROFILE
// ============================================

export interface CompactExplanation {
  title: string;
  subtitle: string;
  highlights: string[];
  badge: string;
}

/**
 * Generate compact explanation for public profile display
 */
export function generateCompactDISCExplanation(result: DISCAssessmentResult): CompactExplanation {
  const info = DISC_DETAILED_INFO[result.primary];
  return {
    title: getStyleLabel(result.primary),
    subtitle: info.summary.split('.')[0] + '.',
    highlights: [info.teamStrength, info.careers[0]?.reason || ''].filter(Boolean),
    badge: 'DISC',
  };
}

export function generateCompactHollandExplanation(result: HollandAssessmentResult): CompactExplanation {
  const info = HOLLAND_DETAILED_INFO[result.primary];
  return {
    title: getCareerFitLabel(result.primary),
    subtitle: info.summary.split('.')[0] + '.',
    highlights: [info.teamStrength, info.careers[0]?.reason || ''].filter(Boolean),
    badge: 'Holland',
  };
}
