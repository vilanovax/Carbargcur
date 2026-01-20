import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { faqs, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// GET - لیست تمام FAQs
export async function GET(request: NextRequest) {
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

    // Get all FAQs ordered by category and order
    const allFaqs = await db
      .select()
      .from(faqs)
      .orderBy(asc(faqs.category), asc(faqs.order));

    return NextResponse.json({ faqs: allFaqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سوالات متداول" },
      { status: 500 }
    );
  }
}

// POST - ایجاد FAQ جدید
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { category, question, answer, order = 0, isActive = true } = body;

    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: "فیلدهای ضروری را وارد کنید" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['general', 'privacy', 'careers'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "دسته‌بندی نامعتبر است" },
        { status: 400 }
      );
    }

    const [newFaq] = await db
      .insert(faqs)
      .values({
        category,
        question,
        answer,
        order,
        isActive,
      })
      .returning();

    return NextResponse.json({ faq: newFaq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد سوال متداول" },
      { status: 500 }
    );
  }
}
