import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";

export async function GET() {
  try {
    let icon: string | null = null;
    let name = "SkyBlue";
    let memberCount = 0;
    let boostCount = 0;
    let onlineCount = 0;

    const token = process.env.DISCORD_BOT_TOKEN || "";

    if (token) {
      try {
        const guildRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}?with_counts=true`, {
          headers: { Authorization: `Bot ${token}` },
        });
        if (guildRes.ok) {
          const guild = await guildRes.json();
          icon = guild.icon;
          name = guild.name;
          memberCount = guild.member_count ?? 0;
          boostCount = guild.premium_subscription_count ?? 0;
        }
      } catch {}
    }

    try {
      const widgetRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/widget.json`);
      if (widgetRes.ok) {
        const widget = await widgetRes.json();
        onlineCount = widget.presence_count ?? 0;
      }
    } catch {}

    const iconUrl = icon
      ? `https://cdn.discordapp.com/icons/${GUILD_ID}/${icon}.png?size=128`
      : null;

    return NextResponse.json({ name, icon: iconUrl, memberCount, onlineCount, boostCount });
  } catch {
    return NextResponse.json({ name: "SkyBlue", icon: null, memberCount: 0, onlineCount: 0, boostCount: 0 });
  }
}
