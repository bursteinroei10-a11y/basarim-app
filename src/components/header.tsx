import Link from "next/link";
import Image from "next/image";
import { CartSheet } from "./cart-sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-90"
          aria-label="בשרים על הדרך – חזרה לדף הבית"
        >
          <Image
            src="/logo.png"
            alt="בשרים על הדרך"
            width={140}
            height={56}
            className="h-11 w-auto object-contain sm:h-14"
            priority
          />
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/my-orders"
            className="text-sm font-medium text-stone-600 hover:text-stone-800"
          >
            ההזמנות שלי
          </Link>
          <CartSheet />
        </nav>
      </div>
    </header>
  );
}
