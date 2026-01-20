import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// GET - دریافت FAQs برای نمایش عمومی
export async function GET(request: NextRequest) {
  try {
    // Get only active FAQs ordered by category and order
    const activeFaqs = await db
      .select({
        id: faqs.id,
        category: faqs.category,
        question: faqs.question,
        answer: faqs.answer,
        order: faqs.order,
      })
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(asc(faqs.category), asc(faqs.order));

    // Group by category
    const grouped: Record<string, any[]> = {
      general: [],
      privacy: [],
      careers: [],
    };

    activeFaqs.forEach((faq) => {
      if (grouped[faq.category]) {
        grouped[faq.category].push({
          question: faq.question,
          answer: faq.answer,
        });
      }
    });

    return NextResponse.json({ faqs: grouped });
  } catch (error) {
    console.error("Error fetching public FAQs:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سوالات متداول" },
      { status: 500 }
    );
  }
}
