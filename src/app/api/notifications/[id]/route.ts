import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markAsRead, deleteNotification } from "@/lib/notifications";

/**
 * PATCH /api/notifications/[id]
 * علامت‌گذاری یک نوتیفیکیشن به عنوان خوانده‌شده
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { id } = await params;
    const notification = await markAsRead(id, session.user.id);

    if (!notification) {
      return NextResponse.json({ error: "نوتیفیکیشن یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی نوتیفیکیشن" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * حذف یک نوتیفیکیشن
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { id } = await params;
    await deleteNotification(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "خطا در حذف نوتیفیکیشن" },
      { status: 500 }
    );
  }
}
