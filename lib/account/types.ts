export type UserRole = "user" | "admin" | "moderator" | "rehber";

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Kullanıcı",
  admin: "Admin",
  moderator: "Moderatör",
  rehber: "Rehber",
};

export interface ProfileRecord {
  id: string;
  username: string;
  avatar_path: string | null;
  role: UserRole;
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
