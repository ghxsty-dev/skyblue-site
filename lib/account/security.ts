import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";

function hmac(value: string, secret: string | undefined, name: string): string {
  if (!secret) throw new Error(`${name} environment variable is not set`);
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || null;
}

export function hashSignupIp(ip: string): string {
  return hmac(ip, process.env.IP_HASH_SECRET, "IP_HASH_SECRET");
}

export function normalizeLicenseCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashLicenseCode(code: string): string {
  return hmac(normalizeLicenseCode(code), process.env.PREMIUM_CODE_SECRET, "PREMIUM_CODE_SECRET");
}

export function hashDiscordCode(code: string): string {
  return hmac(code.toUpperCase().replace(/[^A-Z0-9]/g, ""), process.env.DISCORD_VERIFY_SECRET, "DISCORD_VERIFY_SECRET");
}

export function createLicenseCode(toolSlug: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  const payload = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  const segments = payload.match(/.{1,4}/g)?.join("-") || payload;
  const prefix = toolSlug === "minecraft-rank" ? "MCR" : "SKY";
  return `${prefix}-${segments}`;
}

export function createDiscordCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
