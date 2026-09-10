import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/account/session";

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
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagmanager.com https://challenges.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://cdn.discordapp.com https://media.discordapp.net https://flagcdn.com https://*.googleusercontent.com https://*.supabase.co https://*.googlesyndication.com https://googleads.g.doubleclick.net; " +
    "connect-src 'self' https://discord.com https://api.github.com https://cdn.discordapp.com https://media.discordapp.net https://flagcdn.com https://challenges.cloudflare.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google; " +
    "frame-src https://www.youtube.com https://discord.com https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://*.googlesyndication.com; " +
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

    const guardedPath = ["/account", "/admin"].some(
      (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`)
    );
    if (guardedPath) {
      // Şifre değişikliğiyle iptal edilmiş oturumları kapıdan çevir.
      const { user, stale } = await getSessionUser(supabase);
      if (stale || !user) {
        if (stale) await supabase.auth.signOut().catch(() => {});
        const loginUrl = new URL("/login", request.url);
        const redirect = addSecurityHeaders(NextResponse.redirect(loginUrl));
        redirect.headers.set("Cache-Control", "private, no-store");
        return redirect;
      }
    } else {
      await supabase.auth.getUser();
    }
  }

  const privatePath = ["/account", "/login", "/register", "/forgot-password", "/admin"].some(
    (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`)
  );
  if (sessionChanged || privatePath) response.headers.set("Cache-Control", "private, no-store");

  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.gif$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)"],
};
