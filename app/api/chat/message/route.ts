import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";

interface ChannelCreateResponse {
  id: string;
  name: string;
  type: number;
}

async function createTempChannel(botToken: string, sender: string, sessionId: string): Promise<string | null> {
  const channelName = `💬・${sender.toLowerCase().replace(/[^a-z0-9ğüşıöç0-9]/g, "-").slice(0, 20)}・${sessionId.slice(0, 6)}`;

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
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[chat] channel creation failed:", res.status, err);
    return null;
  }

  const data: ChannelCreateResponse = await res.json();
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
    const { sessionId, sender, content, timestamp, channelId } = body;

    if (!sessionId || !content || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "DISCORD_BOT_TOKEN ayarlı değil", code: "NO_BOT_TOKEN" }, { status: 503 });
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
