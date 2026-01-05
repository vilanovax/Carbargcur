# Backend Integration - Next Steps

This document outlines the steps to integrate the Liara PostgreSQL database and implement the backend for Karbarg.

## Current Status

✅ **Frontend Complete:**
- Complete skeleton with all pages
- Profile onboarding flow (5 steps)
- Client-side state management (localStorage)
- Mobile-first responsive UI
- Persian RTL support

✅ **Database Credentials:**
- Liara PostgreSQL 18.0 configured
- Connection details in `.env.local`
- Template in `.env.example`

## Phase 0-B: Backend Setup

### 1. Install Backend Dependencies

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
npm install bcrypt @types/bcrypt
npm install @aws-sdk/client-s3
npm install jose  # For JWT tokens
```

### 2. Setup Drizzle ORM

Create `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 3. Create Database Schema

Create `src/lib/db/schema.ts`:

```typescript
import { pgTable, uuid, varchar, text, boolean, timestamp, smallint, jsonb } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  mobile: varchar('mobile', { length: 11 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLogin: timestamp('last_login'),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }),
  experienceLevel: varchar('experience_level', { length: 50 }),
  jobStatus: varchar('job_status', { length: 50 }),
  professionalSummary: text('professional_summary'),
  profilePhotoUrl: text('profile_photo_url'),
  resumeUrl: text('resume_url'),
  isPublic: boolean('is_public').default(true),
  isActive: boolean('is_active').default(true),
  completionPercentage: smallint('completion_percentage').default(0),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Skills table
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameFa: varchar('name_fa', { length: 255 }).unique().notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').default(true),
});

// User skills (many-to-many)
export const userSkills = pgTable('user_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id).notNull(),
  skillId: uuid('skill_id').references(() => skills.id).notNull(),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }),
  yearsOfExperience: smallint('years_of_experience'),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastActivity: timestamp('last_activity').defaultNow(),
});
```

### 4. Setup Database Connection

Create `src/lib/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
```

### 5. Run Migrations

```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push
```

### 6. Seed Skills Database

Create `src/lib/db/seed.ts`:

```typescript
import { db } from './index';
import { skills } from './schema';

const FINANCE_SKILLS = [
  { nameFa: 'Excel پیشرفته', nameEn: 'Advanced Excel', category: 'software' },
  { nameFa: 'IFRS', nameEn: 'IFRS', category: 'accounting' },
  { nameFa: 'حسابداری صنعتی', nameEn: 'Cost Accounting', category: 'accounting' },
  { nameFa: 'تحلیل بنیادی', nameEn: 'Fundamental Analysis', category: 'analysis' },
  { nameFa: 'تحلیل تکنیکال', nameEn: 'Technical Analysis', category: 'analysis' },
  { nameFa: 'ارزش‌گذاری', nameEn: 'Valuation', category: 'analysis' },
  { nameFa: 'حسابرسی داخلی', nameEn: 'Internal Audit', category: 'audit' },
  { nameFa: 'حسابرسی مستقل', nameEn: 'Independent Audit', category: 'audit' },
  { nameFa: 'مدل‌سازی مالی', nameEn: 'Financial Modeling', category: 'analysis' },
  { nameFa: 'Power BI', nameEn: 'Power BI', category: 'software' },
  { nameFa: 'SQL', nameEn: 'SQL', category: 'software' },
  { nameFa: 'بودجه‌ریزی', nameEn: 'Budgeting', category: 'finance' },
  { nameFa: 'مدیریت ریسک', nameEn: 'Risk Management', category: 'finance' },
  { nameFa: 'بیمه عمر', nameEn: 'Life Insurance', category: 'insurance' },
  { nameFa: 'بیمه درمان', nameEn: 'Health Insurance', category: 'insurance' },
  { nameFa: 'تجزیه و تحلیل صورت‌های مالی', nameEn: 'Financial Statement Analysis', category: 'analysis' },
];

async function seed() {
  console.log('Seeding skills...');

  for (const skill of FINANCE_SKILLS) {
    await db.insert(skills).values(skill).onConflictDoNothing();
  }

  console.log('✅ Seeding complete!');
}

seed();
```

Run: `tsx src/lib/db/seed.ts`

## Phase 1: Authentication API

### Create API Routes

1. **`src/app/api/auth/signup/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { users, profiles } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { mobile, password, fullName } = await request.json();

    // Validate
    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.mobile, mobile),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'این شماره قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db.insert(users).values({
      mobile,
      passwordHash,
    }).returning();

    // Create profile with slug
    const slug = `${fullName.toLowerCase().replace(/\s+/g, '-')}-${nanoid(8)}`;

    await db.insert(profiles).values({
      userId: user.id,
      slug,
      fullName,
    });

    // TODO: Create session

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت‌نام' },
      { status: 500 }
    );
  }
}
```

2. **`src/app/api/auth/login/route.ts`**
3. **`src/app/api/auth/session/route.ts`**
4. **`src/app/api/auth/logout/route.ts`**

## Phase 2: Profile API

### Onboarding Endpoint

**`src/app/api/profile/onboarding/route.ts`**

```typescript
export async function POST(request: NextRequest) {
  // Get user from session
  // Update profile with onboarding data
  // Insert skills
  // Set onboardingCompleted = true
  // Clear localStorage on frontend
}
```

## Phase 3: Liara Object Storage

### Setup S3 Client

Create `src/lib/storage/client.ts`:

```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: 'us-east-1', // Liara uses this
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY!,
    secretAccessKey: process.env.LIARA_SECRET_KEY!,
  },
});

export const BUCKET_NAME = process.env.LIARA_BUCKET_NAME!;
```

## Testing Checklist

- [ ] Database connection works
- [ ] Migrations run successfully
- [ ] Skills seeded
- [ ] Signup creates user + profile
- [ ] Login returns session token
- [ ] Protected routes check auth
- [ ] Onboarding saves to DB
- [ ] Profile displays DB data
- [ ] File upload to Liara works

## Environment Variables Checklist

Make sure `.env.local` has:
- ✅ DATABASE_URL (provided)
- ⏳ LIARA_ACCESS_KEY (get from Liara dashboard)
- ⏳ LIARA_SECRET_KEY (get from Liara dashboard)
- ⏳ LIARA_BUCKET_NAME (create bucket first)
- ⏳ JWT_SECRET (generate: `openssl rand -base64 32`)

## Deployment to Liara

1. Create Liara app
2. Set environment variables
3. Deploy:
   ```bash
   liara deploy
   ```

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Liara PostgreSQL](https://docs.liara.ir/databases/postgresql/getting-started)
- [Liara Object Storage](https://docs.liara.ir/storage/object-storage/getting-started)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
