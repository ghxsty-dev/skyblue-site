import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  pressStart2P,
  vt323,
  silkscreen,
  pixelifySans,
  monocraft,
} from "./fonts";
import "./globals.css";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProvider } from "@/lib/context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LangModal from "@/components/LangModal";
import SplashScreen from "@/components/SplashScreen";
import AdSidebar from "@/components/AdSidebar";
import OfflineGameWrapper from "@/components/OfflineGameWrapper";
import SWRegister from "@/components/SWRegister";
import LangAttr from "@/components/LangAttr";
import LiveChat from "@/components/LiveChat";
import CookieConsent from "@/components/CookieConsent";
import BackToTop from "@/components/BackToTop";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SkyBlue Tasarım Hizmetleri",
    template: "%s | SkyBlue Tasarım Hizmetleri",
  },
  description: "SkyBlue Tasarım Hizmetleri resmi sitesi, Fiyat bilgisi ve iletişim için buraya bakabilirsiniz.",
  icons: { icon: "/logo.webp" },
  metadataBase: new URL("https://skyblue.tr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SkyBlue Tasarım Hizmetleri",
    description: "Profesyonel tasarım hizmetleri: logo, banner, Discord bot geliştirme, Minecraft tasarımları.",
    url: "https://skyblue.tr",
    siteName: "SkyBlue Tasarım Hizmetleri",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://skyblue.tr/skyblue-design.webp",
        alt: "SkyBlue Tasarım Hizmetleri",
        width: 1200,
        height: 630,
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyBlue Tasarım Hizmetleri",
    description: "Profesyonel tasarım hizmetleri: logo, banner, Discord bot geliştirme, Minecraft tasarımları.",
    images: ["https://skyblue.tr/skyblue-design.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      className={`${plusJakarta.variable} ${pressStart2P.variable} ${vt323.variable} ${silkscreen.variable} ${pixelifySans.variable} ${monocraft.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://skyblue.tr/#organization",
                "name": "SkyBlue Tasarım Hizmetleri",
                "url": "https://skyblue.tr",
                "logo": "https://skyblue.tr/logo.webp",
                "description": "Profesyonel tasarım hizmetleri: logo, banner, Discord bot geliştirme, Minecraft tasarımları.",
                "sameAs": [
                  "https://www.instagram.com/skyblue.designer",
                  "https://discord.gg/F3uQ2fU8RV",
                  "https://youtube.com/@skyblue",
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "email": "kivancghxsty@gmail.com",
                  "availableLanguage": ["Turkish", "English"],
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://skyblue.tr/#website",
                "name": "SkyBlue Tasarım Hizmetleri",
                "url": "https://skyblue.tr",
                "publisher": { "@id": "https://skyblue.tr/#organization" },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://skyblue.tr/designs?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Service",
                "@id": "https://skyblue.tr/#service-discord",
                "name": "Discord Bot Geliştirme",
                "provider": { "@id": "https://skyblue.tr/#organization" },
                "description": "Profesyonel Discord bot geliştirme hizmetleri. Moderasyon, otomasyon ve özel sistemler.",
                "areaProvided": "TR",
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": "120",
                  "highPrice": "200",
                  "priceCurrency": "TRY",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Service",
                "@id": "https://skyblue.tr/#service-design",
                "name": "Tasarım Hizmetleri",
                "provider": { "@id": "https://skyblue.tr/#organization" },
                "description": "Logo, banner, kurumsal kimlik ve özel tasarım çözümleri.",
                "areaProvided": "TR",
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": "7.5",
                  "highPrice": "300",
                  "priceCurrency": "TRY",
                },
              },
            ]),
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7679661881079802"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <AppProvider>
          <LangAttr />
          <SWRegister />
          <SplashScreen />
          <OfflineGameWrapper />
          <div className="relative">
            <Nav />
            <AdSidebar />
            <main>{children}</main>
            <Footer />
          </div>
          <LangModal />
          <LiveChat />
          <CookieConsent />
          <BackToTop />
        </AppProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
