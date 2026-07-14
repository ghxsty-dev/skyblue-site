const DISCORD_API = "https://discord.com/api/v10";
const CHANNEL_ID = "1516801166627831949";

export interface DiscordReview {
  text: string;
  author: string;
  stars: number;
  date?: string;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
}

interface DiscordMessage {
  id: string;
  author: DiscordUser;
  embeds: DiscordEmbed[];
}

function countStars(text: string): number {
  const matches = text.match(/[\u2B50\u2605\u2606\u272D\u2728\uD83C\uDF1F]/g);
  if (matches) return Math.min(matches.length, 5);
  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
  if (num >= 1 && num <= 5) return num;
  return 5;
}

function cleanText(text: string): string {
  return text.replace(/[\u2B50\u2605\u2606\u272D\u2728\uD83C\uDF1F]/g, "").replace(/\*\*/g, "").replace(/[()/\d]/g, "").replace(/\s+/g, " ").trim();
}

function parseFooter(text: string): { author: string; date?: string } {
  const parts = text.split("•").map((s) => s.trim());
  if (parts.length >= 2) {
    const author = parts[1];
    const date = parts[2] || undefined;
    return { author, date };
  }
  return { author: text };
}

export async function fetchDiscordReviews(): Promise<DiscordReview[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];

  const url = `${DISCORD_API}/channels/${CHANNEL_ID}/messages?limit=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bot ${token}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];

  const messages: DiscordMessage[] = await res.json();
  const reviews: DiscordReview[] = [];

  for (const msg of messages) {
    if (!msg.embeds || msg.embeds.length === 0) continue;

    for (const embed of msg.embeds) {
      let author = "";
      let text = "";
      let stars = 5;
      let date: string | undefined;

      if (embed.footer?.text) {
        const parsed = parseFooter(embed.footer.text);
        author = parsed.author;
        date = parsed.date;
      }

      if (embed.fields) {
        for (const f of embed.fields) {
          const ln = f.name.toLowerCase().trim();
          if (ln.includes("puan") || ln.includes("rating") || ln.includes("skor") || ln.includes("star")) {
            stars = countStars(f.value);
          }
        }
      }

      if (!text && embed.description) {
        text = cleanText(embed.description);
      }

      if (!text) continue;
      if (!author) author = msg.author.global_name || msg.author.username;

      reviews.push({ text, author, stars: Math.max(1, Math.min(5, stars)), date });
    }
  }

  return reviews.slice(0, 30);
}
