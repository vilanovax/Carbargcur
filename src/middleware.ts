import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function csrfCheck(req: NextRequest): NextResponse | null {
  if (!MUTATION_METHODS.has(req.method)) return null;
  if (!req.nextUrl.pathname.startsWith("/api/")) return null;

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin || !host) {
    return NextResponse.json(
      { error: "Origin نامعتبر" },
      { status: 403 }
    );
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return NextResponse.json(
        { error: "Origin با host مطابقت ندارد" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Origin نامعتبر" },
      { status: 403 }
    );
  }

  return null;
}

const authMiddleware = withAuth({
  pages: { signIn: "/auth" },
});

export default function middleware(req: NextRequest) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  if (req.nextUrl.pathname.startsWith("/app")) {
    return (authMiddleware as unknown as (r: NextRequest) => NextResponse)(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
