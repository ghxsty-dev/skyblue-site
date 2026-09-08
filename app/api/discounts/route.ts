import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseAdminClient() || await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ discounts: [] }, { headers: { "Cache-Control": "no-store" } });

  const { data, error } = await supabase
    .from("site_discounts")
    .select("category, percent, active, label_en, label_tr")
    .eq("active", true);

  if (error) return NextResponse.json({ discounts: [] }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ discounts: data || [] }, { headers: { "Cache-Control": "no-store" } });
}
