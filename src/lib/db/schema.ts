import { pgTable, uuid, varchar, text, boolean, timestamp, smallint, index } from 'drizzle-orm/pg-core';

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
  city: varchar('city', { length: 100 }),
  experienceLevel: varchar('experience_level', { length: 50 }), // junior, mid, senior
  jobStatus: varchar('job_status', { length: 50 }), // employed, seeking, freelancer
  professionalSummary: text('professional_summary'),
  profilePhotoUrl: text('profile_photo_url'),
  resumeUrl: text('resume_url'),
  resumeFilename: varchar('resume_filename', { length: 255 }),
  resumeUploadedAt: timestamp('resume_uploaded_at'),
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
