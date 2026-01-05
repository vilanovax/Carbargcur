/**
 * Mock data for Admin Panel MVP
 * TODO: Replace with real API calls when backend is ready
 */

export interface AdminUser {
  id: string;
  fullName: string;
  mobile: string;
  profileCompletion: number;
  jobStatus: string;
  joinedAt: Date;
  isActive: boolean;
  profileSlug?: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  slug: string;
  isPublic: boolean;
  skillsCount: number;
  hasPersonalityTest: boolean;
  notes?: string;
}

export interface AdminAssessment {
  id: string;
  title: string;
  category: 'personality' | 'soft_skill' | 'technical';
  status: 'active' | 'coming_soon' | 'inactive';
  participantCount: number;
  completionRate: number;
}

export interface AdminStats {
  totalUsers: number;
  completeProfiles: number;
  activePublicProfiles: number;
  completedAssessments: number;
  generatedResumes: number;
}

// Mock statistics
export const mockAdminStats: AdminStats = {
  totalUsers: 156,
  completeProfiles: 89,
  activePublicProfiles: 78,
  completedAssessments: 45,
  generatedResumes: 67,
};

// Mock users data
export const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    fullName: 'علی محمدی',
    mobile: '09121234567',
    profileCompletion: 100,
    jobStatus: 'seeking',
    joinedAt: new Date('2024-01-15'),
    isActive: true,
    profileSlug: 'ali-mohammadi-a1b2',
  },
  {
    id: '2',
    fullName: 'سارا احمدی',
    mobile: '09123456789',
    profileCompletion: 85,
    jobStatus: 'employed',
    joinedAt: new Date('2024-01-20'),
    isActive: true,
    profileSlug: 'sara-ahmadi-c3d4',
  },
  {
    id: '3',
    fullName: 'حسین رضایی',
    mobile: '09131234567',
    profileCompletion: 60,
    jobStatus: 'freelancer',
    joinedAt: new Date('2024-02-01'),
    isActive: true,
  },
  {
    id: '4',
    fullName: 'مریم کریمی',
    mobile: '09141234567',
    profileCompletion: 45,
    jobStatus: 'seeking',
    joinedAt: new Date('2024-02-10'),
    isActive: false,
  },
  {
    id: '5',
    fullName: 'رضا نوری',
    mobile: '09151234567',
    profileCompletion: 100,
    jobStatus: 'employed',
    joinedAt: new Date('2024-02-15'),
    isActive: true,
    profileSlug: 'reza-noori-e5f6',
  },
];

// Mock public profiles
export const mockAdminProfiles: AdminProfile[] = [
  {
    id: '1',
    userId: '1',
    fullName: 'علی محمدی',
    slug: 'ali-mohammadi-a1b2',
    isPublic: true,
    skillsCount: 8,
    hasPersonalityTest: true,
  },
  {
    id: '2',
    userId: '2',
    fullName: 'سارا احمدی',
    slug: 'sara-ahmadi-c3d4',
    isPublic: true,
    skillsCount: 6,
    hasPersonalityTest: false,
  },
  {
    id: '5',
    userId: '5',
    fullName: 'رضا نوری',
    slug: 'reza-noori-e5f6',
    isPublic: false,
    skillsCount: 10,
    hasPersonalityTest: true,
    notes: 'محتوای گزارش‌شده توسط کاربر - در حال بررسی',
  },
];

// Mock assessments
export const mockAdminAssessments: AdminAssessment[] = [
  {
    id: '1',
    title: 'آزمون شخصیت حرفه‌ای',
    category: 'personality',
    status: 'active',
    participantCount: 45,
    completionRate: 78,
  },
  {
    id: '2',
    title: 'مهارت‌های ارتباطی',
    category: 'soft_skill',
    status: 'coming_soon',
    participantCount: 0,
    completionRate: 0,
  },
  {
    id: '3',
    title: 'تحلیل مالی پیشرفته',
    category: 'technical',
    status: 'active',
    participantCount: 23,
    completionRate: 65,
  },
  {
    id: '4',
    title: 'مدیریت زمان',
    category: 'soft_skill',
    status: 'inactive',
    participantCount: 12,
    completionRate: 45,
  },
];

// Helper to get job status label
export function getJobStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    seeking: 'جویای کار',
    employed: 'شاغل',
    freelancer: 'فریلنسر',
  };
  return labels[status] || status;
}

// Helper to get assessment category label
export function getAssessmentCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    personality: 'شخصیت حرفه‌ای',
    soft_skill: 'مهارت نرم',
    technical: 'فنی',
  };
  return labels[category] || category;
}

// Helper to get assessment status label
export function getAssessmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'فعال',
    coming_soon: 'به‌زودی',
    inactive: 'غیرفعال',
  };
  return labels[status] || status;
}
