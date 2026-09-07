import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return new NextResponse(null, { status: 404 });

  const { data: profile } = await admin.from("profiles").select("avatar_path").eq("id", userId).maybeSingle();
  if (!profile?.avatar_path) return new NextResponse(null, { status: 404 });

  const { data, error } = await admin.storage.from("avatars").download(profile.avatar_path);
  if (error || !data) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(await data.arrayBuffer()), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
