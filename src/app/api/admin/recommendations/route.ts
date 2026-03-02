import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.friendRecommendation.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, imageUrl, quote, sortOrder } = body;
    if (!name || !imageUrl || !quote) {
      return NextResponse.json(
        { error: "חסרים שדות: name, imageUrl, quote" },
        { status: 400 }
      );
    }
    const item = await prisma.friendRecommendation.create({
      data: {
        name: String(name).trim(),
        imageUrl: String(imageUrl).trim(),
        quote: String(quote).trim(),
        sortOrder: Number(sortOrder) ?? 0,
      },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error("POST /api/admin/recommendations", e);
    return NextResponse.json(
      { error: "שגיאה בשמירה" },
      { status: 500 }
    );
  }
}
