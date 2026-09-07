import type { Metadata } from "next";
import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = {
  title: "Hesap Oluştur",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <div className="page-inner account-auth-page"><AuthForm mode="register" /></div>;
}
