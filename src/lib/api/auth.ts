import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type AuthContext = {
  userId: string;
  isAdmin: boolean;
  mobile: string;
};

export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }
  return {
    userId: session.user.id,
    isAdmin: !!session.user.isAdmin,
    mobile: session.user.mobile ?? "",
  };
}

export async function requireAdmin(): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const [row] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!row?.isAdmin) {
    return NextResponse.json({ error: "دسترسی فقط برای ادمین" }, { status: 403 });
  }
  return { ...auth, isAdmin: true };
}
