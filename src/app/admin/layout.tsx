import Link from "next/link";
import { AdminSignOut } from "@/components/admin-sign-out";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b bg-white/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              ניהול
            </Link>
            <nav className="flex gap-4">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              הזמנות
            </Link>
            <Link href="/admin/cutoff" className="text-sm text-muted-foreground hover:text-foreground">
              סגירת הזמנות
            </Link>
            <Link href="/admin/recommendations" className="text-sm text-muted-foreground hover:text-foreground">
              המלצות חברים
            </Link>
          </nav>
          </div>
          <AdminSignOut />
        </div>
      </header>
      <main className="container px-4 py-6">{children}</main>
    </div>
  );
}
