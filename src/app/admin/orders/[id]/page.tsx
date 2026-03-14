import { redirect } from "next/navigation";

/**
 * Redirect /admin/orders/[id] to /admin/order-detail?id=xxx
 * The dynamic [id] route causes server-side errors on Vercel.
 */
export default async function AdminOrderRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/order-detail?id=${id}`);
}
