import { NextResponse } from "next/server";

const GUILD_ID = "1366027066293620957";

export async function GET() {
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${GUILD_ID}/widget.json`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.json({ presence_count: 0, member_count: 0 });
    }

    const data = await res.json();
    return NextResponse.json({
      presence_count: data.presence_count ?? 0,
      member_count: data.member_count ?? 0,
    });
  } catch {
    return NextResponse.json({ presence_count: 0, member_count: 0 });
  }
}
