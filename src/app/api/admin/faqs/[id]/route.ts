import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { faqs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PUT - ویرایش FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { category, question, answer, order, isActive } = body;

    // Validate category if provided
    if (category) {
      const validCategories = ['general', 'privacy', 'careers'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: "دسته‌بندی نامعتبر است" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (category) updateData.category = category;
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedFaq] = await db
      .update(faqs)
      .set(updateData)
      .where(eq(faqs.id, id))
      .returning();

    if (!updatedFaq) {
      return NextResponse.json(
        { error: "سوال متداول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ faq: updatedFaq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش سوال متداول" },
      { status: 500 }
    );
  }
}

// DELETE - حذف FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const [deletedFaq] = await db
      .delete(faqs)
      .where(eq(faqs.id, id))
      .returning();

    if (!deletedFaq) {
      return NextResponse.json(
        { error: "سوال متداول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "سوال متداول با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "خطا در حذف سوال متداول" },
      { status: 500 }
    );
  }
}
