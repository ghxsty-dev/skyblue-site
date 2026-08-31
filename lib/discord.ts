const DISCORD_API = "https://discord.com/api/v10";
const CHANNEL_ID = "1516801166627831949";

export interface DiscordReview {
  text: string;
  author: string;
  stars: number;
  date?: string;
  avatar?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
}

interface ComponentV2Content {
  type: 10;
  content: string;
}

interface ComponentV2Container {
  type: 17;
  components: ComponentV2Content[];
  color?: number;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
}

interface DiscordMessage {
  id: string;
  author: DiscordUser;
  content: string;
  components?: ComponentV2Container[];
  embeds?: DiscordEmbed[];
  timestamp: string;
}

function countStars(text: string): number {
  const customStar = /<:[^:]+:\d+>/g;
  const customMatches = text.match(customStar);
  if (customMatches) return Math.min(customMatches.length, 5);

  const unicodeStars = text.match(/[\u2B50\u2605\u2606\u272D\u2728\uD83C\uDF1F]/g);
  if (unicodeStars) return Math.min(unicodeStars.length, 5);

  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
  if (num >= 1 && num <= 5) return num;
  return 5;
}

function cleanText(text: string): string {
  return text
    .replace(/<:[^:]+:\d+>/g, "")
    .replace(/<@\d+>/g, "")
    .replace(/Müşteri:\s*/i, "")
    .replace(/Customer:\s*/i, "")
    .replace(/[\u2B50\u2605\u2606\u272D\u2728\uD83C\uDF1F]/g, "")
    .replace(/\*\*/g, "")
    .replace(/[()/\d]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMentionName(text: string): string {
  const mentionMatch = text.match(/<@(\d+)>/);
  if (mentionMatch) return mentionMatch[1];

  const customerMatch = text.match(/Müşteri:\s*<@(\d+)>/i) || text.match(/Customer:\s*<@(\d+)>/i);
  if (customerMatch) return customerMatch[1];

  return "";
}

function extractFromComponents(msg: DiscordMessage): { text: string; author: string; date?: string } | null {
  if (!msg.components || msg.components.length === 0) return null;

  const container = msg.components[0];
  if (container.type !== 17 || !container.components || container.components.length === 0) return null;

  const content = container.components.map((c) => c.content).join("\n");
  if (!content) return null;

  let author = "";
  let date: string | undefined;

  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const mentionId = extractMentionName(line);
    if (mentionId) {
      author = mentionId;
      break;
    }
  }

  const lastLine = lines[lines.length - 1];
  if (lastLine && lastLine.includes("•")) {
    const parts = lastLine.split("•").map((s) => s.trim());
    if (parts.length >= 2 && !author) {
      author = parts[0];
    }
    if (parts.length >= 2) {
      date = parts[1] || undefined;
    }
  }

  const text = cleanText(content);

  return { text, author, date };
}

function extractFromEmbed(embed: DiscordEmbed): { text: string; author: string; date?: string } | null {
  let author = "";
  let text = "";
  let date: string | undefined;

  if (embed.footer?.text) {
    const parts = embed.footer.text.split("•").map((s) => s.trim());
    if (parts.length >= 2) {
      author = parts[1];
      date = parts[2] || undefined;
    } else {
      author = parts[0];
    }
  }

  if (embed.fields) {
    for (const f of embed.fields) {
      const ln = f.name.toLowerCase().trim();
      if (ln.includes("puan") || ln.includes("rating") || ln.includes("skor") || ln.includes("star")) {
        // keep as is, stars counted from text
      }
    }
  }

  if (embed.description) {
    text = cleanText(embed.description);
  }

  if (!text) return null;
  if (!author && embed.title) author = embed.title.replace(/^[⭐✨💫🌟]\s*/, "");

  return { text, author, date };
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
    let text = "";
    let author = "";
    let stars = 5;
    let date: string | undefined;

    const extracted = extractFromComponents(msg);
    if (extracted) {
      text = extracted.text;
      author = extracted.author;
      date = extracted.date;
    }

    if (!text && msg.embeds && msg.embeds.length > 0) {
      const embedExtracted = extractFromEmbed(msg.embeds[0]);
      if (embedExtracted) {
        text = embedExtracted.text;
        author = embedExtracted.author;
        date = embedExtracted.date;
      }
    }

    if (!text && msg.content) {
      text = cleanText(msg.content);
      const mentionId = extractMentionName(msg.content);
      if (mentionId) author = mentionId;
    }

    if (!text) continue;

    stars = countStars(text);

    const avatarUrl = msg.author.avatar
      ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png?size=64`
      : undefined;

    reviews.push({ text, author: author || msg.author.global_name || msg.author.username, stars: Math.max(1, Math.min(5, stars)), date, avatar: avatarUrl });
  }

  return reviews.slice(0, 30);
}
