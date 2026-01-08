import { pgTable, uuid, varchar, text, boolean, timestamp, smallint, index, integer, real, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Users table - کاربران
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  mobile: varchar('mobile', { length: 11 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  isVerified: boolean('is_verified').default(false),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
}, (table) => [
  index('idx_users_created_at').on(table.createdAt),
  index('idx_users_is_admin').on(table.isAdmin),
]);

/**
 * Profiles table - پروفایل‌های کاربری
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 100 }),
  experienceLevel: varchar('experience_level', { length: 50 }), // junior, mid, senior
  jobStatus: varchar('job_status', { length: 50 }), // employed, seeking, freelancer
  currentPosition: varchar('current_position', { length: 255 }),
  yearsOfExperience: smallint('years_of_experience'),
  professionalSummary: text('professional_summary'),
  // JSON fields for resume data
  skills: text('skills'), // JSON array of skills
  experiences: text('experiences'), // JSON array of work experiences
  education: text('education'), // JSON object of education info
  // Assessment results
  discResult: varchar('disc_result', { length: 50 }),
  hollandResult: varchar('holland_result', { length: 50 }),
  // Profile media
  profilePhotoUrl: text('profile_photo_url'),
  resumeUrl: text('resume_url'),
  resumeFilename: varchar('resume_filename', { length: 255 }),
  resumeUploadedAt: timestamp('resume_uploaded_at'),
  // Public profile settings
  username: varchar('username', { length: 100 }),
  isPublic: boolean('is_public').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  completionPercentage: smallint('completion_percentage').default(0).notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_profiles_user_id').on(table.userId),
  index('idx_profiles_is_active_public').on(table.isActive, table.isPublic),
  index('idx_profiles_updated_at').on(table.updatedAt),
  index('idx_profiles_onboarding').on(table.onboardingCompleted),
]);

/**
 * Skills table - مهارت‌های از پیش تعریف شده
 */
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameFa: varchar('name_fa', { length: 255 }).unique().notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  category: varchar('category', { length: 100 }), // accounting, analysis, software, etc.
  isActive: boolean('is_active').default(true).notNull(),
});

/**
 * User skills (many-to-many) - مهارت‌های کاربران
 */
export const userSkills = pgTable('user_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  skillId: uuid('skill_id').references(() => skills.id, { onDelete: 'cascade' }).notNull(),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }), // beginner, intermediate, advanced, expert
  yearsOfExperience: smallint('years_of_experience'),
}, (table) => [
  index('idx_user_skills_profile_id').on(table.profileId),
  index('idx_user_skills_skill_id').on(table.skillId),
]);

/**
 * Sessions table - نشست‌ها
 */
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
}, (table) => [
  index('idx_sessions_user_id').on(table.userId),
  index('idx_sessions_expires_at').on(table.expiresAt),
]);

/**
 * User Settings table - تنظیمات کاربران
 */
export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  theme: varchar('theme', { length: 20 }).default('light').notNull(), // light, dark, system
  language: varchar('language', { length: 10 }).default('fa').notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Admin Settings table - تنظیمات سیستم (برای ادمین‌ها)
 */
export const adminSettings = pgTable('admin_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(), // e.g., 'openai_api_key'
  value: text('value'), // encrypted value
  description: text('description'),
  isEncrypted: boolean('is_encrypted').default(false).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Assessments table - نتایج آزمون‌های کاربران
 */
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'disc', 'holland'
  primaryResult: varchar('primary_result', { length: 50 }).notNull(), // e.g., 'result-oriented', 'analytical'
  secondaryResult: varchar('secondary_result', { length: 50 }),
  scores: text('scores'), // JSON string of detailed scores
  completedAt: timestamp('completed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_assessments_profile_id').on(table.profileId),
  index('idx_assessments_type').on(table.type),
  index('idx_assessments_completed_at').on(table.completedAt),
]);

/**
 * Jobs table - فرصت‌های شغلی
 */
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  description: text('description'),
  city: varchar('city', { length: 100 }),
  employmentType: varchar('employment_type', { length: 50 }), // 'full-time', 'part-time', 'contract', 'remote'
  experienceLevel: varchar('experience_level', { length: 50 }), // 'junior', 'mid', 'senior'
  minExperienceYears: smallint('min_experience_years'),
  maxExperienceYears: smallint('max_experience_years'),
  requiredSkills: text('required_skills'), // JSON array of skill names
  preferredSkills: text('preferred_skills'), // JSON array
  preferredBehavior: text('preferred_behavior'), // JSON: { primary: 'result-oriented', traits: [...] }
  preferredCareerFit: text('preferred_career_fit'), // JSON: { primary: 'analytical', ... }
  salaryMin: varchar('salary_min', { length: 50 }),
  salaryMax: varchar('salary_max', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, (table) => [
  index('idx_jobs_is_active').on(table.isActive),
  index('idx_jobs_created_at').on(table.createdAt),
  index('idx_jobs_experience_level').on(table.experienceLevel),
]);

