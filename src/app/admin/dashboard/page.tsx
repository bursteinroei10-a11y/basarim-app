import { prisma } from "@/lib/db";
import Link from "next/link";
import { getOrderBatchCutoffAt } from "@/lib/cutoff";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const deliveredOrders = await prisma.order.findMany({
    where: { status: "DELIVERED" },
    include: {
      user: { include: { profile: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rule = await prisma.orderCutoff.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // Totals (DELIVERED only)
  const totalPaid = deliveredOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalEarned = deliveredOrders.reduce((s, o) => s + o.serviceFee, 0);

  // By batch
  const batchMap = new Map<string, { cutoffAt: Date; orders: typeof deliveredOrders; total: number; fee: number }>();
  if (rule) {
    for (const order of deliveredOrders) {
      const cutoffAt = getOrderBatchCutoffAt(
        {
          dayOfWeek: rule.dayOfWeek,
          hour: rule.hour,
          minute: rule.minute,
          timezone: rule.timezone,
        },
        order.createdAt
      );
      const key = cutoffAt.toISOString();
      const existing = batchMap.get(key);
      if (existing) {
        existing.orders.push(order);
        existing.total += order.totalAmount;
        existing.fee += order.serviceFee;
      } else {
        batchMap.set(key, {
          cutoffAt,
          orders: [order],
          total: order.totalAmount,
          fee: order.serviceFee,
        });
      }
    }
  }
  const batches = Array.from(batchMap.values()).sort(
    (a, b) => b.cutoffAt.getTime() - a.cutoffAt.getTime()
  );

  // Repeat buyers (2+ DELIVERED orders ever)
  const userIdCount = new Map<string, number>();
  for (const o of deliveredOrders) {
    userIdCount.set(o.userId, (userIdCount.get(o.userId) ?? 0) + 1);
  }
  const repeatBuyers = deliveredOrders.filter((o) => (userIdCount.get(o.userId) ?? 0) >= 2);
  const uniqueRepeatBuyers = new Map<string, (typeof deliveredOrders)[0]["user"]>();
  for (const o of repeatBuyers) {
    uniqueRepeatBuyers.set(o.userId, o.user);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">לוח בקרה</h1>
        <p className="text-sm text-muted-foreground mt-1">
          נתונים לפי הזמנות שנמסרו בלבד
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">סה״כ שנגבה</h3>
          <p className="mt-2 text-3xl font-bold">₪{totalPaid.toLocaleString()}</p>
          <p className="mt-1 text-sm text-stone-500">{deliveredOrders.length} הזמנות</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">הרווח שלך (12% / ₪30)</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">₪{totalEarned.toLocaleString()}</p>
        </div>
      </div>

      {batches.length > 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">לפי משלוח (תאריך סגירה)</h3>
          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.cutoffAt.toISOString()}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">
                    {b.cutoffAt.toLocaleDateString("he-IL", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.orders.length} הזמנות • סה״כ ₪{b.total.toLocaleString()} • רווח ₪{b.fee.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">לקוחות חוזרים (2+ הזמנות)</h3>
        {uniqueRepeatBuyers.size === 0 ? (
          <p className="text-muted-foreground">אין לקוחות חוזרים עדיין</p>
        ) : (
          <ul className="space-y-2">
            {Array.from(uniqueRepeatBuyers.entries()).map(([userId, user]) => {
              const count = userIdCount.get(userId) ?? 0;
              return (
                <li key={userId} className="flex items-center justify-between rounded-lg border px-4 py-2">
                  <span className="font-medium">{user.profile?.name ?? user.email}</span>
                  <span className="text-sm text-muted-foreground">{count} הזמנות</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link href="/admin" className="inline-block text-sm text-muted-foreground hover:text-foreground">
        ← חזרה להזמנות
      </Link>
    </div>
  );
}
