import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