/**
 * Job Applications table - درخواست‌های شغلی
 */
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  matchScore: smallint('match_score'), // 0-100
  status: varchar('status', { length: 50 }).default('pending').notNull(), // 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'
  coverLetter: text('cover_letter'),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_job_applications_job_id').on(table.jobId),
  index('idx_job_applications_profile_id').on(table.profileId),
  index('idx_job_applications_status').on(table.status),
]);

/**
 * Q&A Questions table - سؤالات تخصصی
 */
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // accounting, finance, tax, insurance, investment
  tags: text('tags'), // JSON array of tags
  answersCount: smallint('answers_count').default(0).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(), // Admin can hide
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_questions_author_id').on(table.authorId),
  index('idx_questions_category').on(table.category),
  index('idx_questions_created_at').on(table.createdAt),
  index('idx_questions_is_hidden').on(table.isHidden),
]);

/**
 * Q&A Answers table - پاسخ‌ها
 */
export const answers = pgTable('answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  body: text('body').notNull(),
  helpfulCount: smallint('helpful_count').default(0).notNull(),
  expertBadgeCount: smallint('expert_badge_count').default(0).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(), // Admin can hide
  // Answer Quality Engine fields
  isAccepted: boolean('is_accepted').default(false).notNull(), // پاسخ منتخب
  acceptedAt: timestamp('accepted_at'), // زمان انتخاب
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_answers_question_id').on(table.questionId),
  index('idx_answers_author_id').on(table.authorId),
  index('idx_answers_created_at').on(table.createdAt),
  index('idx_answers_is_accepted').on(table.isAccepted),
]);

/**
 * Q&A Answer Reactions table - واکنش به پاسخ‌ها
 */
export const answerReactions = pgTable('answer_reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  answerId: uuid('answer_id').references(() => answers.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'helpful' or 'expert'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_answer_reactions_answer_id').on(table.answerId),
  index('idx_answer_reactions_user_id').on(table.userId),
]);

/**
 * User Expertise Stats table - آمار تخصص کاربران (برای پروفایل)
 */
export const userExpertiseStats = pgTable('user_expertise_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  totalQuestions: smallint('total_questions').default(0).notNull(),
  totalAnswers: smallint('total_answers').default(0).notNull(),
  helpfulReactions: smallint('helpful_reactions').default(0).notNull(),
  expertReactions: smallint('expert_reactions').default(0).notNull(),
  featuredAnswers: smallint('featured_answers').default(0).notNull(), // Admin highlighted
  topCategory: varchar('top_category', { length: 50 }), // Most active category
  // Expert Level calculated from score
  expertScore: smallint('expert_score').default(0).notNull(),
  expertLevel: varchar('expert_level', { length: 50 }).default('newcomer').notNull(), // newcomer, contributor, specialist, senior, expert, top_expert
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_user_expertise_user_id').on(table.userId),
  index('idx_user_expertise_level').on(table.expertLevel),
]);

/**
 * Badges table - تعریف نشان‌ها
 */
export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(), // e.g., ACTIVE_RESPONDER, TAX_EXPERT
  titleFa: varchar('title_fa', { length: 100 }).notNull(), // عنوان فارسی
  titleEn: varchar('title_en', { length: 100 }), // عنوان انگلیسی
  description: text('description'), // توضیحات
  icon: varchar('icon', { length: 50 }), // نام آیکون یا emoji
  category: varchar('category', { length: 50 }).notNull(), // participation, quality, domain
  threshold: smallint('threshold'), // آستانه دریافت (اختیاری)
  isManual: boolean('is_manual').default(false).notNull(), // آیا فقط Admin می‌تواند بدهد
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_badges_category').on(table.category),
  index('idx_badges_code').on(table.code),
]);

/**
 * User Badges table - نشان‌های کاربران
 */
export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  badgeId: uuid('badge_id').references(() => badges.id, { onDelete: 'cascade' }).notNull(),
  source: varchar('source', { length: 20 }).default('system').notNull(), // system, admin
  awardedBy: uuid('awarded_by').references(() => users.id), // Admin who awarded (if manual)
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
}, (table) => [
  index('idx_user_badges_user_id').on(table.userId),
  index('idx_user_badges_badge_id').on(table.badgeId),
]);

/**
 * Domain Expertise table - تخصص در حوزه‌ها
 */
