import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateSlug } from "@/lib/slug"

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

    // Validate mobile number (Iranian format)
    const mobileRegex = /^09\d{9}$/
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { mobile },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique slug
    let slug = generateSlug(fullName)
    let slugExists = await prisma.profiles.findUnique({
      where: { slug },
    })

    // Ensure slug is unique
    while (slugExists) {
      slug = generateSlug(fullName)
      slugExists = await prisma.profiles.findUnique({
        where: { slug },
      })
    }

    // Create user and profile in a transaction
    const user = await prisma.users.create({
      data: {
        mobile,
        password_hash: hashedPassword,
        profiles: {
          create: {
            full_name: fullName,
            slug,
            city: "",
            experience_level: null,
            job_status: null,
            professional_summary: null,
          },
        },
        user_settings: {
          create: {
            theme: "light",
            language: "fa",
            email_notifications: true,
          },
        },
      },
      include: {
        profiles: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        mobile: user.mobile,
        slug: user.profiles?.slug,
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
