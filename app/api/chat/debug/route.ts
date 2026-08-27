import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const CHAT_CHANNEL_ID = "1542672573320396820";

export async function GET() {
  const results: Record<string, unknown> = {};

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  results.botTokenSet = !!botToken;
  results.webhookUrlSet = !!webhookUrl;

  if (botToken) {
    try {
      const meRes = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        results.botUser = { id: me.id, username: me.username, bot: me.bot };
      } else {
        results.botUser = { error: meRes.status, body: await meRes.text() };
      }
    } catch (e) {
      results.botUser = { error: "fetch failed", message: String(e) };
    }

    try {
      const chRes = await fetch(`${DISCORD_API}/channels/${CHAT_CHANNEL_ID}`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (chRes.ok) {
        const ch = await chRes.json();
        results.channel = { id: ch.id, name: ch.name, type: ch.type, guild_id: ch.guild_id };
      } else {
        results.channel = { error: chRes.status, body: await chRes.text() };
      }
    } catch (e) {
      results.channel = { error: "fetch failed", message: String(e) };
    }

    try {
      const threadsRes = await fetch(`${DISCORD_API}/channels/${CHAT_CHANNEL_ID}/threads`, {
        headers: { Authorization: `Bot ${botToken}` },
      });
      if (threadsRes.ok) {
        const threads = await threadsRes.json();
        results.activeThreads = threads.threads?.length ?? 0;
      } else {
        results.activeThreads = { error: threadsRes.status };
      }
    } catch (e) {
      results.activeThreads = { error: "fetch failed", message: String(e) };
    }
  }

  if (webhookUrl) {
    try {
      const parsed = new URL(webhookUrl);
      results.webhookHost = parsed.hostname;
      results.webhookPathParts = parsed.pathname.split("/").filter(Boolean);
    } catch {
      results.webhookUrl = "invalid URL format";
    }
  }

  return NextResponse.json(results, { status: 200 });
}
