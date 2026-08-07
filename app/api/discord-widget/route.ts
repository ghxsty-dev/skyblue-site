import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";

interface GuildData {
  icon: string | null;
  name: string;
  member_count: number;
  premium_subscription_count: number;
}

interface WidgetData {
  presence_count: number;
}

interface VoiceState {
  channel_id: string;
  user_id: string;
}

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN;

  try {
    let icon: string | null = null;
    let name = "SkyBlue";
    let memberCount = 0;
    let boostCount = 0;
    let onlineCount = 0;
    let voiceCount = 0;

    const headers: Record<string, string> = token ? { Authorization: `Bot ${token}` } : {};

    const [guildRes, widgetRes] = await Promise.all([
      fetch(`${DISCORD_API}/guilds/${GUILD_ID}?with_counts=true`, { headers }),
      fetch(`${DISCORD_API}/guilds/${GUILD_ID}/widget.json`),
    ]);

    if (guildRes.ok) {
      const guild: GuildData = await guildRes.json();
      icon = guild.icon;
      name = guild.name;
      memberCount = guild.member_count;
      boostCount = guild.premium_subscription_count;
    }

    if (widgetRes.ok) {
      const widget: WidgetData = await widgetRes.json();
      onlineCount = widget.presence_count;
    }

    if (token) {
      const voiceRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/voice-states`, { headers: { Authorization: `Bot ${token}` } });
      if (voiceRes.ok) {
        const voiceStates: VoiceState[] = await voiceRes.json();
        const uniqueUsers = new Set(voiceStates.map((v) => v.user_id));
        voiceCount = uniqueUsers.size;
      }
    }

    const iconUrl = icon
      ? `https://cdn.discordapp.com/icons/${GUILD_ID}/${icon}.png?size=128`
      : null;

    return NextResponse.json({
      name,
      icon: iconUrl,
      memberCount,
      onlineCount,
      voiceCount,
      boostCount,
    });
  } catch {
    return NextResponse.json({
      name: "SkyBlue",
      icon: null,
      memberCount: 0,
      onlineCount: 0,
      voiceCount: 0,
      boostCount: 0,
    });
  }
}
