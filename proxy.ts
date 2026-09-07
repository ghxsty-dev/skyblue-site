import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://cdn.discordapp.com https://media.discordapp.net https://flagcdn.com https://*.googleusercontent.com; " +
    "connect-src 'self' https://discord.com https://api.github.com https://cdn.discordapp.com https://media.discordapp.net https://flagcdn.com; " +
    "frame-src https://www.youtube.com https://discord.com; " +
    "frame-ancestors 'none'"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let sessionChanged = false;
  const config = getSupabaseConfig();

  if (config) {
    const supabase = createServerClient(config.url, config.anonKey, {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          sessionChanged = cookiesToSet.length > 0;
          for (const cookie of cookiesToSet) request.cookies.set(cookie.name, cookie.value);
          response = NextResponse.next({ request });
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    });

    await supabase.auth.getUser();
  }

  const privatePath = ["/account", "/login", "/register", "/admin"].some(
    (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`)
  );
  if (sessionChanged || privatePath) response.headers.set("Cache-Control", "private, no-store");

  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.gif$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)"],
};
