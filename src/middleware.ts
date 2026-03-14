import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isLogin = path === "/admin/login";
  const isAdminApi = path.startsWith("/admin/api/");

  // Redirect /admin/orders/[id] to /admin/order-detail?id= - avoids Vercel server-side error
  const ordersMatch = path.match(/^\/admin\/orders\/([^/]+)$/);
  if (ordersMatch) {
    return NextResponse.redirect(
      new URL(`/admin/order-detail?id=${ordersMatch[1]}`, req.nextUrl.origin)
    );
  }

  if (isAdmin && !isLogin && !req.auth) {
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
