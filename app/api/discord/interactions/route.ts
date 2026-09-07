import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { NextRequest, NextResponse } from "next/server";
import { hashDiscordCode } from "@/lib/account/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface DiscordInteraction {
  type: number;
  data?: { name?: string; options?: { name: string; value: string }[] };
  member?: { user?: { id: string; username: string; global_name?: string; avatar?: string } };
  user?: { id: string; username: string; global_name?: string; avatar?: string };
}

function reply(content: string, status = 200) {
  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content, flags: InteractionResponseFlags.EPHEMERAL },
  }, { status });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const rawBody = await request.text();

  if (!signature || !timestamp || !publicKey || !(await verifyKey(rawBody, signature, timestamp, publicKey))) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(rawBody) as DiscordInteraction;
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }
  if (interaction.type !== InteractionType.APPLICATION_COMMAND || interaction.data?.name !== "verify") {
    return reply("Bilinmeyen komut.");
  }

  const code = String(interaction.data.options?.find((option) => option.name === "kod")?.value || "");
  const discordUser = interaction.member?.user || interaction.user;
  if (!code || !discordUser) return reply("Doğrulama kodu eksik.");
  const admin = createSupabaseAdminClient();
  if (!admin) return reply("Hesap sistemi henüz yapılandırılmadı.");

  try {
    const { error } = await admin.rpc("verify_discord_code", {
      p_code_hash: hashDiscordCode(code),
      p_discord_user_id: discordUser.id,
      p_discord_username: discordUser.global_name || discordUser.username,
      p_discord_avatar: discordUser.avatar || null,
    });
    if (error) {
      if (error.message.includes("discord_already_linked")) return reply("Bu Discord hesabı başka bir SkyBlue hesabına bağlı.");
      return reply("Kod geçersiz veya süresi dolmuş.");
    }
    return reply("Discord hesabın doğrulandı. Günlük indirme limitin artık 4.");
  } catch (error) {
    console.error("[discord] interaction verification error:", error);
    return reply("Doğrulama sırasında bir hata oluştu.");
  }
}
