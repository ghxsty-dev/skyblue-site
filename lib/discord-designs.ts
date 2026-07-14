const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1366027066293620957";
const FORUM_CHANNEL_ID = "1516801626617413753";

export interface DesignImage {
  url: string;
  width: number;
  height: number;
}

export interface DesignPost {
  id: string;
  title: string;
  images: DesignImage[];
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

export async function fetchDiscordDesigns(): Promise<{ designs: DesignPost[]; debug: DiscordDebug }> {
  const token = process.env.DISCORD_BOT_TOKEN ?? "";
  if (!token) {
    return {
      designs: [],
      debug: { activeStatus: 0, guildActiveStatus: 0, archivedStatus: 0, activeCount: 0, guildActiveCount: 0, archivedCount: 0, forumId: FORUM_CHANNEL_ID },
    };
  }

  const active = await apiGet(`/channels/${FORUM_CHANNEL_ID}/threads/active`, token);
  const guildActive = await apiGet(`/guilds/${GUILD_ID}/threads/active`, token);
  const archived = await apiGet(`/channels/${FORUM_CHANNEL_ID}/threads/archived/public`, token);

  let allThreads: { id: string; name: string }[] = [];

  if (active.data?.threads) allThreads.push(...active.data.threads);

  if (guildActive.data?.threads) {
    for (const t of guildActive.data.threads) {
      if (t.parent_id === FORUM_CHANNEL_ID && !allThreads.find((x) => x.id === t.id)) {
        allThreads.push(t);
      }
    }
  }

  if (archived.data?.threads) {
    for (const t of archived.data.threads) {
      if (!allThreads.find((x) => x.id === t.id)) {
        allThreads.push(t);
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

  if (allThreads.length === 0) return { designs: [], debug };

  const results: DesignPost[] = [];
  const batch = allThreads.map(async (t) => {
    const images = await fetchThreadImages(t.id, token);
    results.push({ id: t.id, title: t.name, images });
  });

  await Promise.allSettled(batch);
  results.sort((a, b) => b.images.length - a.images.length);

  return { designs: results, debug };
}
