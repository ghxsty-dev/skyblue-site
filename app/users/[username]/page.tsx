import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { avatarApiUrl, bannerApiUrl, type ProfileRecord } from "@/lib/account/types";
import ProfileBadges from "@/components/account/ProfileBadges";
import StyledUsername from "@/components/account/StyledUsername";
import { DiscordIcon, StarIcon } from "@/lib/icons";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getProfile(username: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin.from("profiles").select("id, username, avatar_path, role, created_at, updated_at, name_font, name_color_from, name_color_to, banner_path").eq("username", username.toLowerCase()).maybeSingle();
  if (!data) return null;
  const [{ data: premium }, { data: discord }] = await Promise.all([
    admin.from("tool_entitlements").select("id").eq("user_id", data.id).gt("expires_at", new Date().toISOString()).limit(1),
    admin.from("discord_links").select("user_id, discord_username").eq("user_id", data.id).maybeSingle(),
  ]);
  return { profile: data as ProfileRecord, premium: Boolean(premium?.length), discordUsername: (discord as { discord_username?: string } | null)?.discord_username || null };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}`, description: `SkyBlue kullanıcı profili: @${username}` };
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await getProfile(username);
  if (!result) notFound();
  const { profile, premium, discordUsername } = result;
  const nameStyle = {
    font: profile.name_font || "default",
    from: profile.name_color_from || "#ffffff",
    to: profile.name_color_to || null,
  };
  const bannerUrl = premium ? bannerApiUrl(profile) : null;
  const bannerStyle = bannerUrl
    ? { backgroundImage: `url("${bannerUrl}")` }
    : premium && nameStyle.to
      ? { backgroundImage: `linear-gradient(120deg, ${nameStyle.from}, ${nameStyle.to})` }
      : undefined;
  const joined = new Date(profile.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long" });

  return (
    <div className="page-inner public-profile-page">
      <section className="public-profile-card">
        <div className={`public-profile-banner${bannerUrl ? " has-image" : ""}`} style={bannerStyle} aria-hidden="true" />
        <div className="public-profile-body">
          <Image src={avatarApiUrl(profile)} alt={`${profile.username} avatar`} width={128} height={128} unoptimized className="public-profile-avatar" />
          <div className="public-profile-head">
            <div>
              <span className="public-profile-kicker">SkyBlue ID</span>
              <h1><StyledUsername username={profile.username} style={nameStyle} enabled={premium} /></h1>
            </div>
            <ProfileBadges premium={premium} discordUsername={discordUsername} role={profile.role} />
          </div>
          <div className="public-profile-stats">
            <div className="public-profile-stat">
              <span className="public-profile-stat-icon"><img src="/premium.webp" alt="" width={16} height={16} /></span>
              <div><span>Premium</span><strong className={premium ? "is-on" : ""}>{premium ? "Aktif" : "Free"}</strong></div>
            </div>
            <div className="public-profile-stat">
              <span className="public-profile-stat-icon is-discord"><DiscordIcon size={16} /></span>
              <div><span>Discord</span><strong className={discordUsername ? "is-on" : ""}>{discordUsername ? `@${discordUsername}` : "Doğrulanmadı"}</strong></div>
            </div>
            <div className="public-profile-stat">
              <span className="public-profile-stat-icon"><StarIcon size={16} /></span>
              <div><span>Üyelik</span><strong>{joined}</strong></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
