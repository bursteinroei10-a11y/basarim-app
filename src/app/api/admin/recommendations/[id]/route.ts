import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, imageUrl, quote, sortOrder } = body;
    const data: { name?: string; imageUrl?: string; quote?: string; sortOrder?: number } = {};
    if (name !== undefined) data.name = String(name).trim();
    if (imageUrl !== undefined) data.imageUrl = String(imageUrl).trim();
    if (quote !== undefined) data.quote = String(quote).trim();
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder) ?? 0;

    const item = await prisma.friendRecommendation.update({
      where: { id },
      data,
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error("PATCH /api/admin/recommendations/[id]", e);
    return NextResponse.json(
      { error: "שגיאה בעדכון" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.friendRecommendation.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/recommendations/[id]", e);
    return NextResponse.json(
      { error: "שגיאה במחיקה" },
      { status: 500 }
    );
  }
}
