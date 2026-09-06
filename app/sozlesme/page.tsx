"use client";

import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

const sections = [
  {
    title: { tr: "1. Ödeme ve Başlangıç", en: "1. Payment and Start" },
    items: [
      { tr: "Ödeme anı, sözleşmesel proje başlangıcı olarak kabul edilir.", en: "The time of payment is considered the contractual start of the project." },
      { tr: "Müşterinin sipariş iletişim kanalında 'sözleşmeyi kabul ediyorum.' yazması, bu sözleşmenin müşteri tarafından kabul edildiği anlamına gelir.", en: "The contract is deemed accepted by the customer when they write 'I accept the contract.' in the order communication channel." },
      { tr: "SkyBlue, fiyat değişikliklerini yürürlük tarihiyle birlikte duyurur. Yeni fiyatlar yalnızca belirtilen tarihten sonra verilen siparişlerde geçerli olur; daha önce ödemesi alınmış siparişler fiyat değişikliğinden etkilenmez.", en: "SkyBlue announces price changes together with their effective date. New prices apply only to orders placed after that date; previously paid orders are not affected." },
    ],
  },
  {
    title: { tr: "2. İptal Koşulları", en: "2. Cancellation Terms" },
    items: [
      { tr: "Fiilî çalışmaya başlanmış ve müşteriye ilk taslak veya örnek gönderilmişse ödeme iade edilmez. Ayıplı veya eksik hizmetten doğan yasal haklar saklıdır.", en: "No refund is issued once work has commenced and the first draft or sample has been sent to the customer. Statutory rights arising from defective or incomplete service remain reserved." },
      { tr: "Ödeme tarihinden itibaren 7 takvim günü içinde fiilî çalışmaya başlanmaz ve müşteriye ilk taslak veya örnek gönderilmezse müşteri ücret iadesi talep edebilir.", en: "The customer may request a refund if work has not commenced and no first draft or sample has been sent within 7 calendar days of payment." },
      { tr: "SkyBlue ücretli bir siparişi iptal ederse müşterinin ödediği tutarın tamamı iade edilir. SkyBlue ücretsiz siparişleri iptal etme hakkına sahiptir.", en: "If SkyBlue cancels a paid order, the full amount paid by the customer is refunded. SkyBlue reserves the right to cancel free orders." },
      { tr: "SkyBlue nakit ödeme hariç Çekiliş, Ödül vb. tasarımları iptal etme hakkına sahiptir.", en: "SkyBlue reserves the right to cancel giveaway, prize, etc. designs except cash payments." },
      { tr: "SkyBlue istediği zaman sponsorluğu iptal edebilir.", en: "SkyBlue may cancel sponsorship at any time." },
    ],
  },
  {
    title: { tr: "3. Revizyon Hakları", en: "3. Revision Rights" },
    items: [
      { tr: "Müşteri, ilk taslak veya örneğin gönderildiği tarihten itibaren 14 takvim günü içinde sınırsız revizyon talep edebilir.", en: "The customer may request unlimited revisions within 14 calendar days from the date the first draft or sample is sent." },
      { tr: "Revizyonlar, sipariş sırasında kararlaştırılan tasarım kapsamı ve brief ile sınırlıdır. Farklı bir konsept, yeni bir tasarım veya sipariş kapsamını genişleten talepler revizyon sayılmaz ve ayrıca ücretlendirilebilir.", en: "Revisions are limited to the design scope and brief agreed at the time of order. Requests for a different concept, a new design, or an expanded scope are not considered revisions and may incur an additional fee." },
      { tr: "14 günlük sürenin sonunda kullanılmayan revizyon hakkı sona erer.", en: "Any unused revision right expires at the end of the 14-day period." },
    ],
  },
  {
    title: { tr: "4. Teslimat ve Boyutlar", en: "4. Delivery and Sizes" },
    items: [
      { tr: "SkyBlue, ödeme anından itibaren 120 saat içinde sipariş kapsamındaki ilk teslimi yapmakla yükümlüdür. Müşterinin revizyon talepleri için geçen süre bu teslim süresine dahil değildir.", en: "SkyBlue must provide the first delivery included in the order within 120 hours of payment. Time spent on customer revision requests is not included in this delivery period." },
      { tr: "Mücbir sebep halinde teslim süresi ödeme tarihinden itibaren en fazla 7 takvim gününe uzayabilir. SkyBlue, gecikmeyi ve nedenini müşteriye bildirir.", en: "In the event of force majeure, the delivery period may be extended to a maximum of 7 calendar days from the payment date. SkyBlue will notify the customer of the delay and its reason." },
      { tr: "Teslim formatı ve ölçüleri, sipariş sırasında kararlaştırılan hizmet kapsamına göre belirlenir.", en: "The delivery format and dimensions are determined by the service scope agreed at the time of order." },
    ],
  },
  {
    title: { tr: "5. Telif Hakları", en: "5. Copyright" },
    items: [
      { tr: "Müşteri tarafından sağlanan içeriklerin telif haklarından müşteri sorumludur.", en: "The customer is responsible for the copyright of content they provide." },
      { tr: "Ödemenin tamamlanması ve nihai tasarımın teslim edilmesiyle birlikte müşteriye; tasarımı kullanma, çoğaltma, yayımlama, dağıtma, dijital veya ticari ortamlarda sergileme ve uyarlama hakları devredilir. Devredilmesi hukuken mümkün olmayan manevi haklar bu kapsamın dışındadır.", en: "Upon full payment and final delivery, the rights to use, reproduce, publish, distribute, display in digital or commercial media, and adapt the design are transferred to the customer. Moral rights that cannot legally be transferred are excluded." },
      { tr: "Tasarımda kullanılan üçüncü taraf font, stok görsel, şablon veya diğer lisanslı materyaller kendi lisans koşullarına tabidir ve bu materyallerin mülkiyeti müşteriye devredilmez.", en: "Third-party fonts, stock images, templates, and other licensed materials used in the design remain subject to their respective license terms and are not transferred to the customer." },
      { tr: "Düzenlenebilir kaynak dosyaları yalnızca sipariş kapsamına açıkça dahil edilmişse teslim edilir.", en: "Editable source files are delivered only when explicitly included in the order scope." },
      { tr: "SkyBlue, tamamlanan ve kamuya açıklanmış projeyi portfolyo, sosyal medya ve tanıtım çalışmalarında referans olarak kullanabilir. Müşteri proje başlamadan önce yazılı gizlilik talebinde bulunmuş ve SkyBlue bu talebi kabul etmişse proje yayımlanmaz.", en: "SkyBlue may use completed projects that have been made public as references in its portfolio, social media, and promotional work. The project will not be published if the customer submitted a written confidentiality request before the project began and SkyBlue accepted it." },
    ],
  },
  {
    title: { tr: "6. Gizlilik", en: "6. Privacy" },
    items: [
      { tr: "Discord sunucusunda açılan destek biletleri, sipariş içerikleri ve müşteri iletişim bilgileri; müşterinin açık izni, hizmetin yerine getirilmesi için zorunlu hâller veya yasal yükümlülükler dışında üçüncü kişilerle paylaşılmaz.", en: "Discord support tickets, order contents, and customer contact details are not shared with third parties except with the customer's explicit consent, where necessary to provide the service, or where legally required." },
      { tr: "Portfolyo kullanımına ilişkin 5. bölüm hükümleri saklıdır; gizli yazışmalar ve kişisel bilgiler portfolyo içeriğine dahil edilmez.", en: "The portfolio provisions in Section 5 remain applicable; confidential correspondence and personal information are not included in portfolio content." },
    ],
  },
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
        <div className="py-2">
          {sections.map((section, si) => (
            <div key={si} className="mb-8">
              <h3 className="text-base font-bold text-[var(--text)] mb-3 pb-2 border-b border-[var(--border)]">
                {lang === "TR" ? section.title.tr : section.title.en}
              </h3>
              <div className="flex flex-col gap-3">
                {section.items.map((item, ii) => (
                  <div key={ii} className="flex gap-3 text-sm text-[var(--text2)] leading-relaxed">
                    <span className="text-[#59abfe] font-medium shrink-0">{si + 1}.{ii + 1}</span>
                    <span>{lang === "TR" ? item.tr : item.en}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-sm text-[var(--text2)] leading-relaxed">
            <p className="mb-3">
              {lang === "TR"
                ? "SkyBlue ve müşteriler bu sözleşmede yer alan şartları kabul ettiklerini beyan eder."
                : "SkyBlue and its customers declare that they accept the terms set forth in this contract."}
            </p>
            <p>
              {lang === "TR"
                ? "SkyBlue sözleşmede değişiklik yapabilir. Değişiklikler, yayımlandıkları tarihten sonra verilen siparişlerde geçerlidir; mevcut siparişlere, müşteri tarafından kabul edilen sözleşme sürümü uygulanır. SkyBlue Tasarım Hizmetleri | tasarımlarımız kısmından tasarımlarımıza ulaşabilirsiniz."
                : "SkyBlue may amend this contract. Amendments apply to orders placed after their publication date; existing orders remain subject to the contract version accepted by the customer. SkyBlue Design Services | You can view our designs in the designs section."}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
