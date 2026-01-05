import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    mobile: string
    slug?: string
  }

  interface Session {
    user: {
      id: string
      mobile: string
      slug?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    mobile: string
    slug?: string
  }
}
