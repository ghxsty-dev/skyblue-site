import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sender, content, timestamp, threadId } = body;

    if (!sessionId || !content || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: "Discord webhook not configured" }, { status: 503 });
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
        body: JSON.stringify({
          username: sender,
          embeds: [embed],
        }),
      });

      if (!webhookRes.ok) {
        const err = await webhookRes.text();
        console.error("Discord webhook error:", err);
        return NextResponse.json({ error: "Failed to send to Discord" }, { status: 502 });
      }

      return NextResponse.json({ ok: true });
    }

    const threadName = `💬 ${sender} (${sessionId.slice(0, 6)})`;

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: sender,
        embeds: [embed],
        thread_name: threadName,
      }),
    });

    if (!webhookRes.ok) {
      const err = await webhookRes.text();
      console.error("Discord webhook error:", err);
      return NextResponse.json({ error: "Failed to send to Discord" }, { status: 502 });
    }

    const locationHeader = webhookRes.headers.get("location");
    let newThreadId: string | null = null;

    if (locationHeader) {
      const match = locationHeader.match(/\/threads\/(\d+)/);
      if (match) newThreadId = match[1];
    }

    if (!newThreadId) {
      const resBody = await webhookRes.json().catch(() => null);
      if (resBody?.id) newThreadId = resBody.id;
    }

    return NextResponse.json({ ok: true, threadId: newThreadId });
  } catch (error) {
    console.error("Chat message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
