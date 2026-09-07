import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DiscordVerificationPanel from "@/components/account/DiscordVerificationPanel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Discord Doğrulama", robots: { index: false, follow: false } };

export default async function DiscordVerificationPage() {
  if (!isSupabaseConfigured()) return <div className="page-inner account-setup-missing"><h1>Hesap sistemi kurulumu bekliyor</h1></div>;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <div className="page-inner account-setup-missing"><h1>Hesap sistemi kurulumu bekliyor</h1></div>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div className="page-inner account-narrow-page"><Link href="/account" className="account-back-link">← Hesabım</Link><header><span>Discord</span><h1>Discord hesabını doğrula</h1><p>Aynı Discord hesabı yalnızca bir SkyBlue hesabına bağlanabilir.</p></header><DiscordVerificationPanel /></div>;
}
