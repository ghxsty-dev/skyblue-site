import type { NextRequest } from "next/server";

export function isTrustedMutation(request: NextRequest, contentType?: "json" | "multipart"): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  if (origin && origin !== request.nextUrl.origin) return false;

  if (contentType) {
    const actual = request.headers.get("content-type") || "";
    const expected = contentType === "json" ? "application/json" : "multipart/form-data";
    if (!actual.toLowerCase().includes(expected)) return false;
  }

  return true;
}
