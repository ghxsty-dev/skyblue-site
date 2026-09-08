const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";
const PREMIUM_ROLE_ID = "1546577451432419450";

function botHeaders() {
  return { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" };
}

export async function notifyPremiumActive(discordUserId: string): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !discordUserId) return;

  try {
    await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${discordUserId}/roles/${PREMIUM_ROLE_ID}`, {
      method: "PUT",
      headers: botHeaders(),
    });
  } catch {}

  try {
    const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({ recipient_id: discordUserId }),
    });
    if (dmRes.ok) {
      const dm = await dmRes.json();
      await fetch(`${DISCORD_API}/channels/${dm.id}/messages`, {
        method: "POST",
        headers: botHeaders(),
        body: JSON.stringify({ content: "Premium üyeliğiniz aktif edilmiştir ve rolünüz verilmiştir." }),
      });
    }
  } catch {}
}

export async function removePremiumRole(discordUserId: string): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !discordUserId) return;

  try {
    await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${discordUserId}/roles/${PREMIUM_ROLE_ID}`, {
      method: "DELETE",
      headers: botHeaders(),
    });
  } catch {}
}
