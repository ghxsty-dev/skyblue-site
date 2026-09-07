import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PremiumRedeemForm from "@/components/account/PremiumRedeemForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Premium Kodu", robots: { index: false, follow: false } };

export default async function PremiumPage() {
  if (!isSupabaseConfigured()) return <div className="page-inner account-setup-missing"><h1>Hesap sistemi kurulumu bekliyor</h1></div>;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <div className="page-inner account-setup-missing"><h1>Hesap sistemi kurulumu bekliyor</h1></div>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="page-inner account-narrow-page">
      <Link href="/account" className="account-back-link">← Hesabım</Link>
      <header><span>Minecraft Rank Generator</span><h1>Premium kodunu kullan</h1><p>Admin tarafından verilen 1, 3 veya 12 aylık kodu gir. Süre mevcut premium erişiminin üzerine eklenir.</p></header>
      <PremiumRedeemForm />
    </div>
  );
}
