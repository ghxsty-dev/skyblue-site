import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
}

interface ComponentV2Content {
  type: 10;
  content: string;
}

interface ComponentV2Container {
  type: 17;
  components: ComponentV2Content[];
}

interface DiscordMessage {
  id: string;
  author: DiscordUser;
  content: string;
  components?: ComponentV2Container[];
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

  const channelId = request.nextUrl.searchParams.get("channelId");
  const after = request.nextUrl.searchParams.get("after");

  if (!channelId) {
    return NextResponse.json({ messages: [] });
  }

  let url = `${DISCORD_API}/channels/${channelId}/messages?limit=50`;
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
        const isStaff = !msg.author.bot;

        if (msg.components && msg.components.length > 0) {
          const container = msg.components[0];
          if (container.type === 17 && container.components && container.components.length > 0) {
            const textParts = container.components.map((c) => c.content);
            content = textParts.join("\n");

            const firstLine = textParts[0] || "";
            const boldMatch = firstLine.match(/^\*\*(.+?)\*\*$/);
            if (boldMatch) {
              sender = boldMatch[1];
            } else if (firstLine && !firstLine.startsWith("🔴") && !firstLine.startsWith("⭐")) {
              sender = firstLine;
            }
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
