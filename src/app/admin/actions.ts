"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function deleteOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "לא מאומת" };
  }

  try {
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
    return { ok: true };
  } catch {
    return { ok: false, error: "שגיאה במחיקת ההזמנה" };
  }
}
