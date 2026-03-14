import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { calculateOrderTotal } from "@/lib/order-fees";

const VALID_STATUSES: OrderStatus[] = ["PENDING", "RECEIVED", "AWAITING_PAYMENT", "PAID", "DELIVERED"];

/**
 * GET /admin/api/orders/[id]
 * Returns order with user, items, products for admin detail/edit page.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "חסר מזהה הזמנה" }, { status: 400 });
  }

  try {
    const [order, products] = await Promise.all([
      prisma.order.findUnique({
        where: { id },
        include: {
          user: { include: { profile: true } },
          items: { include: { meatProduct: true } },
        },
      }),
      prisma.meatProduct.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: [{ category: { sortOrder: "asc" } }, { nameHe: "asc" }],
      }),
    ]);

    if (!order) {
      return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }

    return NextResponse.json({ order, products });
  } catch (error) {
    console.error("Admin order GET error:", error);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}

/**
 * PATCH /admin/api/orders/[id]
 * Auth: middleware. Updates status or items.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "חסר מזהה הזמנה" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, items } = body as {
      status?: string;
      items?: { productId: string; quantityKg: number; unitPrice: number }[];
    };

    // Admin items edit (bypasses cutoff; cannot edit DELIVERED)
    if (Array.isArray(items)) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
      }
      if (order.status === "DELIVERED") {
        return NextResponse.json(
          { error: "לא ניתן לערוך הזמנה שנמסרה" },
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
          data: {
            serviceFee,
            totalAmount: total,
            status: "PENDING",
            lastEditedBy: "admin",
            lastEditedAt: new Date(),
            lastEditedByUserId: null,
          },
        }),
      ]);

      const updated = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { meatProduct: true } } },
      });
      return NextResponse.json(updated);
    }

    // Admin status update
    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: "סטטוס לא תקין" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון ההזמנה" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/api/orders/[id]
 * Auth is enforced by middleware on /admin/* – only authenticated admins reach this.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "חסר מזהה הזמנה" }, { status: 400 });
  }

  try {
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "שגיאה במחיקת ההזמנה" },
      { status: 500 }
    );
  }
}
