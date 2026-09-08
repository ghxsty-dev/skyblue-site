const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";
const PREMIUM_ROLE_ID = "1546577451432419450";

function botHeaders() {
  return { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" };
}

interface PremiumNotificationResult {
  roleAssigned: boolean;
  dmSent: boolean;
  error: string | null;
}

async function responseError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { message?: string; code?: number };
    return `${response.status}${body.code ? `/${body.code}` : ""}${body.message ? ` ${body.message}` : ""}`;
  } catch {
    return String(response.status);
  }
}

export async function notifyPremiumActive(discordUserId: string): Promise<PremiumNotificationResult> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return { roleAssigned: false, dmSent: false, error: "DISCORD_BOT_TOKEN is missing" };
  if (!discordUserId) return { roleAssigned: false, dmSent: false, error: "Discord user ID is missing" };

  const errors: string[] = [];
  let roleAssigned = false;
  let dmSent = false;

  try {
    const response = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${discordUserId}/roles/${PREMIUM_ROLE_ID}`, {
      method: "PUT",
      headers: botHeaders(),
    });
    if (response.ok) {
      roleAssigned = true;
    } else {
      errors.push(`role: ${await responseError(response)}`);
    }
  } catch (error) {
    errors.push(`role: ${error instanceof Error ? error.message : "request failed"}`);
  }

  try {
    const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: "POST",
      headers: botHeaders(),
      body: JSON.stringify({ recipient_id: discordUserId }),
    });
    if (dmRes.ok) {
      const dm = await dmRes.json() as { id?: string };
      if (!dm.id) {
        errors.push("dm: channel ID missing");
      } else {
        const messageRes = await fetch(`${DISCORD_API}/channels/${dm.id}/messages`, {
          method: "POST",
          headers: botHeaders(),
          body: JSON.stringify({
            content: roleAssigned
              ? "Premium üyeliğiniz aktif edilmiştir ve rolünüz verilmiştir."
              : "Premium üyeliğiniz aktif edilmiştir. Discord rolü atanamadı; yönetici bilgilendirildi.",
          }),
        });
        if (messageRes.ok) {
          dmSent = true;
        } else {
          errors.push(`dm message: ${await responseError(messageRes)}`);
        }
      }
    } else {
      errors.push(`dm channel: ${await responseError(dmRes)}`);
    }
  } catch (error) {
    errors.push(`dm: ${error instanceof Error ? error.message : "request failed"}`);
  }

  const result = { roleAssigned, dmSent, error: errors.length > 0 ? errors.join("; ") : null };
  if (result.error) {
    console.error("[discord-premium] notification failed", { discordUserId, ...result });
  }
  return result;
}

export async function removePremiumRole(discordUserId: string): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !discordUserId) return false;

  try {
    const response = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${discordUserId}/roles/${PREMIUM_ROLE_ID}`, {
      method: "DELETE",
      headers: botHeaders(),
    });
    if (!response.ok && response.status !== 404) {
      console.error("[discord-premium] role removal failed", { discordUserId, error: await responseError(response) });
      return false;
    }
    return response.ok || response.status === 404;
  } catch (error) {
    console.error("[discord-premium] role removal failed", { discordUserId, error: error instanceof Error ? error.message : "request failed" });
    return false;
  }
}
