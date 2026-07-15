import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AppProvider } from "@/lib/context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LangModal from "@/components/LangModal";
import SplashScreen from "@/components/SplashScreen";
import AdSidebar from "@/components/AdSidebar";
import OfflineGame from "@/components/OfflineGame";
import SWRegister from "@/components/SWRegister";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
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
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7679661881079802"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <AppProvider>
          <SWRegister />
          <SplashScreen />
          <OfflineGame />
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
