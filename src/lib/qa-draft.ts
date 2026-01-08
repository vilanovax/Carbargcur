/**
 * Q&A Draft Storage Utility
 * Saves question drafts to localStorage for auto-recovery
 */

const DRAFT_KEY = "karbarg:qa:draft";
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface QuestionDraft {
  title: string;
  body: string;
  category: string;
  tags: string[];
  savedAt: number;
}

/**
 * Save draft to localStorage
 */
export function saveDraft(draft: Omit<QuestionDraft, "savedAt">): void {
  if (typeof window === "undefined") return;

  const data: QuestionDraft = {
    ...draft,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving draft:", error);
  }
}

/**
 * Load draft from localStorage
 * Returns null if no draft or draft is expired
 */
export function loadDraft(): QuestionDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;

    const draft: QuestionDraft = JSON.parse(stored);

    // Check expiry
    if (Date.now() - draft.savedAt > DRAFT_EXPIRY_MS) {
      clearDraft();
      return null;
    }

    // Check if draft has any content
    if (!draft.title && !draft.body) {
      return null;
    }

    return draft;
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error("Error clearing draft:", error);
  }
}

/**
 * Check if a draft exists
 */
export function hasDraft(): boolean {
  return loadDraft() !== null;
}

/**
 * Get draft age in human readable format (Persian)
 */
export function getDraftAge(savedAt: number): string {
  const diffMs = Date.now() - savedAt;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "همین الان";
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  return `${diffDays} روز پیش`;
}
