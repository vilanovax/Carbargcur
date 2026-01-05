// Script to create a test user
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { mobile: '09123456789' },
    })

    if (existing) {
      console.log('✅ Test user already exists!')
      console.log('Mobile: 09123456789')
      console.log('Password: test1234')
      return
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test1234', 10)

    const user = await prisma.users.create({
      data: {
        mobile: '09123456789',
        password_hash: hashedPassword,
        profiles: {
          create: {
            full_name: 'کاربر تستی',
            slug: 'test-user-1234',
            city: 'تهران',
            experience_level: 'mid',
            job_status: 'seeking',
            professional_summary: 'این یک پروفایل تستی است برای آزمایش سیستم.',
          },
        },
        user_settings: {
          create: {
            theme: 'light',
            language: 'fa',
          },
        },
      },
      include: {
        profiles: true,
      },
    })

    console.log('✅ Test user created successfully!')
    console.log('Mobile: 09123456789')
    console.log('Password: test1234')
    console.log('Profile slug:', user.profiles?.slug)
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
