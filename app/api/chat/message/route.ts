import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const CHAT_CHANNEL_ID = "1542672573320396820";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sender, content, timestamp, threadId } = body;

    if (!sessionId || !content || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!webhookUrl) {
      console.error("[chat] DISCORD_WEBHOOK_URL is not set");
      return NextResponse.json({ error: "Discord webhook not configured", code: "NO_WEBHOOK" }, { status: 503 });
    }

    const embed = {
      title: `💬 ${sender}`,
      description: content,
      color: 0x59abfe,
      footer: {
        text: `Session: ${sessionId.slice(0, 8)} • ${new Date(timestamp).toLocaleString("tr-TR")}`,
      },
      timestamp: new Date(timestamp).toISOString(),
    };

    if (threadId) {
      const webhookRes = await fetch(`${webhookUrl}?thread_id=${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: sender, embeds: [embed] }),
      });

      if (!webhookRes.ok) {
        const err = await webhookRes.text();
        console.error("[chat] webhook send to thread failed:", webhookRes.status, err);
        return NextResponse.json({ error: "Failed to send to Discord" }, { status: 502 });
      }

      return NextResponse.json({ ok: true, threadId });
    }

    const threadName = `💬 ${sender} (${sessionId.slice(0, 6)})`;

    if (botToken) {
      const threadRes = await fetch(`${DISCORD_API}/channels/${CHAT_CHANNEL_ID}/threads`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: threadName,
          auto_archive_duration: 1440,
          message: {
            content: `🟢 **${sender}** sohbete katıldı — ${new Date(timestamp).toLocaleString("tr-TR")}`,
          },
        }),
      });

      if (threadRes.ok) {
        const threadData = await threadRes.json();
        const newThreadId = threadData.id;
        console.log("[chat] thread created:", newThreadId, "for", sender);

        const webhookRes = await fetch(`${webhookUrl}?thread_id=${newThreadId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: sender, embeds: [embed] }),
        });

        if (!webhookRes.ok) {
          const err = await webhookRes.text();
          console.error("[chat] webhook to new thread failed:", webhookRes.status, err);
        }

        return NextResponse.json({ ok: true, threadId: newThreadId });
      }

      const threadErr = await threadRes.text();
      console.error("[chat] thread creation failed:", threadRes.status, threadErr);
    } else {
      console.warn("[chat] DISCORD_BOT_TOKEN not set, cannot create thread");
    }

    console.log("[chat] falling back to plain webhook without thread");
    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: sender, embeds: [embed] }),
    });

    if (!webhookRes.ok) {
      const err = await webhookRes.text();
      console.error("[chat] webhook fallback error:", webhookRes.status, err);
      return NextResponse.json({ error: "Failed to send to Discord" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, threadId: null });
  } catch (error) {
    console.error("[chat] message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
