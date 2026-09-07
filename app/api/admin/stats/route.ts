import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";
import { getStats } from "@/lib/admin/data";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
