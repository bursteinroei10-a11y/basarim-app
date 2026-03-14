import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrderBatchCutoffAt } from "@/lib/cutoff";

/**
 * GET /admin/api/dashboard
 * Returns totals, by-batch breakdown, repeat buyers. DELIVERED orders only.
 */
export async function GET() {
  try {
    const [orders, rule] = await Promise.all([
      prisma.order.findMany({
        where: { status: "DELIVERED" },
        include: { user: { select: { id: true, email: true, profile: { select: { name: true } } } } },
      }),
      prisma.orderCutoff.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

    const cutoffRule = rule
      ? {
          dayOfWeek: rule.dayOfWeek,
          hour: rule.hour,
          minute: rule.minute,
          timezone: rule.timezone,
        }
      : null;

    const totalPaid = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalEarned = orders.reduce((s, o) => s + o.serviceFee, 0);

    // Group by batch (cutoff date)
    const batchMap = new Map<string, { cutoffAt: Date; orders: typeof orders; totalPaid: number; totalEarned: number }>();
    for (const order of orders) {
      const cutoffAt = cutoffRule
        ? getOrderBatchCutoffAt(cutoffRule, order.createdAt)
        : order.createdAt;
      const key = cutoffAt.toISOString();
      const existing = batchMap.get(key);
      if (existing) {
        existing.orders.push(order);
        existing.totalPaid += order.totalAmount;
        existing.totalEarned += order.serviceFee;
      } else {
        batchMap.set(key, {
          cutoffAt,
          orders: [order],
          totalPaid: order.totalAmount,
          totalEarned: order.serviceFee,
        });
      }
    }
    const byBatch = Array.from(batchMap.values())
      .sort((a, b) => b.cutoffAt.getTime() - a.cutoffAt.getTime())
      .map((b) => ({
        cutoffAt: b.cutoffAt.toISOString(),
        label: b.cutoffAt.toLocaleDateString("he-IL", { dateStyle: "medium" }),
        orderCount: b.orders.length,
        totalPaid: b.totalPaid,
        totalEarned: b.totalEarned,
      }));

    // Repeat buyers: users with 2+ DELIVERED orders (ever)
    const userIdCounts = new Map<string, number>();
    for (const order of orders) {
      userIdCounts.set(order.userId, (userIdCounts.get(order.userId) ?? 0) + 1);
    }
    const repeatBuyerIds = Array.from(userIdCounts.entries())
      .filter(([, c]) => c >= 2)
      .map(([id]) => id);
    const repeatBuyers = orders
      .filter((o) => repeatBuyerIds.includes(o.userId))
      .reduce(
        (acc, o) => {
          if (!acc.some((r) => r.userId === o.userId)) {
            acc.push({
              userId: o.userId,
              email: o.user.email,
              name: o.user.profile?.name ?? null,
              orderCount: userIdCounts.get(o.userId) ?? 0,
            });
          }
          return acc;
        },
        [] as { userId: string; email: string; name: string | null; orderCount: number }[]
      )
      .sort((a, b) => b.orderCount - a.orderCount);

    return NextResponse.json({
      totalPaid,
      totalEarned,
      orderCount: orders.length,
      byBatch,
      repeatBuyers,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
