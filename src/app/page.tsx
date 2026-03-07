import { Header } from "@/components/header";
import { type ProductCardProduct } from "@/components/product-card";
import { DeadlineBanner } from "@/components/deadline-banner";
import { HowItWorks } from "@/components/how-it-works";
import { PhotosPeopleShare } from "@/components/photos-people-share";
import { ShareCta } from "@/components/share-cta";
import { BestSellers } from "@/components/best-sellers";
import { CategoryCards } from "@/components/category-cards";
import { FriendRecommended } from "@/components/friend-recommended";
import { prisma } from "@/lib/db";
import { getDemoProducts } from "@/lib/demo-products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: ProductCardProduct[];
  let bestSellers: ProductCardProduct[] = [];
  let friendRecommendations: { id: string; name: string; imageUrl: string; quote: string; sortOrder: number }[] = [];

  try {
    const [dbProducts, dbBestSellers, dbRecommendations] = await Promise.all([
      prisma.meatProduct.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: [
          { category: { sortOrder: "asc" } },
          { nameHe: "asc" },
        ],
      }),
      prisma.meatProduct.findMany({
        where: { isActive: true, isBestSeller: true },
        include: { category: true },
        orderBy: { bestSellerOrder: "asc" },
      }),
      prisma.friendRecommendation.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    products = dbProducts;
    bestSellers = dbBestSellers;
    friendRecommendations = dbRecommendations;
  } catch {
    products = getDemoProducts();
    // Fallback best sellers when using demo data (same 4 as in seed)
    const DEMO_BEST_SELLER_ORDER = ["אנטריקוט", "טחון בקר", "שניצל עגל (שייטל)", "המבורגר 170"];
    const byName = new Map(products.map((p) => [p.nameHe, p]));
    bestSellers = DEMO_BEST_SELLER_ORDER.map((n) => byName.get(n)).filter(Boolean) as ProductCardProduct[];
  }

  const byCategory = products.reduce(
    (acc, p) => {
      const key = p.category.nameHe;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, ProductCardProduct[]>
  );

  const categories = Object.entries(byCategory)
    .map(([nameHe, prods]) => ({
      slug: (prods[0] as { category?: { slug?: string } })?.category?.slug ?? "",
      nameHe,
      products: prods,
    }))
    .sort((a, b) => {
      const orderA = (a.products[0] as { category?: { sortOrder?: number } })?.category?.sortOrder ?? 0;
      const orderB = (b.products[0] as { category?: { sortOrder?: number } })?.category?.sortOrder ?? 0;
      return orderA - orderB;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
      <Header />
      <DeadlineBanner />
      <main className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-16">
          <HowItWorks />
          <PhotosPeopleShare />
          <BestSellers products={bestSellers} />
          <CategoryCards categories={categories} />
          <FriendRecommended items={friendRecommendations} />
          <ShareCta />
        </div>
      </main>
    </div>
  );
}
