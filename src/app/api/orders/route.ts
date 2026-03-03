import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendAdminPush, isPushConfigured } from "@/lib/push";
import { calculateOrderTotal } from "@/lib/order-fees";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, items } = body as {
      name: string;
      email: string;
      phone?: string;
      items: { productId: string; quantityKg: number; unitPrice: number }[];
    };

    if (!name || !email || !items?.length) {
      return NextResponse.json(
        { error: "חסרים פרטים: שם, אימייל ופריטים בהזמנה" },
        { status: 400 }
      );
    }

    // Validate product IDs exist in DB (cart may contain demo IDs if DB failed when loading products)
    const productIds = [...new Set(items.map((i) => i.productId))];
    const existingProducts = await prisma.meatProduct.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingProducts.map((p) => p.id));
    const invalidIds = productIds.filter((id) => !existingIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          error:
            "פריטים בסל אינם תקפים (ייתכן שהאתר נטען ללא חיבור למסד נתונים). נא לרוקן את הסל, לרענן את הדף ולהוסיף שוב את הפריטים.",
        },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum, i) => sum + i.quantityKg * i.unitPrice,
      0
    );
    const { serviceFee, total } = calculateOrderTotal(subtotal);

    // Create or find user by email (simple guest flow)
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: "customer",
          profile: {
            create: { name, phone: phone ?? null },
          },
        },
        include: { profile: true },
      });
    } else {
      await prisma.customerProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, name, phone: phone ?? null },
        update: { name, phone: phone ?? null },
      });
      const updated = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true },
      });
      if (updated) user = updated;
    }

    if (!user) {
      return NextResponse.json({ error: "שגיאה" }, { status: 500 });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        serviceFee,
        totalAmount: total,
        items: {
          create: items.map((i) => ({
            meatProductId: i.productId,
            quantityKg: i.quantityKg,
            unitPrice: i.unitPrice,
            lineTotal: Math.round(i.quantityKg * i.unitPrice),
          })),
        },
      },
      include: { items: { include: { meatProduct: true } } },
    });

    if (isPushConfigured()) {
      const sub = await prisma.adminPushSubscription.findFirst();
      if (sub) {
        const profile = await prisma.customerProfile.findUnique({
          where: { userId: user!.id },
        });
        const customerName = profile?.name ?? email;
        await sendAdminPush(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          {
            title: "הזמנה חדשה",
            body: `${customerName} — ₪${order.totalAmount.toLocaleString()} (${order.items.length} פריטים)`,
            url: "/admin",
          }
        );
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "שגיאה ביצירת ההזמנה",
        debug: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
