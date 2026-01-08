/**
 * Notification Service
 * سرویس مدیریت نوتیفیکیشن‌ها
 */

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// نوع‌های نوتیفیکیشن
export type NotificationType =
  | "qa_answer" // کسی به سؤالت پاسخ داد
  | "qa_accepted" // پاسخت منتخب شد
  | "qa_reaction" // به پاسخت واکنش دادند
  | "badge_earned" // نشان جدید گرفتی
  | "profile_viewed" // پروفایلت دیده شد
  | "job_match" // شغل مناسب یافت شد
  | "system"; // اعلان سیستمی

// آیکون‌های پیش‌فرض برای هر نوع
const TYPE_ICONS: Record<NotificationType, string> = {
  qa_answer: "MessageSquare",
  qa_accepted: "CheckCircle2",
  qa_reaction: "ThumbsUp",
  badge_earned: "Award",
  profile_viewed: "Eye",
  job_match: "Briefcase",
  system: "Bell",
};

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  icon?: string;
  actionUrl?: string;
  relatedType?: "question" | "answer" | "job" | "badge" | "profile";
  relatedId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * ایجاد نوتیفیکیشن جدید
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, body, icon, actionUrl, relatedType, relatedId, metadata } = params;

  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      body,
      icon: icon || TYPE_ICONS[type],
      actionUrl,
      relatedType,
      relatedId,
      metadata,
    })
    .returning();

  return notification;
}

/**
 * گرفتن نوتیفیکیشن‌های کاربر
 */
export async function getUserNotifications(
  userId: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
) {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  const items = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return items;
}

/**
 * شمارش نوتیفیکیشن‌های خوانده‌نشده
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return result[0]?.count || 0;
}

/**
 * علامت‌گذاری نوتیفیکیشن به عنوان خوانده‌شده
 */
export async function markAsRead(notificationId: string, userId: string) {
  const [updated] = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return updated;
}

/**
 * علامت‌گذاری همه نوتیفیکیشن‌ها به عنوان خوانده‌شده
 */
export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

/**
 * حذف نوتیفیکیشن
 */
export async function deleteNotification(notificationId: string, userId: string) {
  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

// ===========================================
// توابع کمکی برای ایجاد نوتیفیکیشن‌های خاص
// ===========================================

/**
 * نوتیفیکیشن پاسخ جدید به سؤال
 */
export async function notifyNewAnswer(params: {
  questionAuthorId: string;
  answererName: string;
  questionId: string;
  questionTitle: string;
}) {
  const { questionAuthorId, answererName, questionId, questionTitle } = params;

  // Truncate title if too long
  const shortTitle = questionTitle.length > 50 ? questionTitle.substring(0, 47) + "..." : questionTitle;

  return createNotification({
    userId: questionAuthorId,
    type: "qa_answer",
    title: `${answererName} به سؤالت پاسخ داد`,
    body: shortTitle,
    actionUrl: `/app/qa/${questionId}`,
    relatedType: "question",
    relatedId: questionId,
  });
}

/**
 * نوتیفیکیشن پاسخ منتخب
 */
export async function notifyAnswerAccepted(params: {
  answerAuthorId: string;
  questionTitle: string;
  questionId: string;
}) {
  const { answerAuthorId, questionTitle, questionId } = params;

  const shortTitle = questionTitle.length > 50 ? questionTitle.substring(0, 47) + "..." : questionTitle;

  return createNotification({
    userId: answerAuthorId,
    type: "qa_accepted",
    title: "پاسخت منتخب شد!",
    body: shortTitle,
    actionUrl: `/app/qa/${questionId}`,
    relatedType: "question",
    relatedId: questionId,
  });
}

/**
 * نوتیفیکیشن واکنش به پاسخ
 */
export async function notifyAnswerReaction(params: {
  answerAuthorId: string;
  reactorName: string;
  reactionType: "helpful" | "expert";
  questionId: string;
  questionTitle: string;
}) {
  const { answerAuthorId, reactorName, reactionType, questionId, questionTitle } = params;

  const shortTitle = questionTitle.length > 50 ? questionTitle.substring(0, 47) + "..." : questionTitle;
  const reactionText = reactionType === "helpful" ? "مفید بود" : "متخصصانه";

  return createNotification({
    userId: answerAuthorId,
    type: "qa_reaction",
    title: `${reactorName} پاسخت را ${reactionText} دانست`,
    body: shortTitle,
    actionUrl: `/app/qa/${questionId}`,
    relatedType: "question",
    relatedId: questionId,
    metadata: { reactionType },
  });
}

/**
 * نوتیفیکیشن نشان جدید
 */
export async function notifyBadgeEarned(params: {
  userId: string;
  badgeTitle: string;
  badgeId: string;
}) {
  const { userId, badgeTitle, badgeId } = params;

  return createNotification({
    userId,
    type: "badge_earned",
    title: "نشان جدید دریافت کردی!",
    body: badgeTitle,
    actionUrl: "/app/profile",
    relatedType: "badge",
    relatedId: badgeId,
  });
}
