import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    mobile: string
    fullName?: string | null
    isAdmin?: boolean
    slug?: string | null
    profilePhotoUrl?: string | null
  }

  interface Session {
    user: {
      id: string
      mobile: string
      fullName?: string | null
      isAdmin?: boolean
      slug?: string | null
      profilePhotoUrl?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    mobile: string
    fullName?: string | null
    isAdmin?: boolean
    slug?: string | null
    profilePhotoUrl?: string | null
  }
}
