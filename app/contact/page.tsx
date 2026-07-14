"use client";

import Image from "next/image";
import { useApp } from "@/lib/context";
import { MessageIcon, CameraIcon, MailIcon } from "@/lib/icons";
import data from "@/data/contact.json";

export default function ContactPage() {
  const { t, lang, theme } = useApp();
  const info = data[lang];

  return (
    <div className="page-inner">
      <div className="section-header">
        <h2>
          <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
            {t.contactTitle}
          </span>
        </h2>
        <p>{t.contactDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="flex justify-center md:justify-start">
          <Image
            src="/iletisim.png"
            alt="SkyBlue"
            width={512}
            height={512}
            className="rounded-2xl w-full max-w-[512px] h-auto"
          />
        </div>

        <div>
          <Image src={theme === "light" ? "/logo2.png" : "/logo.png"} alt="SkyBlue" width={56} height={56} className="rounded-xl mb-4" />
          <h3 className="text-xl font-bold mb-4">{t.contactInfo}</h3>
          <p className="text-sm text-[var(--text2)] mb-6">{t.contactInfoDesc}</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
              <MessageIcon size={20} />
            </div>
            <div>
              <strong className="text-sm">{t.discord}</strong><br />
              <a href={info.discordUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
                discord.gg/DRnxEXCQU
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
              <CameraIcon size={20} />
            </div>
            <div>
              <strong className="text-sm">Instagram</strong><br />
              <a href={info.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
                {t.instagram}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
              <MailIcon size={20} />
            </div>
            <div>
              <strong className="text-sm">Email</strong><br />
              <span className="text-sm">{info.email}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <a
              href={info.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg2)] flex items-center justify-center text-[var(--text2)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#97cdf2] hover:to-[#59abfe] hover:text-white hover:border-transparent hover:-translate-y-0.5"
            >
              <MessageIcon size={20} />
            </a>
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg2)] flex items-center justify-center text-[var(--text2)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#97cdf2] hover:to-[#59abfe] hover:text-white hover:border-transparent hover:-translate-y-0.5"
            >
              <CameraIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
