import dynamic from "next/dynamic";

const AdminOrderDetailClient = dynamic(
  () => import("./admin-order-detail-client").then((m) => m.AdminOrderDetailClient),
  { ssr: false, loading: () => <div className="py-12 text-center text-muted-foreground">טוען...</div> }
);

export const dynamic = "force-dynamic";

export default function AdminOrderDetailPage() {
  return <AdminOrderDetailClient />;
}
