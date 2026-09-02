import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";

export const runtime = "nodejs";
import { getStats } from "@/lib/admin/data";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Stats hatası", details: String(error) }, { status: 500 });
  }
}
