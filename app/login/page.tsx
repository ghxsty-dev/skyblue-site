import type { Metadata } from "next";
import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <div className="page-inner account-auth-page"><AuthForm mode="login" /></div>;
}
