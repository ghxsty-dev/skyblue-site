"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "@/lib/context";
import { MessageIcon, CameraIcon, MailIcon } from "@/lib/icons";
import data from "@/data/contact.json";
import Reveal from "@/components/Reveal";

export default function ContactPage() {
  const { t, lang, theme } = useApp();
  const info = data[lang];
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const message = fd.get("message") as string;
    const subject = encodeURIComponent("SkyBlue İletişim - " + name);
    const body = encodeURIComponent("Ad: " + name + "\nE-posta: " + email + "\n\n" + message);
    window.location.href = `mailto:${info.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

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

          <div className="flex items-center gap-3 mb-8">
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              name="name"
              type="text"
              placeholder={t.formName}
              required
              className="px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text2)] outline-none focus:border-[#59abfe] transition-colors"
            />
            <input
              name="email"
              type="email"
              placeholder={t.formEmail}
              required
              className="px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text2)] outline-none focus:border-[#59abfe] transition-colors"
            />
            <textarea
              name="message"
              placeholder={t.formMessage}
              required
              rows={4}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text2)] outline-none focus:border-[#59abfe] transition-colors resize-none"
            />
            {sent ? (
              <p className="text-sm text-green-500 font-medium">{t.formSent}</p>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
              >
                {t.formSend}
              </button>
            )}
          </form>
        </div>
        </Reveal>
      </div>
    </div>
  );
}
