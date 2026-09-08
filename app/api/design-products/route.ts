import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  const { data, error } = await supabase
    .from("design_products")
    .select("id, category, slug, data, sort_order")
    .eq("visible", true)
    .order("sort_order");

  if (error) return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  return NextResponse.json({ products: data || [] }, { headers: { "Cache-Control": "public, s-maxage=600" } });
}
