const DISCORD_API = "https://discord.com/api/v10";

function botHeaders() {
  return { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" };
}

async function responseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; code?: number };
    return `${response.status}${body.code ? `/${body.code}` : ""}${body.message ? ` ${body.message}` : ""}`;
  } catch {
    return String(response.status);
  }
}

/** Bot üzerinden kullanıcıya DM gönderir (DM kapalıysa ok:false döner). */
export async function sendDiscordDM(discordUserId: string, content: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return { ok: false, error: "DISCORD_BOT_TOKEN is missing" };
  if (!discordUserId || !content) return { ok: false, error: "Missing recipient or content" };
  try {
    const channelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({ recipient_id: discordUserId }),
    });
    if (!channelRes.ok) return { ok: false, error: `dm channel: ${await responseError(channelRes)}` };
    const channel = (await channelRes.json()) as { id?: string };
    if (!channel.id) return { ok: false, error: "dm channel: ID missing" };
    const messageRes = await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!messageRes.ok) return { ok: false, error: `dm message: ${await responseError(messageRes)}` };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "request failed" };
  }
}
