# 🗄️ Database Schema - Career Paths System

**تاریخ ایجاد:** 2026-01-19
**نسخه:** 1.0.0
**Database:** PostgreSQL 14+
**ORM:** Drizzle ORM

---

## 📋 فهرست مطالب

1. [معرفی کلی](#معرفی-کلی)
2. [جداول اصلی](#جداول-اصلی)
3. [Drizzle Schema](#drizzle-schema)
4. [SQL Migration Scripts](#sql-migration-scripts)
5. [Indexes](#indexes)
6. [Relations](#relations)
7. [Sample Data](#sample-data)
8. [Backup & Restore](#backup--restore)

---

## معرفی کلی

### 🎯 هدف
ایجاد ساختار دیتابیس کامل برای سیستم مسیرهای شغلی که شامل:
- ذخیره پیشرفت کاربران
- مدیریت Microcopy و A/B Testing
- ردیابی Performance و Analytics
- پشتیبانی از Gamification

### 📊 نمودار ER (Diagram)

```
users (existing)
  ↓
user_career_paths ──→ career_paths
  ↓
user_level_progress ──→ career_levels
  ↓
user_task_completions ──→ level_tasks
                            ↓
                     task_microcopy_versions
                            ↓
                     ab_test_assignments
                     ab_test_results
```

---

## جداول اصلی

### 1. `career_paths`
ذخیره اطلاعات مسیرهای شغلی

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `slug` | VARCHAR(100) | URL-friendly identifier (unique) |
| `title` | VARCHAR(200) | عنوان مسیر |
| `subtitle` | VARCHAR(300) | زیرعنوان |
| `description` | TEXT | توضیحات کامل |
| `icon` | VARCHAR(50) | نام آیکون Lucide |
| `color` | VARCHAR(20) | رنگ Tailwind |
| `target_audience` | VARCHAR(20) | beginner/intermediate/advanced/all |
| `estimated_months` | INTEGER | مدت تخمینی به ماه |
| `is_active` | BOOLEAN | فعال/غیرفعال |
| `display_order` | INTEGER | ترتیب نمایش |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_career_paths_slug` (UNIQUE)
- `idx_career_paths_active_order` (is_active, display_order)

---

### 2. `career_path_steps`
سطوح/مراحل هر مسیر

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `path_id` | UUID | Foreign Key → career_paths |
| `step_number` | INTEGER | شماره مرحله (0-based) |
| `title` | VARCHAR(200) | عنوان مرحله |
| `description` | TEXT | توضیحات |
| `icon` | VARCHAR(50) | نام آیکون |
| `estimated_weeks` | INTEGER | مدت تخمینی به هفته |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_path_steps_path_id` (path_id)
- `idx_path_steps_path_number` (path_id, step_number) UNIQUE

---

### 3. `career_levels`
سطوح جزئی هر Step (با Task)

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | VARCHAR(50) | Primary Key (e.g., "acc-level-1") |
| `path_id` | UUID | Foreign Key → career_paths |
| `step_id` | UUID | Foreign Key → career_path_steps |
| `level_number` | INTEGER | شماره سطح |
| `title` | VARCHAR(200) | عنوان سطح |
| `goal` | TEXT | هدف این سطح |
| `reputation_reward` | INTEGER | پاداش Rep |
| `badge_reward` | VARCHAR(50) | نام Badge (nullable) |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_levels_path_id` (path_id)
- `idx_levels_step_id` (step_id)

---

### 4. `level_tasks`
Taskهای هر Level

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | VARCHAR(50) | Primary Key (e.g., "acc-1-1") |
| `level_id` | VARCHAR(50) | Foreign Key → career_levels |
| `task_order` | INTEGER | ترتیب نمایش |
| `task_type` | VARCHAR(20) | answer/vote/profile/case |
| `action_url` | TEXT | URL هدف (nullable) |
| `validation_rule` | JSONB | قوانین Validation |
| `reputation_reward` | INTEGER | پاداش Rep |
| `is_active` | BOOLEAN | فعال/غیرفعال |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_tasks_level_id` (level_id)
- `idx_tasks_level_order` (level_id, task_order)
- `idx_tasks_type` (task_type)

---

### 5. `task_microcopy_versions`
متن‌های فارسی هر Task (با A/B Testing)

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `task_id` | VARCHAR(50) | Foreign Key → level_tasks |
| `version` | CHAR(1) | 'A' or 'B' |
| `title` | VARCHAR(200) | عنوان Task |
| `description` | TEXT | توضیحات |
| `helper` | TEXT | Helper/Hint |
| `cta_text` | VARCHAR(100) | متن دکمه |
| `cta_icon` | VARCHAR(50) | آیکون دکمه |
| `pending_message` | VARCHAR(200) | پیام Pending |
| `completed_message` | VARCHAR(200) | پیام Completed |
| `toast_message` | VARCHAR(200) | پیام Toast |
| `toast_reward` | VARCHAR(100) | پاداش Toast |
| `is_active` | BOOLEAN | فعال/غیرفعال برای A/B Test |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_microcopy_task_id` (task_id)
- `idx_microcopy_task_version` (task_id, version) UNIQUE

---

### 6. `user_career_paths`
پیشرفت کاربران در مسیرها

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → users |
| `path_id` | UUID | Foreign Key → career_paths |
| `current_step` | INTEGER | شماره Step فعلی |
| `started_at` | TIMESTAMP | زمان شروع |
| `last_activity_at` | TIMESTAMP | آخرین فعالیت |
| `completed_at` | TIMESTAMP | زمان تکمیل (nullable) |
| `total_reputation_earned` | INTEGER | مجموع Rep کسب شده |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_user_paths_user_id` (user_id)
- `idx_user_paths_user_path` (user_id, path_id) UNIQUE
- `idx_user_paths_active` (user_id, completed_at) WHERE completed_at IS NULL

---

### 7. `user_level_progress`
پیشرفت کاربران در Levelها

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → users |
| `level_id` | VARCHAR(50) | Foreign Key → career_levels |
| `user_path_id` | UUID | Foreign Key → user_career_paths |
| `started_at` | TIMESTAMP | زمان شروع |
| `completed_at` | TIMESTAMP | زمان تکمیل (nullable) |
| `total_tasks` | INTEGER | تعداد کل Taskها |
| `completed_tasks` | INTEGER | تعداد Taskهای تکمیل شده |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_user_level_user_id` (user_id)
- `idx_user_level_user_level` (user_id, level_id) UNIQUE
- `idx_user_level_path_id` (user_path_id)

---

### 8. `user_task_completions`
تکمیل Taskها توسط کاربران

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → users |
| `task_id` | VARCHAR(50) | Foreign Key → level_tasks |
| `level_progress_id` | UUID | Foreign Key → user_level_progress |
| `microcopy_version` | CHAR(1) | نسخه‌ای که کاربر دید (A/B) |
| `started_at` | TIMESTAMP | زمان شروع Task |
| `completed_at` | TIMESTAMP | زمان تکمیل |
| `time_spent_seconds` | INTEGER | مدت زمان صرف شده |
| `reputation_earned` | INTEGER | Rep کسب شده |
| `created_at` | TIMESTAMP | زمان ایجاد |

**Indexes:**
- `idx_user_task_user_id` (user_id)
- `idx_user_task_user_task` (user_id, task_id) UNIQUE
- `idx_user_task_level_progress` (level_progress_id)
- `idx_user_task_completed_at` (completed_at)

---

### 9. `ab_test_assignments`
تخصیص کاربران به نسخه A یا B

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → users |
| `task_id` | VARCHAR(50) | Foreign Key → level_tasks |
| `assigned_version` | CHAR(1) | 'A' or 'B' |
| `assigned_at` | TIMESTAMP | زمان تخصیص |

**Indexes:**
- `idx_ab_test_user_task` (user_id, task_id) UNIQUE
- `idx_ab_test_task_id` (task_id)

---

### 10. `ab_test_results`
نتایج Performance A/B Testing

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `task_id` | VARCHAR(50) | Foreign Key → level_tasks |
| `version` | CHAR(1) | 'A' or 'B' |
| `test_start_date` | DATE | شروع تست |
| `test_end_date` | DATE | پایان تست (nullable) |
| `total_views` | INTEGER | تعداد بازدید |
| `total_starts` | INTEGER | تعداد شروع |
| `total_completions` | INTEGER | تعداد تکمیل |
| `avg_time_seconds` | INTEGER | میانگین زمان |
| `drop_off_rate` | DECIMAL(5,2) | نرخ Drop-off |
| `completion_rate` | DECIMAL(5,2) | نرخ تکمیل |
| `created_at` | TIMESTAMP | زمان ایجاد |
| `updated_at` | TIMESTAMP | آخرین بروزرسانی |

**Indexes:**
- `idx_ab_results_task_version` (task_id, version) UNIQUE
- `idx_ab_results_active_tests` (test_end_date) WHERE test_end_date IS NULL

---

### 11. `task_performance_stats`
آمار Performance کلی هر Task

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | UUID | Primary Key |
| `task_id` | VARCHAR(50) | Foreign Key → level_tasks |
| `period_start` | DATE | شروع دوره |
| `period_end` | DATE | پایان دوره |
| `total_views` | INTEGER | تعداد بازدید |
| `total_started` | INTEGER | تعداد شروع |
| `total_completed` | INTEGER | تعداد تکمیل |
| `avg_completion_time_seconds` | INTEGER | میانگین زمان تکمیل |
| `completion_rate` | DECIMAL(5,2) | نرخ تکمیل |
| `drop_off_after_view` | DECIMAL(5,2) | Drop-off بعد از View |
| `drop_off_after_start` | DECIMAL(5,2) | Drop-off بعد از Start |
| `created_at` | TIMESTAMP | زمان ایجاد |

**Indexes:**
- `idx_task_stats_task_period` (task_id, period_start, period_end)
- `idx_task_stats_completion_rate` (completion_rate)

---

## Drizzle Schema

### 📁 فایل: `src/db/schema/career-paths.ts`

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, decimal, char, jsonb, date, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

// 1. Career Paths
export const careerPaths = pgTable(
  "career_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: varchar("subtitle", { length: 300 }),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 50 }).notNull(),
    color: varchar("color", { length: 20 }).notNull(),
    targetAudience: varchar("target_audience", { length: 20 }).notNull(), // beginner/intermediate/advanced/all
    estimatedMonths: integer("estimated_months").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("idx_career_paths_slug").on(table.slug),
    activeOrderIdx: index("idx_career_paths_active_order").on(table.isActive, table.displayOrder),
  })
);

// 2. Career Path Steps
export const careerPathSteps = pgTable(
  "career_path_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pathId: uuid("path_id").notNull().references(() => careerPaths.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 50 }).notNull(),
    estimatedWeeks: integer("estimated_weeks").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pathIdIdx: index("idx_path_steps_path_id").on(table.pathId),
    pathNumberIdx: uniqueIndex("idx_path_steps_path_number").on(table.pathId, table.stepNumber),
  })
);

// 3. Career Levels
export const careerLevels = pgTable(
  "career_levels",
  {
    id: varchar("id", { length: 50 }).primaryKey(), // e.g., "acc-level-1"
    pathId: uuid("path_id").notNull().references(() => careerPaths.id, { onDelete: "cascade" }),
    stepId: uuid("step_id").notNull().references(() => careerPathSteps.id, { onDelete: "cascade" }),
    levelNumber: integer("level_number").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    goal: text("goal").notNull(),
    reputationReward: integer("reputation_reward").notNull().default(0),
    badgeReward: varchar("badge_reward", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pathIdIdx: index("idx_levels_path_id").on(table.pathId),
    stepIdIdx: index("idx_levels_step_id").on(table.stepId),
  })
);

// 4. Level Tasks
export const levelTasks = pgTable(
  "level_tasks",
  {
    id: varchar("id", { length: 50 }).primaryKey(), // e.g., "acc-1-1"
    levelId: varchar("level_id", { length: 50 }).notNull().references(() => careerLevels.id, { onDelete: "cascade" }),
    taskOrder: integer("task_order").notNull(),
    taskType: varchar("task_type", { length: 20 }).notNull(), // answer/vote/profile/case
    actionUrl: text("action_url"),
    validationRule: jsonb("validation_rule"), // { type: "answer_count", minCount: 1, category: "accounting" }
    reputationReward: integer("reputation_reward").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    levelIdIdx: index("idx_tasks_level_id").on(table.levelId),
    levelOrderIdx: index("idx_tasks_level_order").on(table.levelId, table.taskOrder),
    typeIdx: index("idx_tasks_type").on(table.taskType),
  })
);

// 5. Task Microcopy Versions
export const taskMicrocopyVersions = pgTable(
  "task_microcopy_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: varchar("task_id", { length: 50 }).notNull().references(() => levelTasks.id, { onDelete: "cascade" }),
    version: char("version", { length: 1 }).notNull(), // 'A' or 'B'
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    helper: text("helper"),
    ctaText: varchar("cta_text", { length: 100 }).notNull(),
    ctaIcon: varchar("cta_icon", { length: 50 }).notNull(),
    pendingMessage: varchar("pending_message", { length: 200 }),
    completedMessage: varchar("completed_message", { length: 200 }),
    toastMessage: varchar("toast_message", { length: 200 }),
    toastReward: varchar("toast_reward", { length: 100 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    taskIdIdx: index("idx_microcopy_task_id").on(table.taskId),
    taskVersionIdx: uniqueIndex("idx_microcopy_task_version").on(table.taskId, table.version),
  })
);

// 6. User Career Paths
export const userCareerPaths = pgTable(
  "user_career_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    pathId: uuid("path_id").notNull().references(() => careerPaths.id, { onDelete: "cascade" }),
    currentStep: integer("current_step").notNull().default(0),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    totalReputationEarned: integer("total_reputation_earned").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_user_paths_user_id").on(table.userId),
    userPathIdx: uniqueIndex("idx_user_paths_user_path").on(table.userId, table.pathId),
  })
);

// 7. User Level Progress
export const userLevelProgress = pgTable(
  "user_level_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    levelId: varchar("level_id", { length: 50 }).notNull().references(() => careerLevels.id, { onDelete: "cascade" }),
    userPathId: uuid("user_path_id").notNull().references(() => userCareerPaths.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    totalTasks: integer("total_tasks").notNull(),
    completedTasks: integer("completed_tasks").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_user_level_user_id").on(table.userId),
    userLevelIdx: uniqueIndex("idx_user_level_user_level").on(table.userId, table.levelId),
    pathIdIdx: index("idx_user_level_path_id").on(table.userPathId),
  })
);

// 8. User Task Completions
export const userTaskCompletions = pgTable(
  "user_task_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskId: varchar("task_id", { length: 50 }).notNull().references(() => levelTasks.id, { onDelete: "cascade" }),
    levelProgressId: uuid("level_progress_id").notNull().references(() => userLevelProgress.id, { onDelete: "cascade" }),
    microcopyVersion: char("microcopy_version", { length: 1 }).notNull(),
    startedAt: timestamp("started_at").notNull(),
    completedAt: timestamp("completed_at").notNull(),
    timeSpentSeconds: integer("time_spent_seconds").notNull(),
    reputationEarned: integer("reputation_earned").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_user_task_user_id").on(table.userId),
    userTaskIdx: uniqueIndex("idx_user_task_user_task").on(table.userId, table.taskId),
    levelProgressIdx: index("idx_user_task_level_progress").on(table.levelProgressId),
    completedAtIdx: index("idx_user_task_completed_at").on(table.completedAt),
  })
);

// 9. A/B Test Assignments
export const abTestAssignments = pgTable(
  "ab_test_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskId: varchar("task_id", { length: 50 }).notNull().references(() => levelTasks.id, { onDelete: "cascade" }),
    assignedVersion: char("assigned_version", { length: 1 }).notNull(), // 'A' or 'B'
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => ({
    userTaskIdx: uniqueIndex("idx_ab_test_user_task").on(table.userId, table.taskId),
    taskIdIdx: index("idx_ab_test_task_id").on(table.taskId),
  })
);

// 10. A/B Test Results
export const abTestResults = pgTable(
  "ab_test_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: varchar("task_id", { length: 50 }).notNull().references(() => levelTasks.id, { onDelete: "cascade" }),
    version: char("version", { length: 1 }).notNull(), // 'A' or 'B'
    testStartDate: date("test_start_date").notNull(),
    testEndDate: date("test_end_date"),
    totalViews: integer("total_views").notNull().default(0),
    totalStarts: integer("total_starts").notNull().default(0),
    totalCompletions: integer("total_completions").notNull().default(0),
    avgTimeSeconds: integer("avg_time_seconds").notNull().default(0),
    dropOffRate: decimal("drop_off_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    taskVersionIdx: uniqueIndex("idx_ab_results_task_version").on(table.taskId, table.version),
  })
);

// 11. Task Performance Stats
export const taskPerformanceStats = pgTable(
  "task_performance_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: varchar("task_id", { length: 50 }).notNull().references(() => levelTasks.id, { onDelete: "cascade" }),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    totalViews: integer("total_views").notNull().default(0),
    totalStarted: integer("total_started").notNull().default(0),
    totalCompleted: integer("total_completed").notNull().default(0),
    avgCompletionTimeSeconds: integer("avg_completion_time_seconds").notNull().default(0),
    completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    dropOffAfterView: decimal("drop_off_after_view", { precision: 5, scale: 2 }).notNull().default("0"),
    dropOffAfterStart: decimal("drop_off_after_start", { precision: 5, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    taskPeriodIdx: index("idx_task_stats_task_period").on(table.taskId, table.periodStart, table.periodEnd),
    completionRateIdx: index("idx_task_stats_completion_rate").on(table.completionRate),
  })
);
```

---

## SQL Migration Scripts

### 📁 فایل: `migrations/001_create_career_paths_tables.sql`

```sql
-- Migration: Create Career Paths System Tables
-- Version: 1.0.0
-- Date: 2026-01-19

BEGIN;

-- 1. Career Paths
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300),
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('beginner', 'intermediate', 'advanced', 'all')),
    estimated_months INTEGER NOT NULL CHECK (estimated_months > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_career_paths_slug ON career_paths(slug);
CREATE INDEX idx_career_paths_active_order ON career_paths(is_active, display_order);

COMMENT ON TABLE career_paths IS 'مسیرهای شغلی (Career Paths)';
COMMENT ON COLUMN career_paths.target_audience IS 'beginner, intermediate, advanced, all';

-- 2. Career Path Steps
CREATE TABLE IF NOT EXISTS career_path_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL CHECK (step_number >= 0),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    estimated_weeks INTEGER NOT NULL CHECK (estimated_weeks > 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_path_steps_path_id ON career_path_steps(path_id);
CREATE UNIQUE INDEX idx_path_steps_path_number ON career_path_steps(path_id, step_number);

COMMENT ON TABLE career_path_steps IS 'مراحل/سطوح هر مسیر شغلی';

-- 3. Career Levels
CREATE TABLE IF NOT EXISTS career_levels (
    id VARCHAR(50) PRIMARY KEY,
    path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES career_path_steps(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL CHECK (level_number >= 0),
    title VARCHAR(200) NOT NULL,
    goal TEXT NOT NULL,
    reputation_reward INTEGER NOT NULL DEFAULT 0 CHECK (reputation_reward >= 0),
    badge_reward VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_levels_path_id ON career_levels(path_id);
CREATE INDEX idx_levels_step_id ON career_levels(step_id);

COMMENT ON TABLE career_levels IS 'سطوح جزئی با Taskها';
COMMENT ON COLUMN career_levels.id IS 'e.g., acc-level-1';

-- 4. Level Tasks
CREATE TABLE IF NOT EXISTS level_tasks (
    id VARCHAR(50) PRIMARY KEY,
    level_id VARCHAR(50) NOT NULL REFERENCES career_levels(id) ON DELETE CASCADE,
    task_order INTEGER NOT NULL CHECK (task_order >= 0),
    task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('answer', 'vote', 'profile', 'case')),
    action_url TEXT,
    validation_rule JSONB,
    reputation_reward INTEGER NOT NULL DEFAULT 0 CHECK (reputation_reward >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_level_id ON level_tasks(level_id);
CREATE INDEX idx_tasks_level_order ON level_tasks(level_id, task_order);
CREATE INDEX idx_tasks_type ON level_tasks(task_type);

COMMENT ON TABLE level_tasks IS 'Taskهای هر Level';
COMMENT ON COLUMN level_tasks.task_type IS 'answer, vote, profile, case';
COMMENT ON COLUMN level_tasks.validation_rule IS 'JSON: { type: "answer_count", minCount: 1, category: "accounting" }';

-- 5. Task Microcopy Versions
CREATE TABLE IF NOT EXISTS task_microcopy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) NOT NULL REFERENCES level_tasks(id) ON DELETE CASCADE,
    version CHAR(1) NOT NULL CHECK (version IN ('A', 'B')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    helper TEXT,
    cta_text VARCHAR(100) NOT NULL,
    cta_icon VARCHAR(50) NOT NULL,
    pending_message VARCHAR(200),
    completed_message VARCHAR(200),
    toast_message VARCHAR(200),
    toast_reward VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_microcopy_task_id ON task_microcopy_versions(task_id);
CREATE UNIQUE INDEX idx_microcopy_task_version ON task_microcopy_versions(task_id, version);

COMMENT ON TABLE task_microcopy_versions IS 'متن‌های فارسی با A/B Testing';
COMMENT ON COLUMN task_microcopy_versions.version IS 'A or B';

-- 6. User Career Paths
CREATE TABLE IF NOT EXISTS user_career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_reputation_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_reputation_earned >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_paths_user_id ON user_career_paths(user_id);
CREATE UNIQUE INDEX idx_user_paths_user_path ON user_career_paths(user_id, path_id);

COMMENT ON TABLE user_career_paths IS 'پیشرفت کاربران در مسیرها';

-- 7. User Level Progress
CREATE TABLE IF NOT EXISTS user_level_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id VARCHAR(50) NOT NULL REFERENCES career_levels(id) ON DELETE CASCADE,
    user_path_id UUID NOT NULL REFERENCES user_career_paths(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_tasks INTEGER NOT NULL CHECK (total_tasks >= 0),
    completed_tasks INTEGER NOT NULL DEFAULT 0 CHECK (completed_tasks >= 0 AND completed_tasks <= total_tasks),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_level_user_id ON user_level_progress(user_id);
CREATE UNIQUE INDEX idx_user_level_user_level ON user_level_progress(user_id, level_id);
CREATE INDEX idx_user_level_path_id ON user_level_progress(user_path_id);

COMMENT ON TABLE user_level_progress IS 'پیشرفت کاربران در Levelها';

-- 8. User Task Completions
CREATE TABLE IF NOT EXISTS user_task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(50) NOT NULL REFERENCES level_tasks(id) ON DELETE CASCADE,
    level_progress_id UUID NOT NULL REFERENCES user_level_progress(id) ON DELETE CASCADE,
    microcopy_version CHAR(1) NOT NULL CHECK (microcopy_version IN ('A', 'B')),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    time_spent_seconds INTEGER NOT NULL CHECK (time_spent_seconds >= 0),
    reputation_earned INTEGER NOT NULL CHECK (reputation_earned >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_task_user_id ON user_task_completions(user_id);
CREATE UNIQUE INDEX idx_user_task_user_task ON user_task_completions(user_id, task_id);
CREATE INDEX idx_user_task_level_progress ON user_task_completions(level_progress_id);
CREATE INDEX idx_user_task_completed_at ON user_task_completions(completed_at);

COMMENT ON TABLE user_task_completions IS 'تکمیل Taskها توسط کاربران';

-- 9. A/B Test Assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(50) NOT NULL REFERENCES level_tasks(id) ON DELETE CASCADE,
    assigned_version CHAR(1) NOT NULL CHECK (assigned_version IN ('A', 'B')),
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ab_test_user_task ON ab_test_assignments(user_id, task_id);
CREATE INDEX idx_ab_test_task_id ON ab_test_assignments(task_id);

COMMENT ON TABLE ab_test_assignments IS 'تخصیص کاربران به نسخه A یا B';

-- 10. A/B Test Results
CREATE TABLE IF NOT EXISTS ab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) NOT NULL REFERENCES level_tasks(id) ON DELETE CASCADE,
    version CHAR(1) NOT NULL CHECK (version IN ('A', 'B')),
    test_start_date DATE NOT NULL,
    test_end_date DATE,
    total_views INTEGER NOT NULL DEFAULT 0 CHECK (total_views >= 0),
    total_starts INTEGER NOT NULL DEFAULT 0 CHECK (total_starts >= 0),
    total_completions INTEGER NOT NULL DEFAULT 0 CHECK (total_completions >= 0),
    avg_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (avg_time_seconds >= 0),
    drop_off_rate DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (drop_off_rate >= 0 AND drop_off_rate <= 100),
    completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ab_results_task_version ON ab_test_results(task_id, version);

COMMENT ON TABLE ab_test_results IS 'نتایج Performance A/B Testing';

-- 11. Task Performance Stats
CREATE TABLE IF NOT EXISTS task_performance_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) NOT NULL REFERENCES level_tasks(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_views INTEGER NOT NULL DEFAULT 0 CHECK (total_views >= 0),
    total_started INTEGER NOT NULL DEFAULT 0 CHECK (total_started >= 0),
    total_completed INTEGER NOT NULL DEFAULT 0 CHECK (total_completed >= 0),
    avg_completion_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (avg_completion_time_seconds >= 0),
    completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    drop_off_after_view DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (drop_off_after_view >= 0 AND drop_off_after_view <= 100),
    drop_off_after_start DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (drop_off_after_start >= 0 AND drop_off_after_start <= 100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (period_end >= period_start)
);

CREATE INDEX idx_task_stats_task_period ON task_performance_stats(task_id, period_start, period_end);
CREATE INDEX idx_task_stats_completion_rate ON task_performance_stats(completion_rate);

COMMENT ON TABLE task_performance_stats IS 'آمار Performance کلی هر Task';

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_career_paths_updated_at BEFORE UPDATE ON career_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_path_steps_updated_at BEFORE UPDATE ON career_path_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_levels_updated_at BEFORE UPDATE ON career_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_tasks_updated_at BEFORE UPDATE ON level_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_microcopy_versions_updated_at BEFORE UPDATE ON task_microcopy_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_career_paths_updated_at BEFORE UPDATE ON user_career_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_level_progress_updated_at BEFORE UPDATE ON user_level_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_test_results_updated_at BEFORE UPDATE ON ab_test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## Sample Data

### 📁 فایل: `migrations/002_seed_career_paths_data.sql`

```sql
-- Migration: Seed Career Paths Sample Data
-- Version: 1.0.0
-- Date: 2026-01-19

BEGIN;

-- 1. Insert Accounting Basics Path
INSERT INTO career_paths (id, slug, title, subtitle, description, icon, color, target_audience, estimated_months, is_active, display_order)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'accounting-basics',
    'حسابداری پایه تا حرفه‌ای',
    'از صفر تا اشتغال',
    'این مسیر شما را از مبانی حسابداری تا توانایی کار حرفه‌ای همراهی می‌کند',
    'Calculator',
    'blue',
    'beginner',
    6,
    true,
    1
);

-- 2. Insert Steps for Accounting Basics
INSERT INTO career_path_steps (id, path_id, step_number, title, description, icon, estimated_weeks)
VALUES
    ('11111111-1111-1111-1111-000000000001', '11111111-1111-1111-1111-111111111111', 0, 'آشنایی اولیه', 'درک مفاهیم پایه حسابداری', 'BookOpen', 2),
    ('11111111-1111-1111-1111-000000000002', '11111111-1111-1111-1111-111111111111', 1, 'ثبت رویدادها', 'یادگیری ثبت اسناد', 'FileText', 3),
    ('11111111-1111-1111-1111-000000000003', '11111111-1111-1111-1111-111111111111', 2, 'کار با نرم‌افزار', 'آشنایی با سیستم‌های حسابداری', 'Monitor', 4),
    ('11111111-1111-1111-1111-000000000004', '11111111-1111-1111-1111-111111111111', 3, 'گزارش‌گیری', 'تهیه صورت‌های مالی', 'BarChart3', 6),
    ('11111111-1111-1111-1111-000000000005', '11111111-1111-1111-1111-111111111111', 4, 'موارد پیشرفته', 'تحلیل و تصمیم‌گیری', 'TrendingUp', 9);

-- 3. Insert Level 0 (آشنایی اولیه)
INSERT INTO career_levels (id, path_id, step_id, level_number, title, goal, reputation_reward, badge_reward)
VALUES (
    'acc-level-0',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-000000000001',
    0,
    'شروع سفر',
    'آماده شدن برای ورود به دنیای حسابداری',
    10,
    'newcomer'
);

-- 4. Insert Tasks for Level 0
INSERT INTO level_tasks (id, level_id, task_order, task_type, action_url, validation_rule, reputation_reward, is_active)
VALUES
    ('acc-0-1', 'acc-level-0', 1, 'profile', '/app/profile', '{"type": "profile_completion", "minFields": 3}', 5, true),
    ('acc-0-2', 'acc-level-0', 2, 'answer', '/app/qa?category=accounting', '{"type": "answer_count", "minCount": 1, "category": "accounting"}', 5, true);

-- 5. Insert Microcopy Version A for acc-0-1
INSERT INTO task_microcopy_versions (task_id, version, title, description, helper, cta_text, cta_icon, pending_message, completed_message, toast_message, toast_reward, is_active)
VALUES (
    'acc-0-1',
    'A',
    'کامل کردن پروفایل شما',
    'برای شروع مسیر حسابداری، لطفاً پروفایل خود را تکمیل کنید تا دیگران بتوانند شما را بهتر بشناسند.',
    'فقط اطلاعات ضروری را وارد کنید: نام، تخصص، و یک توضیح کوتاه',
    'تکمیل پروفایل',
    'UserCog',
    'پروفایل شما هنوز کامل نشده',
    'عالی! پروفایل شما آماده است',
    'پروفایل شما با موفقیت تکمیل شد!',
    '+۵ اعتبار تخصصی',
    true
);

-- 6. Insert Microcopy Version B for acc-0-1 (A/B Test)
INSERT INTO task_microcopy_versions (task_id, version, title, description, helper, cta_text, cta_icon, pending_message, completed_message, toast_message, toast_reward, is_active)
VALUES (
    'acc-0-1',
    'B',
    'پروفایل حرفه‌ای بسازید',
    'یک پروفایل قوی به شما کمک می‌کند تا در جامعه کاربرگ شناخته شوید و فرصت‌های شغلی بهتری پیدا کنید.',
    'نکته: پروفایل‌های کامل ۳ برابر بیشتر دیده می‌شوند',
    'ساخت پروفایل',
    'UserCog',
    'پروفایل شما در انتظار تکمیل است',
    'تبریک! پروفایل حرفه‌ای شما آماده است',
    'پروفایل حرفه‌ای شما ایجاد شد!',
    '+۵ Rep',
    true
);

-- 7. Insert Microcopy Version A for acc-0-2
INSERT INTO task_microcopy_versions (task_id, version, title, description, helper, cta_text, cta_icon, pending_message, completed_message, toast_message, toast_reward, is_active)
VALUES (
    'acc-0-2',
    'A',
    'اولین پاسخ خود را بنویسید',
    'یک سؤال ساده در حوزه حسابداری پیدا کنید و سعی کنید پاسخ دهید. نگران کیفیت نباشید، هدف یادگیری است.',
    'اکثر تازه‌کارها از همین‌جا شروع می‌کنند. پاسخ کوتاه هم کاملاً قابل قبول است',
    'نوشتن پاسخ',
    'PenLine',
    'هنوز پاسخی ننوشته‌اید',
    'آفرین! اولین پاسخ شما ثبت شد',
    'اولین پاسخ شما منتشر شد!',
    '+۵ اعتبار',
    true
);

-- 8. Insert Microcopy Version B for acc-0-2 (A/B Test)
INSERT INTO task_microcopy_versions (task_id, version, title, description, helper, cta_text, cta_icon, pending_message, completed_message, toast_message, toast_reward, is_active)
VALUES (
    'acc-0-2',
    'B',
    'به جامعه کمک کنید',
    'هزاران نفر در حال پرسیدن سؤال هستند. حتی یک پاسخ ساده می‌تواند به کسی کمک کند.',
    'نکته: هیچ‌کس حرفه‌ای شروع نکرده. توضیح ساده‌ی خودتان را بنویسید',
    'کمک کردن',
    'PenLine',
    'هنوز به کسی کمک نکرده‌اید',
    'عالی! به یک نفر کمک کردید',
    'شما به یک نفر کمک کردید!',
    '+۵ Rep + Badge مشارکت‌کننده',
    true
);

COMMIT;
```

---

## Indexes

### Performance Indexes

```sql
-- Indexes برای Query های پرکاربرد

-- 1. User Progress Queries
CREATE INDEX idx_user_paths_active ON user_career_paths(user_id, path_id) WHERE completed_at IS NULL;
CREATE INDEX idx_user_level_active ON user_level_progress(user_id, level_id) WHERE completed_at IS NULL;

-- 2. Task Performance Analytics
CREATE INDEX idx_task_completions_date ON user_task_completions(task_id, completed_at DESC);
CREATE INDEX idx_task_stats_recent ON task_performance_stats(task_id, period_end DESC);

-- 3. A/B Testing
CREATE INDEX idx_ab_active_tests ON ab_test_results(task_id) WHERE test_end_date IS NULL;
CREATE INDEX idx_ab_assignments_task ON ab_test_assignments(task_id, assigned_version);

-- 4. Leaderboard & Rankings
CREATE INDEX idx_user_total_rep ON user_career_paths(user_id, total_reputation_earned DESC);
CREATE INDEX idx_task_completion_time ON user_task_completions(task_id, time_spent_seconds);
```

---

## Relations

### Foreign Key Relationships

```sql
-- Diagram Relations

career_paths
    ← career_path_steps.path_id
    ← career_levels.path_id
    ← user_career_paths.path_id

career_path_steps
    ← career_levels.step_id

career_levels
    ← level_tasks.level_id
    ← user_level_progress.level_id

level_tasks
    ← task_microcopy_versions.task_id
    ← user_task_completions.task_id
    ← ab_test_assignments.task_id
    ← ab_test_results.task_id
    ← task_performance_stats.task_id

users (existing table)
    ← user_career_paths.user_id
    ← user_level_progress.user_id
    ← user_task_completions.user_id
    ← ab_test_assignments.user_id

user_career_paths
    ← user_level_progress.user_path_id

user_level_progress
    ← user_task_completions.level_progress_id
```

---

## Backup & Restore

### Backup Script

```bash
#!/bin/bash
# backup_career_paths.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/career_paths_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -U postgres -h localhost \
  -t career_paths \
  -t career_path_steps \
  -t career_levels \
  -t level_tasks \
  -t task_microcopy_versions \
  -t user_career_paths \
  -t user_level_progress \
  -t user_task_completions \
  -t ab_test_assignments \
  -t ab_test_results \
  -t task_performance_stats \
  karbarg_db > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
```

### Restore Script

```bash
#!/bin/bash
# restore_career_paths.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore_career_paths.sh <backup_file>"
    exit 1
fi

psql -U postgres -h localhost -d karbarg_db < $BACKUP_FILE

echo "Restore completed from: $BACKUP_FILE"
```

---

## Drizzle Commands

### Generate Migration

```bash
# Generate migration from schema
npm run db:generate

# Output: drizzle/0001_*.sql
```

### Apply Migration

```bash
# Apply all pending migrations
npm run db:migrate

# Or using Drizzle Kit
npx drizzle-kit push:pg
```

### Seed Database

```bash
# Run seed script
npm run db:seed

# Or manually
psql -U postgres -d karbarg_db -f migrations/002_seed_career_paths_data.sql
```

---

## Query Examples

### 1. Get User's Active Paths

```sql
SELECT
    cp.title,
    cp.slug,
    ucp.current_step,
    ucp.total_reputation_earned,
    ucp.started_at
FROM user_career_paths ucp
JOIN career_paths cp ON ucp.path_id = cp.id
WHERE ucp.user_id = $1
  AND ucp.completed_at IS NULL
ORDER BY ucp.last_activity_at DESC;
```

### 2. Get Task Performance

```sql
SELECT
    lt.id AS task_id,
    tmc.title,
    tps.completion_rate,
    tps.avg_completion_time_seconds,
    tps.drop_off_after_start
FROM level_tasks lt
JOIN task_microcopy_versions tmc ON lt.id = tmc.task_id AND tmc.version = 'A'
LEFT JOIN task_performance_stats tps ON lt.id = tps.task_id
WHERE lt.level_id = $1
ORDER BY lt.task_order;
```

### 3. A/B Test Results Comparison

```sql
SELECT
    version,
    total_views,
    total_completions,
    completion_rate,
    avg_time_seconds
FROM ab_test_results
WHERE task_id = $1
ORDER BY version;
```

### 4. User Progress Detail

```sql
SELECT
    cl.title AS level_title,
    ulp.total_tasks,
    ulp.completed_tasks,
    ROUND((ulp.completed_tasks::DECIMAL / ulp.total_tasks) * 100, 2) AS progress_percentage,
    ulp.started_at,
    ulp.completed_at
FROM user_level_progress ulp
JOIN career_levels cl ON ulp.level_id = cl.id
WHERE ulp.user_id = $1
ORDER BY cl.level_number;
```

---

## Summary

### ✅ آماده برای Production

این Schema شامل:
- ✅ 11 جدول اصلی
- ✅ 25+ Index برای Performance
- ✅ Foreign Keys با CASCADE
- ✅ Constraints برای Data Integrity
- ✅ Auto-updated timestamps
- ✅ Sample Data برای Testing
- ✅ Backup/Restore Scripts
- ✅ Drizzle ORM Schema
- ✅ SQL Migration Scripts

### 🚀 Next Steps

1. Run Migration: `npm run db:migrate`
2. Seed Data: `npm run db:seed`
3. Test Queries
4. Setup Backup Cron Job

---

**نسخه:** 1.0.0
**آخرین بروزرسانی:** 2026-01-19
**وضعیت:** ✅ Production Ready
