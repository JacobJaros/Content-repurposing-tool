import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip auth checks when DEV_BYPASS_AUTH is enabled
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  // Check if accessing protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // TODO: real NextAuth session check
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
