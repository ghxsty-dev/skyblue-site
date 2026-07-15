"use client";

import { useApp } from "@/lib/context";
import ServiceCategory from "@/components/ServiceCategory";

export default function DiscordPage() {
  const { lang } = useApp();

  return (
    <ServiceCategory
      cat="discord"
      desc={lang === "TR"
        ? "Tamamen kendi sunucunuza ait özel Discord botları."
        : "Custom Discord bots built entirely for your own server."}
    />
  );
}
