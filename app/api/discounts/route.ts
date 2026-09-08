import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ discounts: [] }, { headers: { "Cache-Control": "public, s-maxage=300" } });

  const { data, error } = await supabase
    .from("site_discounts")
    .select("category, percent, active, label_en, label_tr")
    .eq("active", true);

  if (error) return NextResponse.json({ discounts: [] }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  return NextResponse.json({ discounts: data || [] }, { headers: { "Cache-Control": "public, s-maxage=300" } });
}
