import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/account/session";
import { isValidWebPImage } from "@/lib/account/image";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

async function requirePremiumUserId(): Promise<{ userId: string } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { error: "AUTH_NOT_CONFIGURED", status: 503 };
  const { user, stale } = await getSessionUser(supabase);
  if (!user) return { error: stale ? "SESSION_REVOKED" : "UNAUTHORIZED", status: 401 };
  const { data: entitlement } = await supabase
    .from("tool_entitlements")
    .select("id")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (!entitlement) return { error: "PREMIUM_REQUIRED", status: 403 };
  return { userId: user.id };
}

/** Premiuma özel profil bannerı: istemcide WebP'ye çevrilmiş dosya, en fazla 10 MB. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "multipart")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const auth = await requirePremiumUserId();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

    const form = await request.formData();
    const file = form.get("banner");
    if (!(file instanceof File) || file.type !== "image/webp" || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    if (!isValidWebPImage(new Uint8Array(input), 4096, 4096)) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    }
    const path = `${auth.userId}.webp`;

    const { data: previous } = await admin.from("profiles").select("banner_path").eq("id", auth.userId).maybeSingle();
    if (previous?.banner_path && previous.banner_path !== path) {
      await admin.storage.from("banners").remove([previous.banner_path]);
    }

    const { error: uploadError } = await admin.storage.from("banners").upload(path, input, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "3600",
    });
    if (uploadError) throw uploadError;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ banner_path: path, updated_at: new Date().toISOString() })
      .eq("id", auth.userId);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account] banner upload error:", error);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutation(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const auth = await requirePremiumUserId();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

    const { data: previous } = await admin.from("profiles").select("banner_path").eq("id", auth.userId).maybeSingle();
    if (previous?.banner_path) {
      await admin.storage.from("banners").remove([previous.banner_path]);
    }
    const { error } = await admin
      .from("profiles")
      .update({ banner_path: null, updated_at: new Date().toISOString() })
      .eq("id", auth.userId);
    if (error) throw error;

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account] banner delete error:", error);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
