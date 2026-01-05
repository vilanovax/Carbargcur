# Profile Onboarding Flow

## Overview

Complete onboarding wizard for collecting minimal profile data in Karbarg MVP.

## Features

✅ **5-Step Guided Wizard:**
- Step 1: Basic Info (name, city, experience level)
- Step 2: Job Status (employed/seeking/freelancer)
- Step 3: Skills (3-10 finance skills with autocomplete)
- Step 4: Professional Summary (optional, max 300 chars)
- Step 5: Review & Finish

✅ **Client-Side State Management:**
- React state for UI
- localStorage for persistence
- Auto-save with 300ms debounce
- No backend integration (yet)

✅ **Validation:**
- Inline validation with error messages
- Step-by-step validation
- Redirect to first incomplete step if accessing later steps
- Prevents progression until current step is valid

✅ **Mobile-First UI:**
- Responsive design
- Persian (RTL) support
- Clean Tailwind + shadcn/ui components
- Progress indicator

## Routes

```
/app/profile/onboarding              → Entry (redirects to first incomplete step)
/app/profile/onboarding/step-1-basic → Basic Info
/app/profile/onboarding/step-2-status → Job Status
/app/profile/onboarding/step-3-skills → Skills
/app/profile/onboarding/step-4-summary → Summary
/app/profile/onboarding/review       → Review & Finish
```

## Data Model

```typescript
type OnboardingProfile = {
  fullName: string;
  city: string;
  experienceLevel: "junior" | "mid" | "senior" | "";
  jobStatus: "employed" | "seeking" | "freelancer" | "";
  skills: string[];          // 3..10
  summary: string;           // optional, max 300
};
```

## localStorage Keys

- `karbarg:onboarding:profile:v1` - Profile data
- `karbarg:onboarding:completed` - Completion flag

## Testing the Flow

1. **Start from Dashboard:**
   - Visit: http://localhost:3001/app
   - Click "شروع آنبوردینگ" button

2. **Complete Each Step:**
   - Fill in required fields
   - Click "ادامه" to proceed
   - Use "مرحله قبل" to go back

3. **Review & Finish:**
   - Review all collected data
   - Click "نهایی‌سازی و ساخت پروفایل"
   - Redirects to `/app/profile`

4. **View Profile:**
   - Visit: http://localhost:3001/app/profile
   - See onboarding data loaded from localStorage
   - Edit onboarding via "ویرایش آنبوردینگ" button

## Components

### Core Components
- `OnboardingShell` - Layout wrapper with progress bar
- `OnboardingProgress` - 5-step progress indicator
- `OnboardingNav` - Back/Next navigation buttons
- `SkillTagInput` - Tag input with suggestions

### Libraries
- `lib/onboarding.ts` - Types, validation, localStorage helpers

## Validation Rules

### Step 1 (Basic Info)
- fullName: required, min 3 chars
- city: required
- experienceLevel: required (one of: junior, mid, senior)

### Step 2 (Job Status)
- jobStatus: required (one of: employed, seeking, freelancer)

### Step 3 (Skills)
- skills: min 3, max 10
- No duplicates
- Trim whitespace

### Step 4 (Summary)
- Optional
- Max 300 characters

## Suggested Skills

Pre-defined list of finance-related skills:
- Excel پیشرفته
- IFRS
- حسابداری صنعتی
- تحلیل بنیادی
- تحلیل تکنیکال
- ارزش‌گذاری
- حسابرسی داخلی
- حسابرسی مستقل
- مدل‌سازی مالی
- Power BI
- SQL
- بودجه‌ریزی
- مدیریت ریسک
- بیمه عمر
- بیمه درمان
- تجزیه و تحلیل صورت‌های مالی

## Future Enhancements

- [ ] Backend API integration (POST to `/api/profile/onboarding`)
- [ ] Toast notifications for success/errors
- [ ] Image upload for profile photo
- [ ] Resume file upload
- [ ] More skill categories
- [ ] Work experience form
- [ ] Education form
- [ ] Certifications

## Development

```bash
# Run dev server
npm run dev

# Access onboarding
http://localhost:3001/app/profile/onboarding

# Clear localStorage (dev tools console)
localStorage.clear()
```

## Notes

- All data stored locally (no database yet)
- Persian UI texts based on microcopy specification
- Auto-save with debounce (300ms)
- Protected navigation (can't skip incomplete steps)
- Privacy notice on all pages
