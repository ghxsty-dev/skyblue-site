import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountLogoutButton from "@/components/account/AccountLogoutButton";
import AvatarEditor from "@/components/account/AvatarEditor";
import NameStyleEditor from "@/components/account/NameStyleEditor";
import StyledUsername from "@/components/account/StyledUsername";
import { avatarApiUrl, ROLE_LABELS, type DiscordLink, type ProfileRecord, type ToolEntitlement, type UserRole } from "@/lib/account/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hesabım", robots: { index: false, follow: false } };

function activeEntitlements(entitlements: ToolEntitlement[]) {
  const now = Date.now();
  return entitlements.filter((item) => new Date(item.expires_at).getTime() > now);
}

export default async function AccountPage() {
  if (!isSupabaseConfigured()) return <AccountSetupMissing />;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <AccountSetupMissing />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profileData }, { data: entitlementData }, { data: discordData }] = await Promise.all([
    supabase.from("profiles").select("id, username, avatar_path, role, created_at, updated_at, name_font, name_color_from, name_color_to").eq("id", user.id).single(),
    supabase.from("tool_entitlements").select("tool_slug, expires_at").eq("user_id", user.id),
    supabase.from("discord_links").select("discord_user_id, discord_username, discord_avatar, verified_at").eq("user_id", user.id).maybeSingle(),
  ]);
  const profile = profileData as ProfileRecord | null;
  const entitlements = (entitlementData || []) as ToolEntitlement[];
  const discord = discordData as DiscordLink | null;
  if (!profile) return <AccountSetupMissing />;
  const activePremium = activeEntitlements(entitlements);
  const rankPremium = activePremium.some((item) => item.tool_slug === "minecraft-rank");
  const namePremium = activePremium.length > 0;
  const nameStyle = {
    font: profile.name_font || "default",
    from: profile.name_color_from || "#ffffff",
    to: profile.name_color_to || null,
  };

  return (
    <div className="page-inner account-page">
      <header className="account-page-header">
        <div><span>SkyBlue ID</span><h1>Hesabım</h1><p>Profilini ve tool erişimlerini yönet.</p></div>
        <AccountLogoutButton />
      </header>

      <section className="account-profile-layout">
        <AvatarEditor src={avatarApiUrl(profile)} username={profile.username} />
        <div className="account-profile-summary">
          <div className="account-profile-name"><h2><StyledUsername username={profile.username} style={nameStyle} enabled={namePremium} /></h2><div className="account-badges">{activePremium.length > 0 && <span className="account-badge premium"><img src="/premium.webp" alt="" width={12} height={12} />Premium</span>}{discord && <span className="account-badge discord">Discord</span>}{profile.role !== "user" && <span className={`account-badge role-${profile.role}`}>{ROLE_LABELS[profile.role as UserRole]}</span>}</div></div>
          <dl><div><dt>E-posta</dt><dd>{user.email}</dd></div><div><dt>Kullanıcı adı</dt><dd>Değiştirilemez</dd></div><div><dt>Katılım</dt><dd>{new Date(profile.created_at).toLocaleDateString("tr-TR")}</dd></div></dl>
          <Link href={`/users/${profile.username}`} className="account-text-link">Public profili görüntüle</Link>
        </div>
      </section>

      <section className="account-access-section">
        <div className="account-section-heading"><div><span>Tool erişimi</span><h2>Minecraft Rank Generator</h2></div>{rankPremium ? <span className="account-badge premium"><img src="/premium.webp" alt="" width={12} height={12} />Premium aktif</span> : <Link href="/account/premium?tool=minecraft-rank" className="account-primary-button">Premium üyesi ol</Link>}</div>
        <div className="account-access-grid">
          <div><span>Premium</span><strong>{rankPremium ? "Aktif" : "Free"}</strong></div>
          <div><span>Discord</span><strong>{discord ? `@${discord.discord_username}` : "Bağlı değil"}</strong></div>
          <div><span>Günlük limit</span><strong>{rankPremium ? "Sınırsız" : discord ? "4 indirme" : "2 indirme"}</strong></div>
        </div>
        {!discord && <Link href="/account/discord" className="account-text-link">Discord hesabını doğrula ve günlük +2 indirme kazan</Link>}
      </section>

      <NameStyleEditor username={profile.username} initial={nameStyle} premium={namePremium} />
    </div>
  );
}

function AccountSetupMissing() {
  return <div className="page-inner account-setup-missing"><h1>Hesap sistemi kurulumu bekliyor</h1><p>Supabase migration ve Vercel environment değişkenleri eklenince bu alan aktif olur.</p></div>;
}
