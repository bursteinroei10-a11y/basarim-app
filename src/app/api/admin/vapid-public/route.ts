import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/push";

export async function GET() {
  const key = getVapidPublicKey();
  if (!key) return NextResponse.json({ error: "לא מוגדר" }, { status: 501 });
  return NextResponse.json({ publicKey: key });
}
