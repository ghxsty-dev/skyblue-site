"use client";

import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

const items = [
  { tr: "Ödeme alındıktan sonra projeye başlanır.", en: "The project begins after payment is received." },
  { tr: "SkyBlue siparişi iptal etme hakkına sahiptir. (Ücretsiz paketlerde)", en: "SkyBlue reserves the right to cancel orders. (Free packages)" },
  { tr: "Müşteri tarafından sağlanan içeriklerin telif haklarından müşteri sorumludur.", en: "The customer is responsible for the copyright of content they provide." },
  { tr: "SkyBlue nakit ödeme hariç Çekiliş, Ödül vb. tasarımları iptal etme hakkına sahiptir.", en: "SkyBlue reserves the right to cancel giveaway, prize, etc. designs except cash payments." },
  { tr: "Müşteriler her tasarımda sınırsız revizyon hakkına sahiptir.", en: "Customers have unlimited revision rights on every design." },
  { tr: "Tasarımlarda logolar 1024x1024, 2048x2048 ve 4096x4096 boyutlarında teslim edilebilir.", en: "Logos can be delivered in 1024x1024, 2048x2048, and 4096x4096 sizes." },
  { tr: "Tasarımlarda bannerlar 1920x1080, 3840x2160 boyutlarında teslim edilebilir.", en: "Banners can be delivered in 1920x1080 and 3840x2160 sizes." },
  { tr: "Duyuru görseli, afiş vb. boyutları değiştirilemez ve sabittir.", en: "Announcement images, posters, etc. have fixed dimensions and cannot be changed." },
  { tr: "Tüm görsel tasarımlar PNG olarak teslim edilecektir.", en: "All visual designs will be delivered in PNG format." },
  { tr: "Tasarımın tüm mali hakları ödemenin tamamlanmasının ardından müşteriye devredilir.", en: "All financial rights to the design are transferred to the customer upon full payment." },
  { tr: "SkyBlue, tamamlanan projeyi portfolyo, sosyal medya ve tanıtım çalışmalarında referans olarak kullanabilir.", en: "SkyBlue may use the completed project as a reference in portfolio, social media, and promotional work." },
  { tr: "Proje başladıktan sonra müşteri tarafından iptal edilmesi halinde ödeme iade edilmez.", en: "If the customer cancels after the project has started, the payment will not be refunded." },
  { tr: "SkyBlue istediği zaman fiyatları değiştirme hakkına sahiptir.", en: "SkyBlue reserves the right to change prices at any time." },
  { tr: "Discord sunucusundan açılan bilet ve içerikleri üçüncü kişilerle paylaşılmaz.", en: "Tickets and their contents opened on the Discord server are not shared with third parties." },
  { tr: "SkyBlue proje başlangıcından itibaren 72 saat içerisinde projeyi teslim etmek zorundadır. (Mücbir sebepler durumunda 120 saate (5 gün) uzayabilir.)", en: "SkyBlue must deliver the project within 72 hours from the start. (May extend to 120 hours (5 days) in case of force majeure.)" },
  { tr: "SkyBlue istediği zaman sponsorluğu iptal edebilir.", en: "SkyBlue may cancel sponsorship at any time." },
];

export default function SozlesmePage() {
  const { lang } = useApp();

  return (
    <div className="page-inner max-w-2xl mx-auto">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {lang === "TR" ? "SkyBlue Sözleşme" : "SkyBlue Contract"}
            </span>
          </h2>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="card p-6">
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[var(--text2)] leading-relaxed">
                <span className="text-[#59abfe] shrink-0 mt-0.5">✦</span>
                <span>{lang === "TR" ? item.tr : item.en}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-sm text-[var(--text2)] leading-relaxed">
            <p className="mb-3">
              {lang === "TR"
                ? "SkyBlue ve müşteriler bu sözleşmede yer alan şartları kabul ettiklerini beyan eder."
                : "SkyBlue and its customers declare that they accept the terms set forth in this contract."}
            </p>
            <p>
              {lang === "TR"
                ? "SkyBlue sonradan sözleşmede değişiklik yapma hakkına sahiptir. SkyBlue Tasarım Hizmetleri | ⭐・tasarımlarımız kısmından tasarımlarımıza ulaşabilirsiniz."
                : "SkyBlue reserves the right to make changes to the contract at a later date. SkyBlue Design Services | You can view our designs in the ⭐・tasarımlarımız section."}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
