import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "חסר אימייל" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        orders: {
          include: { items: { include: { meatProduct: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ orders: [], name: null });
    }

    return NextResponse.json({
      orders: user.orders,
      name: user.profile?.name ?? null,
    });
  } catch (error) {
    console.error("Orders by email error:", error);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
