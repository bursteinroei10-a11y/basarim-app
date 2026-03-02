import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getNextCutoff } from "@/lib/cutoff";

export async function GET() {
  try {
    const rule = await prisma.orderCutoff.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!rule) return NextResponse.json(null);
    const nextCutoffAt = getNextCutoff({
      dayOfWeek: rule.dayOfWeek,
      hour: rule.hour,
      minute: rule.minute,
      timezone: rule.timezone,
    });
    return NextResponse.json({
      ...rule,
      nextCutoffAt: nextCutoffAt.toISOString(),
    });
  } catch (error) {
    console.error("Cutoff GET error:", error);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dayOfWeek, hour, minute, timezone, label } = body as {
      dayOfWeek?: number;
      hour?: number;
      minute?: number;
      timezone?: string;
      label?: string;
    };

    if (
      dayOfWeek == null ||
      hour == null ||
      minute == null ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return NextResponse.json(
        { error: "חסרים dayOfWeek (0-6), hour (0-23), minute (0-59)" },
        { status: 400 }
      );
    }

    const cutoff = await prisma.orderCutoff.create({
      data: {
        dayOfWeek,
        hour,
        minute,
        timezone: timezone ?? "Asia/Jerusalem",
        label: label ?? null,
      },
    });

    return NextResponse.json(cutoff);
  } catch (error) {
    console.error("Cutoff POST error:", error);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
