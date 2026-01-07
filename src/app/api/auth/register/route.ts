import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, profiles, userSettings } from "@/lib/db/schema"
import bcrypt from "bcrypt"
import { generateSlug } from "@/lib/slug"
import { normalizeMobileNumber, validateIranianMobile } from "@/lib/persian-utils"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mobile, password, fullName } = body

    // Validation
    if (!mobile || !password || !fullName) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      )
    }

    // Normalize mobile number (convert Persian/Arabic digits to English)
    const normalizedMobile = normalizeMobileNumber(mobile)

    // Validate mobile number (Iranian format)
    if (!validateIranianMobile(normalizedMobile)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است. فرمت صحیح: 09xxxxxxxxx" },
        { status: 400 }
      )
    }

    // Check if user already exists (use normalized mobile)
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.mobile, normalizedMobile))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique slug with UUID suffix to avoid loops
    const baseSlug = generateSlug(fullName)
    let slug = baseSlug
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const [existingSlug] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.slug, slug))
        .limit(1)

      if (!existingSlug) break

      // Add random suffix
      const randomSuffix = Math.random().toString(36).substring(2, 6)
      slug = `${baseSlug}-${randomSuffix}`
      attempts++
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        mobile: normalizedMobile,
        passwordHash: hashedPassword,
        fullName,
      })
      .returning()

    // Create profile
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: newUser.id,
        slug,
        fullName,
        city: "",
      })
      .returning()

    // Create user settings
    await db
      .insert(userSettings)
      .values({
        userId: newUser.id,
        theme: "light",
        language: "fa",
        emailNotifications: true,
      })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        mobile: newUser.mobile,
        slug: newProfile.slug,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید" },
      { status: 500 }
    )
  }
}
