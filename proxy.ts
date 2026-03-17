import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard", "/playground"];
const adminRoutes = ["/admin"];
const publicRoutes = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAdmin = adminRoutes.some((r) => path.startsWith(r));
  const isPublic = publicRoutes.includes(path);

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // Redirect unauthenticated users away from protected routes
  if ((isProtected || isAdmin) && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect non-admins away from admin routes
  if (isAdmin && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Redirect authenticated users away from login/signup
  if (isPublic && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
