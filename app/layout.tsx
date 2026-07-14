import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LangModal from "@/components/LangModal";
import SplashScreen from "@/components/SplashScreen";
import AdSidebar from "@/components/AdSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyBlue Design",
  description: "Professional design services by SkyBlue",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <SplashScreen />
          <div className="relative">
            <Nav />
            <AdSidebar />
            <main>{children}</main>
            <Footer />
          </div>
          <LangModal />
        </AppProvider>
      </body>
    </html>
  );
}
