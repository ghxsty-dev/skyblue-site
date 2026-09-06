import { NextRequest, NextResponse } from "next/server";
import { fetchDiscordReviews } from "@/lib/discord";
import fallback from "@/data/reviews.json";

export const dynamic = "force-dynamic";

const translationCache = new Map<string, string>();
const TRANSLATION_CONCURRENCY = 3;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateText(text: string, targetLang: "tr" | "en"): Promise<string> {
  const normalized = text.trim();
  if (!normalized) return text;

  const cacheKey = `${targetLang}:${normalized}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  try {
    const { translate } = await import("@vitalets/google-translate-api");

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const res = await translate(normalized, { to: targetLang });
        const translated = res.text?.trim();
        if (translated) {
          if (translationCache.size >= 1000) {
            translationCache.delete(translationCache.keys().next().value as string);
          }
          translationCache.set(cacheKey, translated);
          return translated;
        }
      } catch {
        if (attempt < 2) await wait(250 * (attempt + 1));
      }
    }
  } catch {
    // Keep the original text when the translator cannot be loaded.
  }

  return text;
}

async function translateReviews<T extends { text: string }>(
  reviews: T[],
  targetLang: "tr" | "en",
): Promise<T[]> {
  const translated: T[] = [];

  for (let index = 0; index < reviews.length; index += TRANSLATION_CONCURRENCY) {
    const chunk = reviews.slice(index, index + TRANSLATION_CONCURRENCY);
    translated.push(
      ...(await Promise.all(
        chunk.map(async (review) => ({
          ...review,
          text: await translateText(review.text, targetLang),
        })),
      )),
    );

    if (index + TRANSLATION_CONCURRENCY < reviews.length) await wait(100);
  }

  return translated;
}

export async function GET(request: NextRequest) {
  const requestedLang = request.nextUrl.searchParams.get("lang")?.toUpperCase();
  const lang = requestedLang === "TR" ? "TR" : "EN";

  try {
    const discordReviews = await fetchDiscordReviews();
    if (discordReviews.length > 0) {
      const translatedReviews = await translateReviews(discordReviews, lang === "EN" ? "en" : "tr");
      const response = NextResponse.json({ source: "discord", reviews: translatedReviews });
      response.headers.set("Cache-Control", "private, no-store");
      return response;
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

  const response = NextResponse.json({ source: "fallback", reviews });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
