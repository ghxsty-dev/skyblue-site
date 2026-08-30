"use client";

import Image from "next/image";
import { useApp } from "@/lib/context";
import { MessageIcon, CameraIcon, MailIcon } from "@/lib/icons";
import data from "@/data/contact.json";
import Reveal from "@/components/Reveal";

export default function ContactPage() {
  const { t, lang, theme } = useApp();
  const info = data[lang];

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.contactTitle}
            </span>
          </h2>
          <p>{t.contactDesc}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <Reveal>
        <div className="flex justify-center md:justify-start">
          <Image
            src="/iletisim.webp"
            alt="SkyBlue"
            width={512}
            height={512}
            className="rounded-2xl w-full max-w-[512px] h-auto"
          />
        </div>
        </Reveal>

        <Reveal delay={150}>
        <div>
          <Image src={theme === "light" ? "/logo2.webp" : "/logo.webp"} alt="SkyBlue" width={56} height={56} className="rounded-xl mb-4" />
          <h3 className="text-xl font-bold mb-4">{t.contactInfo}</h3>
          <p className="text-sm text-[var(--text2)] mb-6">{t.contactInfoDesc}</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="text-white shrink-0">
              <MessageIcon size={28} />
            </div>
            <div>
              <strong className="text-sm">{t.discord}</strong><br />
              <a href={info.discordUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
                discord.gg/F3uQ2fU8RV
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="text-white shrink-0">
              <CameraIcon size={28} />
            </div>
            <div>
              <strong className="text-sm">Instagram</strong><br />
              <a href={info.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
                {t.instagram}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="text-white shrink-0">
              <MailIcon size={28} />
            </div>
            <div>
              <strong className="text-sm">Email</strong><br />
              <a href={`mailto:${info.email}`} className="text-sm hover:text-[#59abfe] transition-colors">
                {info.email}
              </a>
            </div>
          </div>

        </div>
        </Reveal>
      </div>
    </div>
  );
}
