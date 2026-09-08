import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseAdminClient() || await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  const { data, error } = await supabase
    .from("design_products")
    .select("id, category, slug, data, sort_order")
    .eq("visible", true)
    .order("category")
    .order("sort_order");

  if (error) return NextResponse.json({ products: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ products: data || [] }, { headers: { "Cache-Control": "no-store" } });
}
