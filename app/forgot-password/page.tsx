import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="page-inner account-narrow-page">
      <Link href="/login" className="account-back-link">← Giriş yap</Link>
      <header><span>Hesap</span><h1>Şifremi Unuttum</h1><p>Discord hesabın bağlıysa sıfırlama kodu DM olarak gelir.</p></header>
      <ForgotPasswordForm />
    </div>
  );
}
