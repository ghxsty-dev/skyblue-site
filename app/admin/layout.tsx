import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel | SkyBlue",
  description: "SkyBlue yönetim paneli",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="dark">
      <body style={{ fontFamily: "var(--font-sans), sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
