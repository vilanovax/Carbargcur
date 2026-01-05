import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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
          return null
        }

        const user = await prisma.users.findUnique({
          where: { mobile: credentials.mobile as string },
          include: { profiles: true },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last login
        await prisma.users.update({
          where: { id: user.id },
          data: { last_login: new Date() },
        })

        return {
          id: user.id,
          mobile: user.mobile,
          slug: user.profiles?.slug,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.mobile = user.mobile
        token.slug = user.slug
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.mobile = token.mobile as string
        session.user.slug = token.slug as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
