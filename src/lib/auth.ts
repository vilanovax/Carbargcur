import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "شماره موبایل", type: "text" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          return null;
        }

        // Find user with their profile
        const [user] = await db
          .select({
            id: users.id,
            mobile: users.mobile,
            passwordHash: users.passwordHash,
            fullName: users.fullName,
            isAdmin: users.isAdmin,
            isVerified: users.isVerified,
            profileId: profiles.id,
            profileSlug: profiles.slug,
            profileFullName: profiles.fullName,
            profilePhotoUrl: profiles.profilePhotoUrl,
          })
          .from(users)
          .leftJoin(profiles, eq(users.id, profiles.userId))
          .where(eq(users.mobile, credentials.mobile))
          .limit(1);

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id));

        return {
          id: user.id,
          mobile: user.mobile,
          fullName: user.fullName || user.profileFullName || null,
          isAdmin: user.isAdmin,
          slug: user.profileSlug || null,
          profilePhotoUrl: user.profilePhotoUrl || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mobile = user.mobile;
        token.fullName = user.fullName;
        token.isAdmin = user.isAdmin;
        token.slug = user.slug;
        token.profilePhotoUrl = user.profilePhotoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.mobile = token.mobile as string;
        session.user.fullName = token.fullName as string | null;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.slug = token.slug as string | null;
        session.user.profilePhotoUrl = token.profilePhotoUrl as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
