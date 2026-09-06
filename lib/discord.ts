const DISCORD_API = "https://discord.com/api/v10";
const CHANNEL_ID = "1516801166627831949";
const MESSAGE_PAGE_SIZE = 100;
const MAX_MESSAGE_PAGES = 100;
const discordUserCache = new Map<string, DiscordUser>();

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

interface DiscordComponent {
  type?: number;
  content?: string;
  components?: DiscordComponent[];
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  fields?: { name?: string; value?: string; inline?: boolean }[];
  footer?: { text?: string };
  author?: { name?: string };
}

interface DiscordMessage {
  id: string;
  author: DiscordUser;
  content?: string;
  components?: DiscordComponent[];
  embeds?: DiscordEmbed[];
  mentions?: DiscordUser[];
  timestamp: string;
}

const CUSTOM_EMOJI_RE = /<a?:[^:]+:\d+>/g;
const MENTION_RE = /<@!?(\d+)>/;
const STAR_RE = /[\u2B50\u2605\u2606\u272D\u2728\uD83C\uDF1F]/gu;
const RATING_WORD_RE = /değerlendirme|review|rating|puan|skor|score|stars?/i;
const DATE_RE = /\d{1,4}[./-]\d{1,2}[./-]\d{2,4}/;

function stripMarkup(text: string): string {
  return text
    .replace(CUSTOM_EMOJI_RE, "")
    .replace(/<@!?\d+>/g, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isRatingLine(line: string): boolean {
  const customEmojis = line.match(CUSTOM_EMOJI_RE)?.length ?? 0;
  const stars = line.match(STAR_RE)?.length ?? 0;
  const hasRatingWord = RATING_WORD_RE.test(line);
  const compact = stripMarkup(line);

  if (hasRatingWord && (customEmojis > 0 || stars > 0 || /\b[1-5]\b/.test(compact))) {
    return true;
  }

  return (customEmojis > 0 || stars > 0) && compact.length <= 30;
}

function isFooterLine(line: string): boolean {
  const withoutMarkdown = line.replace(/^\*+|\*+$/g, "").trim();
  return /\s•\s/.test(withoutMarkdown) && (line.trim().startsWith("*") || DATE_RE.test(withoutMarkdown));
}

function isMetadataLine(line: string): boolean {
  return /^(?:m[üu]şteri|customer)(?:\s+(?:yorumu|review))?\s*:?[\s]*$/i.test(stripMarkup(line))
    || /^session\s*:/i.test(stripMarkup(line));
}

function cleanText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isRatingLine(line) && !isFooterLine(line) && !isMetadataLine(line))
    .filter((line) => !/^🔴\s*(?:\*\*)?(?:sohbet sonlandırıldı|conversation ended)/i.test(line))
    .map(stripMarkup)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMentionId(text: string): string {
  return text.match(MENTION_RE)?.[1] || "";
}

function extractMentionIds(text: string): string[] {
  return [...text.matchAll(/<@!?(\d+)>/g)].map((match) => match[1]);
}

function resolveMentionUser(
  message: DiscordMessage,
  id: string,
  resolvedUsers: Map<string, DiscordUser>,
): DiscordUser | undefined {
  const mentionedUser = message.mentions?.find((user) => user.id === id);
  if (mentionedUser) return mentionedUser;
  return resolvedUsers.get(id);
}

function resolveMentionName(
  message: DiscordMessage,
  id: string,
  resolvedUsers: Map<string, DiscordUser>,
): string {
  const mentionedUser = message.mentions?.find((user) => user.id === id) || resolvedUsers.get(id);
  if (mentionedUser) return mentionedUser.global_name || mentionedUser.username;
  return `@${id}`;
}

function extractCustomerAuthor(
  text: string,
  message: DiscordMessage,
  resolvedUsers: Map<string, DiscordUser>,
): string {
  const match = text.match(/(?:m[üu]şteri|customer)\s*:\s*([^\n]+)/i);
  if (!match) return "";

  const value = match[1].trim();
  const mentionId = extractMentionId(value);
  if (mentionId) return resolveMentionName(message, mentionId, resolvedUsers);

  return stripMarkup(value).replace(/[\u2B50\u2605\u2606\u272D\u2728\uD83C\uDF1F]/gu, "").trim();
}

function extractBulletAuthor(text: string): { author: string; date?: string } {
  const line = text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => isFooterLine(item));

  if (!line) return { author: "" };

  const parts = line.replace(/^\*+|\*+$/g, "").split("•").map((part) => part.trim());
  return { author: parts[0] || "", date: parts[1] || undefined };
}

function extractEmbedAuthor(embeds: DiscordEmbed[] = []): string {
  for (const embed of embeds) {
    const footer = embed.footer?.text;
    if (!footer) continue;

    const parts = footer.split("•").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 3) return parts[1];
    if (parts.length >= 2 && /m[üu]şteri|customer/i.test(parts[0])) return parts[1];
    if (parts.length >= 2 && DATE_RE.test(parts[1])) return parts[0];
    if (parts.length > 0) return parts[0];
  }

  for (const embed of embeds) {
    const title = embed.title ? stripMarkup(embed.title) : "";
    if (title && !RATING_WORD_RE.test(title) && !/m[üu]şteri|customer/i.test(title)) {
      return title;
    }
  }

  return "";
}

