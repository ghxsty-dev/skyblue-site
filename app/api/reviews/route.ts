import { NextRequest, NextResponse } from "next/server";
import { fetchDiscordReviews } from "@/lib/discord";
import fallback from "@/data/reviews.json";

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") === "TR" ? "TR" : "EN";

  try {
    const discordReviews = await fetchDiscordReviews();
    if (discordReviews.length > 0) {
      return NextResponse.json({ source: "discord", reviews: discordReviews });
    }
  } catch {
    // fallback
  }

  const reviews = fallback[lang].map((r) => ({
    text: r.text,
    author: r.author,
    role: r.role,
    stars: 5,
  }));

  return NextResponse.json({ source: "fallback", reviews });
}
