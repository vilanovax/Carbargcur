import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, userSettings } from "@/lib/db/schema";
import bcrypt from "bcrypt";
import { generateSlug } from "@/lib/slug";
import { normalizeMobileNumber, validateIranianMobile } from "@/lib/persian-utils";
import { eq } from "drizzle-orm";
import { validateJson } from "@/lib/api/validate";
import { registerSchema } from "@/lib/api/schemas";
import { enforceRateLimit } from "@/lib/api/rate-limit";

const BCRYPT_ROUNDS = 12;

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "auth:register", 5, 60 * 60 * 1000);
    if (limited) return limited;

    const parsed = await validateJson(request, registerSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { mobile, password, fullName } = parsed;

    const normalizedMobile = normalizeMobileNumber(mobile);

    if (!validateIranianMobile(normalizedMobile)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است. فرمت صحیح: 09xxxxxxxxx" },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.mobile, normalizedMobile))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const baseSlug = generateSlug(fullName);
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const [existingSlug] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.slug, slug))
        .limit(1);

      if (!existingSlug) break;

      const randomSuffix = Math.random().toString(36).substring(2, 6);
      slug = `${baseSlug}-${randomSuffix}`;
      attempts++;
    }

    const [newUser] = await db
      .insert(users)
      .values({
        mobile: normalizedMobile,
        passwordHash: hashedPassword,
        fullName,
      })
      .returning();

    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: newUser.id,
        slug,
        fullName,
        city: "",
      })
      .returning();

    await db
      .insert(userSettings)
      .values({
        userId: newUser.id,
        theme: "light",
        language: "fa",
        emailNotifications: true,
      });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        mobile: newUser.mobile,
        slug: newProfile.slug,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید" },
      { status: 500 }
    );
  }
}
