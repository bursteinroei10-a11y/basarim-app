import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isLogin = req.nextUrl.pathname === "/admin/login";
  const isAdminApi = req.nextUrl.pathname.startsWith("/admin/api/");

  if (isAdmin && !isLogin && !req.auth) {
    // For API routes, return 401 so fetch() gets JSON (not redirect)
    if (isAdminApi) {
      return NextResponse.json({ error: "לא מאומת" }, { status: 401 });
    }
    return Response.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
