import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  pressStart2P,
  vt323,
  silkscreen,
  pixelifySans,
  monocraft,
} from "../fonts";
import "../globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

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
    <html
      lang="tr"
      data-theme="dark"
      className={`${plusJakarta.variable} ${pressStart2P.variable} ${vt323.variable} ${silkscreen.variable} ${pixelifySans.variable} ${monocraft.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
