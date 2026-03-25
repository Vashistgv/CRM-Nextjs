import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't need auth
const PUBLIC_ROUTES = ["/login", "/register"];

// Role-based route access map
const ROUTE_ROLES: Record<string, string[]> = {
  "/salary": ["superadmin", "admin", "hr"],
  "/payroll": ["superadmin", "admin", "hr"],
  "/employees/new": ["superadmin", "admin", "hr"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("➡️ Middleware Path:", request.nextUrl.pathname);
  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Check auth cookie (we store a flag in cookie for middleware access)
  const isAuth = request.cookies.get("crm-auth-status")?.value === "true";
  const userRole = request.cookies.get("crm-user-role")?.value;

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role-based access
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(route) && userRole && !roles.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register).*)"],
};
