const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";
const FORUM_CHANNEL_ID = "1516801626617413753";

export interface DesignImage {
  url: string;
  width: number;
  height: number;
}

export interface DesignTag {
  id: string;
  name: string;
  emojiName: string | null;
}

export interface DesignPost {
  id: string;
  title: string;
  images: DesignImage[];
  createdAt: number;
  tagIds: string[];
}

export interface DiscordDebug {
  activeStatus: number;
  guildActiveStatus: number;
  archivedStatus: number;
  activeCount: number;
  guildActiveCount: number;
  archivedCount: number;
  forumId: string;
}

const DISCORD_EPOCH = 1420070400000;

function snowflakeTimestamp(snowflake: string): number {
  return (Number(snowflake) >> 22) + DISCORD_EPOCH;
}

interface DiscordAttachment {
  url: string;
  width: number;
  height: number;
  content_type?: string;
}

interface DiscordEmbed {
  image?: { url: string; width: number; height: number };
  thumbnail?: { url: string; width: number; height: number };
}

interface DiscordMessage {
  id: string;
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
}

export interface DiscordDebug {
  activeStatus: number;
  guildActiveStatus: number;
  archivedStatus: number;
  activeCount: number;
  guildActiveCount: number;
  archivedCount: number;
  forumId: string;
}

async function apiGet(path: string, token: string) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  return { status: res.status, data: res.ok ? await res.json() : null };
}

function resizeUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "cdn.discordapp.com") {
      u.searchParams.set("width", "600");
      u.searchParams.set("quality", "80");
    }
    return u.toString();
  } catch {
    return url;
  }
}

function collectImages(msg: DiscordMessage): DesignImage[] {
  const images: DesignImage[] = [];
  if (msg.attachments) {
    for (const att of msg.attachments) {
      if (att.content_type?.startsWith("image/")) {
        images.push({ url: resizeUrl(att.url), width: att.width || 800, height: att.height || 600 });
      }
    }
  }
  if (msg.embeds) {
    for (const emb of msg.embeds) {
      if (emb.image?.url) images.push({ url: resizeUrl(emb.image.url), width: emb.image.width || 800, height: emb.image.height || 600 });
      if (emb.thumbnail?.url) images.push({ url: resizeUrl(emb.thumbnail.url), width: emb.thumbnail.width || 400, height: emb.thumbnail.height || 400 });
    }
  }
  return images;
}

async function fetchThreadImages(threadId: string, token: string): Promise<DesignImage[]> {
  const { data } = await apiGet(`/channels/${threadId}/messages?limit=10`, token);
  if (!data) return [];
  const messages: DiscordMessage[] = data;
  const images: DesignImage[] = [];
  for (const msg of messages) images.push(...collectImages(msg));
  return images;
}

export async function fetchDiscordDesigns(): Promise<{ designs: DesignPost[]; debug: DiscordDebug; availableTags: DesignTag[] }> {
  const token = process.env.DISCORD_BOT_TOKEN ?? "";
  if (!token) {
    return {
      designs: [],
      availableTags: [],
      debug: { activeStatus: 0, guildActiveStatus: 0, archivedStatus: 0, activeCount: 0, guildActiveCount: 0, archivedCount: 0, forumId: FORUM_CHANNEL_ID },
    };
  }

  const active = await apiGet(`/channels/${FORUM_CHANNEL_ID}/threads/active`, token);
  const guildActive = await apiGet(`/guilds/${GUILD_ID}/threads/active`, token);
  const archived = await apiGet(`/channels/${FORUM_CHANNEL_ID}/threads/archived/public`, token);
  const channelRes = await apiGet(`/channels/${FORUM_CHANNEL_ID}`, token);

  let availableTags: DesignTag[] = [];
  if (channelRes.data?.available_tags) {
    availableTags = channelRes.data.available_tags.map((t: any) => ({
      id: t.id,
      name: t.name,
      emojiName: t.emoji_name ?? null,
    }));
  }

  let allThreads: { id: string; name: string; last_message_id: string | null; applied_tags: string[] }[] = [];

  function mapThread(t: any) {
    return { id: t.id, name: t.name, last_message_id: t.last_message_id ?? null, applied_tags: t.applied_tags ?? [] };
  }

  if (active.data?.threads) allThreads.push(...active.data.threads.map(mapThread));

  if (guildActive.data?.threads) {
    for (const t of guildActive.data.threads) {
      if (t.parent_id === FORUM_CHANNEL_ID && !allThreads.find((x) => x.id === t.id)) {
        allThreads.push(mapThread(t));
      }
    }
  }

  if (archived.data?.threads) {
    for (const t of archived.data.threads) {
      if (!allThreads.find((x) => x.id === t.id)) {
        allThreads.push(mapThread(t));
      }
    }
  }

  const debug: DiscordDebug = {
    activeStatus: active.status,
    guildActiveStatus: guildActive.status,
    archivedStatus: archived.status,
    activeCount: active.data?.threads?.length ?? 0,
    guildActiveCount: guildActive.data?.threads?.filter((t: any) => t.parent_id === FORUM_CHANNEL_ID).length ?? 0,
    archivedCount: archived.data?.threads?.length ?? 0,
    forumId: FORUM_CHANNEL_ID,
  };

  if (allThreads.length === 0) return { designs: [], debug, availableTags };

  function isBanner(images: DesignImage[]) {
    return images.some((img) => {
      return (
        (img.width === 1920 && img.height === 1080) ||
        (img.width === 2160 && img.height === 1440) ||
        (img.width === 3840 && img.height === 2160)
      );
    });
  }

  const results: DesignPost[] = [];
  const batch = allThreads.map(async (t) => {
    const images = await fetchThreadImages(t.id, token);
    const ts = t.last_message_id ? snowflakeTimestamp(t.last_message_id) : snowflakeTimestamp(t.id);
    results.push({ id: t.id, title: t.name, images, createdAt: ts, tagIds: t.applied_tags });
  });

  await Promise.allSettled(batch);
  results.sort((a, b) => {
    const aBanner = isBanner(a.images) ? 0 : 1;
    const bBanner = isBanner(b.images) ? 0 : 1;
    if (aBanner !== bBanner) return aBanner - bBanner;
    return b.createdAt - a.createdAt;
  });

  return { designs: results, debug, availableTags };
}