function extractComponentText(components: DiscordComponent[] = []): string[] {
  const text: string[] = [];

  for (const component of components) {
    if (component.content) text.push(component.content);
    if (component.components) text.push(...extractComponentText(component.components));
  }

  return text;
}

function extractEmbedText(embeds: DiscordEmbed[] = []): string[] {
  const text: string[] = [];

  for (const embed of embeds) {
    if (embed.description) text.push(embed.description);
    if (embed.fields) {
      for (const field of embed.fields) {
        if (field.value) text.push(field.value);
      }
    }

    if (!embed.description && !embed.fields?.some((field) => field.value)) {
      if (embed.title) text.push(embed.title);
    }
  }

  return text;
}

function extractMessageSources(message: DiscordMessage): string[] {
  return [
    message.content || "",
    ...extractComponentText(message.components),
    ...extractEmbedText(message.embeds),
  ].filter(Boolean);
}

function countStars(sources: string[]): number {
  for (const source of sources) {
    for (const line of source.split(/\r?\n/)) {
      const customEmojis = line.match(CUSTOM_EMOJI_RE)?.length ?? 0;
      const unicodeStars = line.match(STAR_RE)?.length ?? 0;

      if (customEmojis > 0 || unicodeStars > 0) {
        return Math.min(customEmojis + unicodeStars, 5);
      }

      if (RATING_WORD_RE.test(line)) {
        const rating = line.match(/\b([1-5])(?:\s*\/\s*5)?\b/);
        if (rating) return Number(rating[1]);
      }

      const compactRating = line.match(/^\s*([1-5])\s*\/\s*5\s*$/);
      if (compactRating) return Number(compactRating[1]);
    }
  }

  return 5;
}

function formatMessageDate(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString("tr-TR");
}

function parseReviewMessage(
  message: DiscordMessage,
  resolvedUsers: Map<string, DiscordUser>,
): DiscordReview | null {
  const sources = extractMessageSources(message);
  if (sources.length === 0) return null;

  const rawText = sources.join("\n");
  const text = cleanText(rawText);
  if (!text || /^(?:yorum bırakılmadı|no review was left)\.?$/i.test(text)) return null;

  const bulletAuthor = extractBulletAuthor(rawText);
  const mentionId = extractMentionId(rawText);
  const author = extractCustomerAuthor(rawText, message, resolvedUsers)
    || (mentionId ? resolveMentionName(message, mentionId, resolvedUsers) : "")
    || bulletAuthor.author
    || extractEmbedAuthor(message.embeds)
    || message.author.global_name
    || message.author.username;

  const avatarUser = mentionId
    ? resolveMentionUser(message, mentionId, resolvedUsers) || message.author
    : message.author;
  const avatar = avatarUser.avatar
    ? `https://cdn.discordapp.com/avatars/${avatarUser.id}/${avatarUser.avatar}.png?size=64`
    : undefined;

  return {
    text,
    author,
    stars: Math.max(1, Math.min(5, countStars(sources))),
    date: bulletAuthor.date || formatMessageDate(message.timestamp),
    avatar,
  };
}

async function resolveMentionedUsers(
  token: string,
  messages: DiscordMessage[],
): Promise<Map<string, DiscordUser>> {
  const resolvedUsers = new Map(discordUserCache);
  const missingIds = new Set<string>();

  for (const message of messages) {
    for (const user of message.mentions || []) {
      resolvedUsers.set(user.id, user);
      discordUserCache.set(user.id, user);
    }

    for (const id of extractMentionIds(extractMessageSources(message).join("\n"))) {
      if (!resolvedUsers.has(id)) missingIds.add(id);
    }
  }

  await Promise.all(
    [...missingIds].map(async (id) => {
      try {
        const res = await fetch(`${DISCORD_API}/users/${id}`, {
          headers: { Authorization: `Bot ${token}` },
          next: { revalidate: 3600 },
        });

        if (!res.ok) return;
        const user: DiscordUser = await res.json();
        resolvedUsers.set(id, user);
        discordUserCache.set(id, user);
      } catch {
        // Keep the mention ID fallback when Discord cannot resolve the user.
      }
    }),
  );

  return resolvedUsers;
}

async function fetchAllDiscordMessages(token: string): Promise<DiscordMessage[]> {
  const messages: DiscordMessage[] = [];
  let before: string | undefined;

  for (let page = 0; page < MAX_MESSAGE_PAGES; page += 1) {
    const params = new URLSearchParams({ limit: String(MESSAGE_PAGE_SIZE) });
    if (before) params.set("before", before);

    const res = await fetch(`${DISCORD_API}/channels/${CHANNEL_ID}/messages?${params.toString()}`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`[reviews] Discord messages fetch failed: ${res.status}`);
      break;
    }

    const batch: DiscordMessage[] = await res.json();
    if (batch.length === 0) break;

    messages.push(...batch);
    if (batch.length < MESSAGE_PAGE_SIZE) break;
    before = batch[batch.length - 1].id;
  }

  return messages;
}

export async function fetchDiscordReviews(): Promise<DiscordReview[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];

  try {
    const messages = await fetchAllDiscordMessages(token);
    const resolvedUsers = await resolveMentionedUsers(token, messages);
    return messages
      .map((message) => parseReviewMessage(message, resolvedUsers))
      .filter((review): review is DiscordReview => review !== null);
  } catch (error) {
    console.error("[reviews] Discord fetch error:", error);
    return [];
  }
}
