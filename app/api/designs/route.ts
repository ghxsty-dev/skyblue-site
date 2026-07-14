import { NextResponse } from "next/server";
import { fetchDiscordDesigns } from "@/lib/discord-designs";
import fallback from "@/data/designs.json";

let cached: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 300_000;

export async function GET() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    return NextResponse.json({
      source: "fallback",
      debug: "DISCORD_BOT_TOKEN not set",
      designs: fallback["EN"].map((d, i) => ({ id: `fb-${i}`, title: d.title, images: [] })),
    });
  }

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const { designs, debug } = await fetchDiscordDesigns();

  if (designs.length > 0) {
    cached = { data: { source: "discord", debug, designs }, timestamp: Date.now() };
    return NextResponse.json(cached.data);
  }

  return NextResponse.json({
    source: "fallback",
    debug,
    designs: fallback["EN"].map((d, i) => ({ id: `fb-${i}`, title: d.title, images: [] })),
  });
}
