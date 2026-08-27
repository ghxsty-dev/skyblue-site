import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const CHAT_CHANNEL_ID = "1542672573320396820";

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  footer?: { text: string };
  color?: number;
}

interface DiscordMessage {
  id: string;
  author: DiscordUser;
  content: string;
  embeds: DiscordEmbed[];
  webhook_id?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
  avatar?: string;
}

export async function GET(request: NextRequest) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ messages: [], error: "DISCORD_BOT_TOKEN not set" });
  }

  const threadId = request.nextUrl.searchParams.get("threadId");
  const after = request.nextUrl.searchParams.get("after");
  const limit = 100;

  const channelId = threadId || CHAT_CHANNEL_ID;

  let url = `${DISCORD_API}/channels/${channelId}/messages?limit=${limit}`;
  if (after) {
    url += `&after=${after}`;
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bot ${token}` },
    });

    if (!res.ok) {
      console.error(`[chat] messages fetch failed: ${res.status} for channel ${channelId}`);
      return NextResponse.json({ messages: [], error: `Discord API error: ${res.status}` });
    }

    const messages: DiscordMessage[] = await res.json();

    const chatMessages: ChatMessage[] = messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((msg) => {
        let content = msg.content;
        let sender = msg.author.global_name || msg.author.username;
        const isStaff = !msg.webhook_id && !msg.author.bot;

        if (msg.embeds && msg.embeds.length > 0) {
          const embed = msg.embeds[0];
          if (embed.description) content = embed.description;
          if (embed.title) {
            sender = embed.title.replace(/^💬\s*/, "");
          }
        }

        const avatarUrl = msg.author.avatar
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png?size=64`
          : undefined;

        return {
          id: msg.id,
          sender,
          content,
          timestamp: msg.timestamp,
          isStaff,
          avatar: avatarUrl,
        };
      })
      .filter((m) => m.content.length > 0);

    return NextResponse.json({ messages: chatMessages });
  } catch (error) {
    console.error("[chat] messages fetch error:", error);
    return NextResponse.json({ messages: [], error: "Failed to fetch messages" });
  }
}
