export type UserRole = "user" | "kurucu" | "bas-gelirtici" | "gelirtici" | "k-gelirtici" | "moderator" | "rehber";

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Kullanıcı",
  kurucu: "Kurucu",
  "bas-gelirtici": "Baş Geliştirici",
  gelirtici: "Geliştirici",
  "k-gelirtici": "K. Geliştirici",
  moderator: "Moderatör",
  rehber: "Rehber",
};

export const ROLE_ADMIN_LEVELS: Record<UserRole, number> = {
  kurucu: 100,
  "bas-gelirtici": 80,
  gelirtici: 60,
  "k-gelirtici": 40,
  moderator: 20,
  rehber: 10,
  user: 0,
};

export function hasAdminAccess(role: UserRole): boolean {
  return ROLE_ADMIN_LEVELS[role] >= 40;
}

export interface ProfileRecord {
  id: string;
  username: string;
  avatar_path: string | null;
  role: UserRole;
  banned: boolean;
  signup_ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolEntitlement {
  tool_slug: string;
  expires_at: string;
}

export interface DiscordLink {
  discord_user_id: string;
  discord_username: string;
  discord_avatar: string | null;
  verified_at: string;
}

export function avatarApiUrl(profile: Pick<ProfileRecord, "id" | "avatar_path" | "updated_at">): string {
  if (!profile.avatar_path) return "/process-logo-blue.webp";
  return `/api/users/avatar/${profile.id}?v=${encodeURIComponent(profile.updated_at)}`;
}
