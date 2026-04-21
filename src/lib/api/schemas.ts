import { z } from "zod";

const trimmedString = (max: number) =>
  z.string().trim().min(1).max(max);

export const registerSchema = z.object({
  mobile: z.string().trim().min(1).max(20),
  password: z.string().min(6).max(128),
  fullName: trimmedString(120),
});

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const jobCreateSchema = z.object({
  title: trimmedString(255),
  company: z.string().trim().max(255).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  employmentType: z.string().trim().max(50).optional().nullable(),
  experienceLevel: z.string().trim().max(50).optional().nullable(),
  minExperienceYears: z.coerce.number().int().min(0).max(60).optional().nullable(),
  maxExperienceYears: z.coerce.number().int().min(0).max(60).optional().nullable(),
  requiredSkills: z.array(z.string().trim().max(100)).max(50).optional().nullable(),
  preferredSkills: z.array(z.string().trim().max(100)).max(50).optional().nullable(),
  preferredBehavior: z.record(z.string(), z.unknown()).optional().nullable(),
  preferredCareerFit: z.record(z.string(), z.unknown()).optional().nullable(),
  salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const jobUpdateSchema = jobCreateSchema.partial();

export const questionCreateSchema = z.object({
  title: trimmedString(300),
  body: trimmedString(20000),
  category: z.string().trim().max(50),
  tags: z.array(z.string().trim().max(40)).max(10).optional().default([]),
});

export const questionUpdateSchema = questionCreateSchema.partial();

export const answerCreateSchema = z.object({
  body: trimmedString(20000),
});

export const answerUpdateSchema = answerCreateSchema.partial();

export const bookmarkCreateSchema = z.object({
  questionId: z.string().uuid(),
});
