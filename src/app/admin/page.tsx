import { prisma } from "@/lib/db";
import { AdminEnablePush } from "@/components/admin-enable-push";
import { AdminOrdersTable } from "@/components/admin-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { include: { profile: true } },
      items: { include: { meatProduct: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const tableOrders = orders.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    customerName: o.user.profile?.name ?? o.user.email,
    customerEmail: o.user.email,
    itemsSummary: o.items
      .map((i) => `${i.meatProduct.nameHe} ${i.quantityKg} ק״ג`)
      .join(" • "),
    totalAmount: o.totalAmount,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">הזמנות</h1>
        <AdminEnablePush />
      </div>
      <AdminOrdersTable orders={tableOrders} />
    </div>
  );
}
