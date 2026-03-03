import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { calculateOrderTotal } from "@/lib/order-fees";

const VALID_STATUSES = ["PENDING", "RECEIVED", "AWAITING_PAYMENT", "PAID", "DELIVERED"];

async function isOrderPastEditDeadline(orderCreatedAt: Date): Promise<boolean> {
  const rule = await prisma.orderCutoff.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (!rule) return false;
  const { getNextCutoff } = await import("@/lib/cutoff");
  const deadline = getNextCutoff(
    {
      dayOfWeek: rule.dayOfWeek,
      hour: rule.hour,
      minute: rule.minute,
      timezone: rule.timezone,
    },
    orderCreatedAt
  );
  return new Date() >= deadline;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "חסר אימייל" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { meatProduct: true } },
      },
    });

    if (!order || order.user.email !== email) {
      return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }

    const pastDeadline = await isOrderPastEditDeadline(order.createdAt);

    return NextResponse.json({
      ...order,
      editable: !pastDeadline,
    });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, email, items } = body as {
      status?: string;
      email?: string;
      items?: { productId: string; quantityKg: number; unitPrice: number }[];
    };

    // Customer edit flow
    if (email && Array.isArray(items)) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!order || order.user.email !== email.trim().toLowerCase()) {
        return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
      }
      if (await isOrderPastEditDeadline(order.createdAt)) {
        return NextResponse.json(
          { error: "ההזמנות נסגרו. לא ניתן לערוך הזמנה." },
          { status: 403 }
        );
      }
      if (items.length === 0) {
        return NextResponse.json(
          { error: "יש להשאיר לפחות פריט אחד בהזמנה" },
          { status: 400 }
        );
      }

      const subtotal = items.reduce(
        (sum, i) => sum + i.quantityKg * i.unitPrice,
        0
      );
      const { serviceFee, total } = calculateOrderTotal(subtotal);

      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { orderId: id } }),
        prisma.orderItem.createMany({
          data: items.map((i) => ({
            orderId: id,
            meatProductId: i.productId,
            quantityKg: i.quantityKg,
            unitPrice: i.unitPrice,
            lineTotal: Math.round(i.quantityKg * i.unitPrice),
          })),
        }),
        prisma.order.update({
          where: { id },
          data: { serviceFee, totalAmount: total, status: "PENDING" },
        }),
      ]);

      const updated = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { meatProduct: true } } },
      });
      return NextResponse.json(updated);
    }

    // Admin status update flow
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "סטטוס לא תקין" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as "PENDING" | "RECEIVED" | "AWAITING_PAYMENT" | "PAID" | "DELIVERED" },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון ההזמנה" },
      { status: 500 }
    );
  }
}

export const DELETE = auth(async (req, context) => {
  if (!req.auth?.user) {
    return NextResponse.json({ error: "לא מאומת" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "חסר מזהה הזמנה" }, { status: 400 });
    }

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order delete error:", error);
    return NextResponse.json(
      { error: "שגיאה במחיקת ההזמנה" },
      { status: 500 }
    );
  }
});
