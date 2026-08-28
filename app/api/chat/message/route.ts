import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";
const SUPPORT_ROLES = ["1516807569820221591", "1516808859854045324", "1516808157094219806"];

const VIEW_CHANNEL = 1024;
const SEND_MESSAGES = 2048;
const READ_MESSAGE_HISTORY = 65536;

interface ChannelCreateResponse {
  id: string;
  name: string;
  type: number;
}

async function createTempChannel(botToken: string, sender: string, sessionId: string): Promise<string | null> {
  const channelName = `💬・${sender.toLowerCase().replace(/[^a-z0-9ğüşıöç0-9]/g, "-").slice(0, 20)}・${sessionId.slice(0, 6)}`;

  const mentions = SUPPORT_ROLES.map((id) => `<@&${id}>`).join(" ");

  const allowPerms = VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY;

  const permissionOverwrites = [
    {
      id: GUILD_ID,
      type: 0,
      allow: "0",
      deny: String(VIEW_CHANNEL),
    },
    ...SUPPORT_ROLES.map((roleId) => ({
      id: roleId,
      type: 0,
      allow: String(allowPerms),
      deny: "0",
    })),
  ];

  const res = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: channelName,
      type: 0,
      topic: `Canlı destek • ${sender} • ${new Date().toLocaleString("tr-TR")}`,
      permission_overwrites: permissionOverwrites,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[chat] channel creation failed:", res.status, err);
    return null;
  }

  const data: ChannelCreateResponse = await res.json();

  await fetch(`${DISCORD_API}/channels/${data.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `${mentions} Yeni canlı destek talebi: **${sender}**`,
    }),
  });

  return data.id;
}

async function sendMessageToChannel(
  botToken: string,
  channelId: string,
  sender: string,
  content: string,
  sessionId: string,
  timestamp: string
): Promise<boolean> {
  const embed = {
    title: `💬 ${sender}`,
    description: content,
    color: 0x59abfe,
    footer: {
      text: `Session: ${sessionId.slice(0, 8)} • ${new Date(timestamp).toLocaleString("tr-TR")}`,
    },
    timestamp: new Date(timestamp).toISOString(),
  };

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embeds: [embed],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[chat] send message failed:", res.status, err);
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sender, content, timestamp, channelId, action } = body;

    if (!sessionId || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "DISCORD_BOT_TOKEN ayarlı değil", code: "NO_BOT_TOKEN" }, { status: 503 });
    }

    if (action === "end") {
      if (!channelId) {
        return NextResponse.json({ error: "No channel to close" }, { status: 400 });
      }

      const embed = {
        title: "🔴 Sohbet Sonlandırıldı",
        description: `**${sender}** sohbeti sonlandırdı.`,
        color: 0xef4444,
        timestamp: new Date().toISOString(),
      };

      await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ embeds: [embed] }),
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "review") {
      if (!channelId) {
        return NextResponse.json({ error: "No channel" }, { status: 400 });
      }

      const { stars, review } = body;

      const starsText = "⭐".repeat(stars);

      const embed = {
        title: `${starsText} Değerlendirme`,
        description: review || "Yorum bırakılmadı.",
        color: 0xfbbf24,
        footer: {
          text: `${sender} • ${new Date().toLocaleString("tr-TR")}`,
        },
        timestamp: new Date().toISOString(),
      };

      await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ embeds: [embed] }),
      });

      await fetch(`${DISCORD_API}/channels/${channelId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `✅・${channelId.slice(-6)}`,
        }),
      });

      return NextResponse.json({ ok: true });
    }

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    if (channelId) {
      const sent = await sendMessageToChannel(botToken, channelId, sender, content, sessionId, timestamp);
      if (!sent) {
        return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 502 });
      }
      return NextResponse.json({ ok: true, channelId });
    }

    const newChannelId = await createTempChannel(botToken, sender, sessionId);
    if (!newChannelId) {
      return NextResponse.json({ error: "Kanal oluşturulamadı" }, { status: 502 });
    }

    const sent = await sendMessageToChannel(botToken, newChannelId, sender, content, sessionId, timestamp);
    if (!sent) {
      return NextResponse.json({ error: "Kanal oluşturuldu ama mesaj gönderilemedi" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, channelId: newChannelId });
  } catch (error) {
    console.error("[chat] message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
