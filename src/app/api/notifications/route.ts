import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserNotifications, getUnreadCount, markAllAsRead } from "@/lib/notifications";

/**
 * GET /api/notifications
 * دریافت لیست نوتیفیکیشن‌های کاربر
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const [items, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id, { limit, offset, unreadOnly }),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({
      notifications: items,
      unreadCount,
      hasMore: items.length === limit,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "خطا در دریافت نوتیفیکیشن‌ها" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * علامت‌گذاری همه به عنوان خوانده‌شده
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    await markAllAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی نوتیفیکیشن‌ها" },
      { status: 500 }
    );
  }
}
