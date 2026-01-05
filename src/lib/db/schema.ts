import { pgTable, uuid, varchar, text, boolean, timestamp, smallint } from 'drizzle-orm/pg-core';

/**
 * Users table - کاربران
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  mobile: varchar('mobile', { length: 11 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

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
});

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
});

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
});

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
