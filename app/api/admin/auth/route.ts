import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie, getAdminPasswordHash } from "@/lib/admin/auth";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "Geçersiz istek" }, { status: 403 });
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });
    }

    const hash = getAdminPasswordHash();
    const valid = await verifyPassword(password, hash);

    if (!valid) {
      return NextResponse.json({ error: "Geçersiz şifre" }, { status: 401 });
    }

    await setAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
