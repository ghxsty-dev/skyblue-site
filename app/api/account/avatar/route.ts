import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "multipart")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    const admin = createSupabaseAdminClient();
    if (!supabase || !admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const form = await request.formData();
    const file = form.get("avatar");
    if (!(file instanceof File) || file.type !== "image/webp" || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());

    const path = `${user.id}.webp`;
    const { error: uploadError } = await admin.storage.from("avatars").upload(path, input, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "3600",
    });
    if (uploadError) throw uploadError;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ avatar_path: path, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account] avatar upload error:", error);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
