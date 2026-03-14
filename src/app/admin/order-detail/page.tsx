import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AdminOrderDetailView } from "@/components/admin-order-detail-view";
import Link from "next/link";

/**
 * Order detail at /admin/order-detail?id=xxx
 * Data is fetched on the server—no client-side fetch, no hydration issues.
 */
export default async function AdminOrderDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await searchParams;
  if (!id) {
    redirect("/admin");
  }

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
    return (
      <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
        <h2 className="text-xl font-semibold text-amber-900">הזמנה לא נמצאה</h2>
        <Link
          href="/admin"
          className="inline-block rounded-lg border border-amber-600 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          חזרה להזמנות
        </Link>
      </div>
    );
  }

  const orderForView = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    lastEditedAt: order.lastEditedAt?.toISOString() ?? null,
  };

  const productsForView = products.map((p) => ({
    id: p.id,
    nameHe: p.nameHe,
    pricePerKg: p.pricePerKg,
    category: p.category ? { nameHe: p.category.nameHe } : null,
  }));

  return (
    <AdminOrderDetailView order={orderForView} products={productsForView} />
  );
}
