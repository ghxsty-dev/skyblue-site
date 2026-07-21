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

  if (lang === "TR") {
    return NextResponse.json({ source: "fallback", reviews: fallback.TR.map((r) => ({ ...r, stars: 5 })) });
  }

  try {
    let discordReviews = await fetchDiscordReviews();
    if (discordReviews.length > 0) {
      discordReviews = await Promise.all(
        discordReviews.map(async (r) => ({
          ...r,
          text: await translateText(r.text),
        }))
      );
      return NextResponse.json({ source: "discord", reviews: discordReviews });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ source: "fallback", reviews: fallback.EN.map((r) => ({ ...r, stars: 5 })) });
}