export const userDomainExpertise = pgTable('user_domain_expertise', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // accounting, finance, tax, insurance, investment
  totalAnswers: smallint('total_answers').default(0).notNull(),
  expertAnswers: smallint('expert_answers').default(0).notNull(), // پاسخ‌های با واکنش متخصصانه
  helpfulAnswers: smallint('helpful_answers').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_user_domain_user_id').on(table.userId),
  index('idx_user_domain_category').on(table.category),
]);

/**
 * Q&A Categories table - دسته‌بندی‌های پرسش و پاسخ (قابل مدیریت توسط ادمین)
 */
export const qaCategories = pgTable('qa_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(), // accounting, finance, etc.
  nameFa: varchar('name_fa', { length: 100 }).notNull(), // حسابداری
  nameEn: varchar('name_en', { length: 100 }), // Accounting
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // emoji or icon name
  sortOrder: smallint('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_qa_categories_code').on(table.code),
  index('idx_qa_categories_is_active').on(table.isActive),
]);

/**
 * Q&A Settings table - تنظیمات سیستم پرسش و پاسخ
 */
export const qaSettings = pgTable('qa_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(), // qa_enabled, daily_question_limit, etc.
  value: text('value').notNull(), // true, 5, etc.
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * AI Expert Summary table - خلاصه هوشمند تخصص کاربر
 */
export const userExpertSummary = pgTable('user_expert_summary', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  summaryText: text('summary_text'), // متن خلاصه فارسی
  keySignals: text('key_signals'), // JSON array of signals
  styleTags: text('style_tags'), // JSON array: ["تحلیلی", "ساختاریافته"]
  confidenceLevel: varchar('confidence_level', { length: 20 }), // low, medium, high
  mainDomains: text('main_domains'), // JSON array of main expertise domains
  answersAnalyzed: smallint('answers_analyzed').default(0).notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  generatedBy: varchar('generated_by', { length: 50 }).default('system').notNull(), // system, admin
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_user_expert_summary_user_id').on(table.userId),
]);

/**
 * Answer Flags table - گزارش پاسخ‌های نامناسب
 */
export const answerFlags = pgTable('answer_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  answerId: uuid('answer_id').references(() => answers.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reason: varchar('reason', { length: 50 }).notNull(), // SPAM, ABUSE, MISLEADING, LOW_QUALITY, OTHER
  note: text('note'), // توضیحات اضافی
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_answer_flags_answer_id').on(table.answerId),
  index('idx_answer_flags_user_id').on(table.userId),
  uniqueIndex('idx_answer_flags_unique').on(table.answerId, table.userId),
]);

/**
 * Answer Quality Metrics table - معیارهای کیفیت پاسخ
 */
export const answerQualityMetrics = pgTable('answer_quality_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  answerId: uuid('answer_id').references(() => answers.id, { onDelete: 'cascade' }).unique().notNull(),
  // Score components (0-100)
  contentScore: smallint('content_score').default(0).notNull(),
  engagementScore: smallint('engagement_score').default(0).notNull(),
  expertScore: smallint('expert_score').default(0).notNull(),
  trustScore: smallint('trust_score').default(0).notNull(),
  // Multiplier based on author profile strength
  expertMultiplier: real('expert_multiplier').default(1.0).notNull(),
  // Final AQS (0-100)
  aqs: smallint('aqs').default(0).notNull(),
  // Quality label: NORMAL, USEFUL, PRO, STAR
  label: varchar('label', { length: 20 }).default('NORMAL').notNull(),
  // Detailed breakdown for debugging
  details: jsonb('details'),
  computedAt: timestamp('computed_at').defaultNow().notNull(),
}, (table) => [
  index('idx_aqm_answer_id').on(table.answerId),
  index('idx_aqm_aqs').on(table.aqs),
  index('idx_aqm_label').on(table.label),
]);

/**
 * Profile Strength Snapshot table - اسنپ‌شات قدرت پروفایل
 */
export const profileStrengthSnapshot = pgTable('profile_strength_snapshot', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  strength: smallint('strength').default(0).notNull(), // 0-100
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_pss_user_id').on(table.userId),
]);

/**
 * Question Engagement table - آمار تعامل با سؤال
 */
export const questionEngagement = pgTable('question_engagement', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).unique().notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_qe_question_id').on(table.questionId),
]);

/**
 * Microcopy Definitions table - تعریف Microcopyها
 * جدول اصلی برای مدیریت متون و تنظیمات
 */
