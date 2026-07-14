import { NextResponse } from "next/server";
import { fetchDiscordDesigns } from "@/lib/discord-designs";
import fallback from "@/data/designs.json";

export async function GET() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    return NextResponse.json({
      source: "fallback",
      debug: "DISCORD_BOT_TOKEN not set",
      designs: fallback["EN"].map((d, i) => ({ id: `fb-${i}`, title: d.title, images: [] })),
    });
  }

  const { designs, debug } = await fetchDiscordDesigns();

  if (designs.length > 0) {
    return NextResponse.json({ source: "discord", debug, designs });
  }

  return NextResponse.json({
    source: "fallback",
    debug,
    designs: fallback["EN"].map((d, i) => ({ id: `fb-${i}`, title: d.title, images: [] })),
  });
}
