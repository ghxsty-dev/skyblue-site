import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const VERIFY_CHANNEL_ID = "1546599370131111956";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CODE_SECRET = process.env.DISCORD_VERIFY_SECRET;

if (!DISCORD_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !CODE_SECRET) {
  console.error("Missing env vars: DISCORD_BOT_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DISCORD_VERIFY_SECRET");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function normalizeCode(input) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function hashCode(code) {
  const { createHmac } = await import("node:crypto");
  return createHmac("sha256", CODE_SECRET).update(normalizeCode(code)).digest("hex");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once("ready", () => {
  console.log(`Bot ready: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== VERIFY_CHANNEL_ID) return;

  const raw = message.content.trim();
  const cleaned = normalizeCode(raw);

  if (cleaned.length < 8 || cleaned.length > 30) return;

  try {
    const codeHash = await hashCode(raw);

    const { data: codeRow, error: lookupError } = await supabase
      .from("discord_verification_codes")
      .select("id, user_id, expires_at, consumed_at")
      .eq("code_hash", codeHash)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (lookupError || !codeRow) {
      await message.react("❌").catch(() => {});
      return;
    }

    const { data: existingLink } = await supabase
      .from("discord_links")
      .select("user_id")
      .eq("user_id", codeRow.user_id)
      .maybeSingle();

    const username = message.member?.displayName || message.author.username;
    const avatar = message.author.avatar || null;

    const { error: verifyError } = await supabase.rpc("verify_discord_code", {
      p_code_hash: codeHash,
      p_discord_user_id: message.author.id,
      p_discord_username: username,
      p_discord_avatar: avatar,
    });

    if (verifyError) {
      await message.react("❌").catch(() => {});
      return;
    }

    await message.react("✅").catch(() => {});

    try {
      await message.author.send({
        content: "✅ **Discord hesabın doğrulandı!** SkyBlue hesabınla bağlandı. Günlük indirme limitin artık 4.",
      });
    } catch {
      // DM kapalı olabilir, sorun değil
    }

    setTimeout(async () => {
      try {
        await message.delete();
      } catch {
        // mesaj zaten silinmiş olabilir
      }
    }, 1500);
  } catch (error) {
    console.error("[verify] error:", error);
    await message.react("⚠️").catch(() => {});
  }
});

client.login(DISCORD_TOKEN);
