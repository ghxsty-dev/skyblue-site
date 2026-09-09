import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/account/session";
import { hasAdminAccess, type UserRole } from "@/lib/account/types";

export async function isAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { user, stale } = await getSessionUser(supabase);
  if (!user || stale) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return hasAdminAccess((profile?.role as UserRole) || "user");
}
