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
      return NextResponse.json({ error: "DISCORD_WEBHOOK_URL ayarlı değil", code: "NO_WEBHOOK" }, { status: 503 });
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
      const url = `${webhookUrl}?thread_id=${threadId}`;
      const webhookRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: sender, embeds: [embed] }),
      });

      const resText = await webhookRes.text();
      if (!webhookRes.ok) {
        console.error("[chat] webhook to thread failed:", webhookRes.status, resText);
        return NextResponse.json({ error: `Webhook hatası: ${webhookRes.status}`, detail: resText }, { status: 502 });
      }

      return NextResponse.json({ ok: true, threadId });
    }

    if (botToken) {
      const threadRes = await fetch(`${DISCORD_API}/channels/${CHAT_CHANNEL_ID}/threads`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `💬 ${sender} (${sessionId.slice(0, 6)})`,
          auto_archive_duration: 1440,
        }),
      });

      if (threadRes.ok) {
        const threadData = await threadRes.json();
        const newThreadId = threadData.id;

        const url = `${webhookUrl}?thread_id=${newThreadId}`;
        const webhookRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: sender, embeds: [embed] }),
        });

        const resText = await webhookRes.text();
        if (!webhookRes.ok) {
          console.error("[chat] webhook to new thread failed:", webhookRes.status, resText);
          return NextResponse.json({ error: `Webhook hatası: ${webhookRes.status}`, detail: resText }, { status: 502 });
        }

        return NextResponse.json({ ok: true, threadId: newThreadId });
      }

      const errText = await threadRes.text();
      console.error("[chat] thread creation failed:", threadRes.status, errText);
    }

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: sender, embeds: [embed] }),
    });

    const resText = await webhookRes.text();
    if (!webhookRes.ok) {
      console.error("[chat] webhook fallback failed:", webhookRes.status, resText);
      return NextResponse.json({ error: `Webhook hatası: ${webhookRes.status}`, detail: resText }, { status: 502 });
    }

    return NextResponse.json({ ok: true, threadId: null });
  } catch (error) {
    console.error("[chat] message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