export const microcopyDefinitions = pgTable('microcopy_definitions', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g., FIRST_ANSWER_CTA
  triggerRule: varchar('trigger_rule', { length: 50 }).notNull(), // e.g., RULE_001
  textFa: text('text_fa').notNull(), // متن فارسی
  targetSegment: varchar('target_segment', { length: 50 }).default('all').notNull(), // all, new, junior, senior
  priority: smallint('priority').default(50).notNull(), // 0-100
  cooldownHours: smallint('cooldown_hours').default(24).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_mcd_trigger_rule').on(table.triggerRule),
  index('idx_mcd_is_enabled').on(table.isEnabled),
]);

/**
 * Microcopy Events table - رویدادهای Microcopy
 * ثبت هر بار نمایش یا تعامل با Microcopy
 */
export const microcopyEvents = pgTable('microcopy_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  microcopyId: varchar('microcopy_id', { length: 50 }).notNull(),
  triggerRuleId: varchar('trigger_rule_id', { length: 50 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  // نوع رویداد
  eventType: varchar('event_type', { length: 20 }).notNull(), // shown, clicked, dismissed
  // Context
  pageUrl: varchar('page_url', { length: 255 }),
  questionId: uuid('question_id'),
  // User segment at the time of event
  userSegment: varchar('user_segment', { length: 20 }), // new, junior, senior
  userAnswerCount: smallint('user_answer_count').default(0),
  // Metadata
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_mce_microcopy_id').on(table.microcopyId),
  index('idx_mce_user_id').on(table.userId),
  index('idx_mce_event_type').on(table.eventType),
  index('idx_mce_created_at').on(table.createdAt),
  index('idx_mce_user_segment').on(table.userSegment),
]);

/**
 * Microcopy Actions table - اقدامات بعد از Microcopy
 * ارتباط بین نمایش Microcopy و اقدام کاربر
 */
export const microcopyActions = pgTable('microcopy_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  microcopyEventId: uuid('microcopy_event_id').references(() => microcopyEvents.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  // نوع اقدام
  actionType: varchar('action_type', { length: 30 }).notNull(), // answer_created, question_created, profile_viewed
  // Reference to created content
  answerId: uuid('answer_id'),
  questionId: uuid('question_id'),
  // Reputation impact
  reputationDelta: smallint('reputation_delta').default(0),
  // Time between microcopy shown and action
  timeToActionMs: integer('time_to_action_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_mca_microcopy_event_id').on(table.microcopyEventId),
  index('idx_mca_user_id').on(table.userId),
  index('idx_mca_action_type').on(table.actionType),
  index('idx_mca_created_at').on(table.createdAt),
]);

/**
 * User Microcopy Cooldowns table - محدودیت زمانی نمایش به هر کاربر
 * جلوگیری از نمایش تکراری Microcopy
 */
export const userMicrocopyCooldowns = pgTable('user_microcopy_cooldowns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  microcopyId: varchar('microcopy_id', { length: 50 }).notNull(),
  lastShownAt: timestamp('last_shown_at').defaultNow().notNull(),
  showCount: integer('show_count').default(1).notNull(),
}, (table) => [
  uniqueIndex('idx_umc_user_microcopy').on(table.userId, table.microcopyId),
]);

/**
 * Notifications table - نوتیفیکیشن‌ها
 * اعلان‌های کاربران برای رویدادهای مختلف
 */
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  // نوع نوتیفیکیشن
  type: varchar('type', { length: 50 }).notNull(),
  // qa_answer, qa_accepted, qa_reaction, badge_earned, profile_viewed, job_match, system
  // عنوان و متن
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  // آیکون (اختیاری)
  icon: varchar('icon', { length: 50 }),
  // لینک مقصد هنگام کلیک
  actionUrl: varchar('action_url', { length: 500 }),
  // ارجاع به موجودیت مرتبط
  relatedType: varchar('related_type', { length: 50 }), // question, answer, job, badge, profile
  relatedId: uuid('related_id'),
  // وضعیت خوانده شدن
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  // Metadata اضافی
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_notifications_user_id').on(table.userId),
  index('idx_notifications_is_read').on(table.isRead),
  index('idx_notifications_type').on(table.type),
  index('idx_notifications_created_at').on(table.createdAt),
  index('idx_notifications_user_unread').on(table.userId, table.isRead),
]);

/**
 * Question Bookmarks table - نشان‌گذاری سؤالات
 * ذخیره سؤالات مورد علاقه کاربران
 */
export const questionBookmarks = pgTable('question_bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_bookmarks_user_id').on(table.userId),
  index('idx_bookmarks_question_id').on(table.questionId),
  index('idx_bookmarks_created_at').on(table.createdAt),
  uniqueIndex('idx_bookmarks_user_question').on(table.userId, table.questionId),
]);
