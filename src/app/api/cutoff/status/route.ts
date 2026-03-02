import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getNextCutoff } from "@/lib/cutoff";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rule = await prisma.orderCutoff.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!rule) {
      return NextResponse.json({
        locked: false,
        nextCutoffAt: null,
        cutoffAt: null,
        label: null,
      });
    }

    const nextCutoffAt = getNextCutoff({
      dayOfWeek: rule.dayOfWeek,
      hour: rule.hour,
      minute: rule.minute,
      timezone: rule.timezone,
    });

    const now = new Date();
    const locked = now >= nextCutoffAt;

    return NextResponse.json({
      locked,
      nextCutoffAt: nextCutoffAt.toISOString(),
      cutoffAt: nextCutoffAt.toISOString(),
      label: rule.label,
    });
  } catch (error) {
    console.error("Cutoff status error:", error);
    return NextResponse.json({
      locked: false,
      nextCutoffAt: null,
      cutoffAt: null,
    });
  }
}
