import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "בשרים על הדרך | הזמנת בשר פרימיום",
  description: "פלטפורמת הזמנת בשר פרימיום - בשרים איכותיים במשלוח",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <CartProvider>{children}</CartProvider>
        </Providers>
      </body>
    </html>
  );
}
