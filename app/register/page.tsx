import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/account/AuthForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Hesap Oluştur",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { user } = await getSessionUser(supabase);
    if (user) redirect("/account");
  }
  return <div className="page-inner account-auth-page"><AuthForm mode="register" /></div>;
}
