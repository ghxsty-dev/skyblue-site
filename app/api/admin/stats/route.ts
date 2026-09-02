import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";
import { getStats } from "@/lib/admin/data";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getStats();
  return NextResponse.json(stats);
}
