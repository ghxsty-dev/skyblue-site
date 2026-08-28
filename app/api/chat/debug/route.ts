import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";

export async function GET() {
  const results: Record<string, unknown> = {};
  const botToken = process.env.DISCORD_BOT_TOKEN;

  results.botTokenSet = !!botToken;

  if (botToken) {
    try {
      const meRes = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        results.botUser = { id: me.id, username: me.username, bot: me.bot };
      } else {
        results.botUser = { error: meRes.status };
      }
    } catch (e) {
      results.botUser = { error: String(e) };
    }

    try {
      const guildRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}?with_counts=true`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (guildRes.ok) {
        const g = await guildRes.json();
        results.guild = { id: g.id, name: g.name, owner: g.owner_id };
      } else {
        results.guild = { error: guildRes.status };
      }
    } catch (e) {
      results.guild = { error: String(e) };
    }

    try {
      const permsRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${results.botUser && typeof results.botUser === "object" && "id" in results.botUser ? (results.botUser as { id: string }).id : "unknown"}`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (permsRes.ok) {
        const member = await permsRes.json();
        results.botPermissions = member.roles;
      } else {
        results.botPermissions = { error: permsRes.status };
      }
    } catch (e) {
      results.botPermissions = { error: String(e) };
    }

    try {
      const channelsRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (channelsRes.ok) {
        const channels = await channelsRes.json();
        results.guildChannels = channels.length;
        const textChannels = channels.filter((c: { type: number }) => c.type === 0);
        results.textChannelCount = textChannels.length;
        const supportChannel = channels.find((c: { id: string }) => c.id === "1542672573320396820");
        if (supportChannel) {
          results.supportChannel = { id: supportChannel.id, name: supportChannel.name, parent_id: supportChannel.parent_id };
        }
      } else {
        results.guildChannels = { error: channelsRes.status };
      }
    } catch (e) {
      results.guildChannels = { error: String(e) };
    }
  }

  return NextResponse.json(results);
}
