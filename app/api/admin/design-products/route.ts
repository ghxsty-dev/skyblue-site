import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { data, error } = await admin
    .from("design_products")
    .select("id, category, slug, data, sort_order, visible, created_at")
    .order("category")
    .order("sort_order");
  if (error) return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  return NextResponse.json({ products: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  const { category, slug, data, sort_order } = body;
  if (!category || !data) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { error } = await admin.from("design_products").insert({
    category,
    slug: slug || null,
    data,
    sort_order: Number(sort_order) || 0,
    visible: true,
  });
  if (error) return NextResponse.json({ error: "INSERT_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  const { id, data, slug, sort_order, visible } = body;
  if (!id) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data !== undefined) update.data = data;
  if (slug !== undefined) update.slug = slug;
  if (sort_order !== undefined) update.sort_order = Number(sort_order);
  if (visible !== undefined) update.visible = Boolean(visible);

  const { error } = await admin.from("design_products").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { error } = await admin.from("design_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
