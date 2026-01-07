import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const userId = params.id;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user[0];

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات کاربر' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user (mobile number only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const { mobile, isActive } = body;

    // Validate mobile number format (Iranian)
    if (mobile && !/^09\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'شماره موبایل معتبر نیست. فرمت: 09XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Check if mobile is already used by another user
    if (mobile) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.mobile, mobile))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return NextResponse.json(
          { error: 'این شماره موبایل قبلاً ثبت شده است' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: any = {};
    if (mobile !== undefined) updateData.mobile = mobile;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Get updated user
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی اطلاعات کاربر' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'شما نمی‌توانید حساب خود را حذف کنید' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Soft delete: Mark as deleted instead of hard delete
    // This preserves data integrity
    await db
      .update(users)
      .set({
        isActive: false,
        mobile: `DELETED_${Date.now()}_${user[0].mobile}`, // Prevent mobile reuse
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف کاربر' },
      { status: 500 }
    );
  }
}
