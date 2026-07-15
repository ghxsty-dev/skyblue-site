import { NextRequest, NextResponse } from "next/server";
import { fetchDiscordReviews } from "@/lib/discord";
import fallback from "@/data/reviews.json";

async function translateText(text: string): Promise<string> {
  try {
    const { translate } = await import("@vitalets/google-translate-api");
    const res = await translate(text, { from: "tr", to: "en" });
    return res.text;
  } catch {
    return text;
  }
}

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") === "TR" ? "TR" : "EN";

  try {
    let discordReviews = await fetchDiscordReviews();
    if (discordReviews.length > 0) {
      if (lang === "EN") {
        discordReviews = await Promise.all(
          discordReviews.map(async (r) => ({
            ...r,
            text: await translateText(r.text),
          }))
        );
      }
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
