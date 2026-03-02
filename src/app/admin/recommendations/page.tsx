import { prisma } from "@/lib/db";
import { RecommendationsForm } from "./recommendations-form";

export const dynamic = "force-dynamic";

export default async function AdminRecommendationsPage() {
  const items = await prisma.friendRecommendation.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">המלצות חברים</h1>
      <p className="text-muted-foreground">
        נהל המלצות שמוצגות בעמוד הבית בחלק &quot;חברים המליצו&quot;.
      </p>
      <RecommendationsForm items={items} />
    </div>
  );
}
