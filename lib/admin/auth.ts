import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasAdminAccess, type UserRole } from "@/lib/account/types";

export async function isAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return hasAdminAccess((profile?.role as UserRole) || "user");
}
