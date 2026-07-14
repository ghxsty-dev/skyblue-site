"use client";

import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

const TR = {
  title: "Gizlilik Politikası",
  updated: "Son Güncelleme: 15 Temmuz 2026",
  sections: [
    { h: "1. Giriş", p: "Web sitemize hoş geldiniz. Gizliliğiniz bizim için önemlidir ve kişisel bilgilerinizi korumaya kararlıyız. Bu Gizlilik Politikası, hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve verilerinizle ilgili seçeneklerinizi açıklar. Bu web sitesini kullanarak, bu Gizlilik Politikasında açıklanan uygulamaları kabul etmiş olursunuz." },
    { h: "2. Topladığımız Bilgiler", p: "Aşağıdaki türde bilgileri toplayabiliriz: Bizimle iletişime geçtiğinizde adınız, e-posta adresiniz veya mesajınız gibi gönüllü olarak sağladığınız bilgiler. IP adresiniz, tarayıcı türünüz, işletim sisteminiz, yönlendiren sayfalar ve cihaz bilgileri gibi teknik bilgiler. Ziyaret edilen sayfalar, oturum süresi ve web sitesi ile etkileşimler gibi kullanım verileri." },
    { h: "3. Bilgilerinizi Nasıl Kullanıyoruz", p: "Bilgilerinizi şu amaçlarla kullanıyoruz: Web sitesini işletmek ve bakımını yapmak. Sorularınıza yanıt vermek ve destek sağlamak. Web sitesi performansını ve kullanıcı deneyimini iyileştirmek. Web sitesi trafiğini ve kullanımını analiz etmek. Dolandırıcılığı önlemek ve güvenliği sağlamak. Yasal yükümlülüklere uymak." },
    { h: "4. Çerezler", p: "Bu web sitesi, işlevselliği artırmak, trafiği analiz etmek ve içeriği kişiselleştirmek için çerezler ve benzer teknolojiler kullanabilir. Çerezleri tarayıcı ayarlarınızdan yönetebilir veya devre dışı bırakabilirsiniz. Çerezler devre dışı bırakılırsa bazı özellikler düzgün çalışmayabilir." },
    { h: "5. Google AdSense", p: "Bu web sitesi, Google AdSense tarafından sağlanan reklamlar gösterebilir. Google ve ortakları, bu ve diğer web sitelerine yaptığınız önceki ziyaretlerinize dayanarak kişiselleştirilmiş reklamlar görüntülemek için çerezler kullanabilir. Avrupa Ekonomik Alanı (AEA), Birleşik Krallık veya İsviçre'de bulunan kullanıcılardan, kişiselleştirilmiş reklam çerezleri kullanılmadan önce izin istenebilir. Google'ın reklam uygulamaları hakkında daha fazla bilgi edinebilir ve tercihlerinizi Google'ın Reklam Ayarları üzerinden yönetebilirsiniz." },
    { h: "6. Analitik", p: "Ziyaretçilerin web sitesiyle nasıl etkileşime girdiğini daha iyi anlamak için analiz hizmetleri kullanabiliriz. Bu hizmetler anonim veya takma adlı kullanım bilgileri toplayabilir." },
    { h: "7. Veri Paylaşımı", p: "Kişisel bilgilerinizi satmıyoruz. Bilgileri yalnızca şu durumlarda paylaşabiliriz: Yasanın gerektirdiği durumlarda. Yasal haklarımızı korumak için gerekli olduğunda. Web sitesini işletmeye yardımcı olan güvenilir hizmet sağlayıcılarla çalışırken. Güvenlik veya dolandırıcılık önleme için gerektiğinde." },
    { h: "8. Veri Saklama", p: "Kişisel bilgileri, yalnızca bu Gizlilik Politikasında açıklanan amaçları yerine getirmek için gerekli olduğu sürece veya yürürlükteki yasaların gerektirdiği şekilde saklarız." },
    { h: "9. Haklarınız (GDPR)", p: "Avrupa Ekonomik Alanı'nda (AEA) bulunuyorsanız, şu haklara sahip olabilirsiniz: Kişisel verilerinize erişme. Yanlış bilgileri düzeltme. Verilerinizin silinmesini talep etme. İşlemeyi kısıtlama veya itiraz etme. Veri taşınabilirliği talep etme. İşleme izne dayalıysa izni geri çekme. Yerel veri koruma yetkilisine şikayette bulunma." },
    { h: "10. Veri Güvenliği", p: "Bilgilerinizi yetkisiz erişime, ifşaya, değiştirmeye veya imhaya karşı korumak için makul teknik ve organizasyonel önlemler uyguluyoruz. Ancak, İnternet üzerinden iletim tamamen güvenli değildir." },
    { h: "11. Üçüncü Taraf Hizmetleri", p: "Web sitemiz, üçüncü taraf web sitelerine bağlantılar içerebilir veya üçüncü taraf hizmetlerini kullanabilir. Bu üçüncü tarafların gizlilik uygulamalarından sorumlu değiliz. Herhangi bir kişisel bilgi sağlamadan önce gizlilik politikalarını incelemenizi öneririz." },
    { h: "12. Çocukların Gizliliği", p: "Bu web sitesi, yürürlükteki yasaların gerektirdiği yaşın altındaki çocuklar için tasarlanmamıştır ve çocuklardan bilerek kişisel bilgi toplamıyoruz." },
    { h: "13. Bu Politikadaki Değişiklikler", p: "Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Herhangi bir değişiklik, güncellenmiş revizyon tarihiyle birlikte bu sayfada yayınlanacaktır." },
    { h: "14. İletişim", p: "Bu Gizlilik Politikası veya kişisel verilerinizle ilgili herhangi bir sorunuz varsa, bu web sitesinde sağlanan iletişim bilgileri aracılığıyla bizimle iletişime geçebilirsiniz." },
  ],
};

const EN = {
  title: "Privacy Policy",
  updated: "Last Updated: July 15, 2026",
  sections: [
    { h: "1. Introduction", p: "Welcome to our website. Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data. By using this website, you agree to the practices described in this Privacy Policy." },
    { h: "2. Information We Collect", p: "We may collect the following types of information: Information you voluntarily provide, such as your name, email address, or message when contacting us. Technical information including your IP address, browser type, operating system, referring pages, and device information. Usage data, such as pages visited, session duration, and interactions with the website." },
    { h: "3. How We Use Your Information", p: "We use your information to: Operate and maintain the website. Respond to inquiries and provide support. Improve website performance and user experience. Analyze website traffic and usage. Prevent fraud and maintain security. Comply with legal obligations." },
    { h: "4. Cookies", p: "This website may use cookies and similar technologies to improve functionality, analyze traffic, and personalize content. You can manage or disable cookies through your browser settings. Some features may not function properly if cookies are disabled." },
    { h: "5. Google AdSense", p: "This website may display advertisements provided by Google AdSense. Google and its partners may use cookies to display personalized advertisements based on your previous visits to this and other websites. Users located in the European Economic Area (EEA), the United Kingdom, or Switzerland may be asked for consent before personalized advertising cookies are used. You can learn more about Google's advertising practices and manage your preferences through Google's Ads Settings." },
    { h: "6. Analytics", p: "We may use analytics services to better understand how visitors interact with the website. These services may collect anonymous or pseudonymous usage information." },
    { h: "7. Data Sharing", p: "We do not sell your personal information. We may share information only when: Required by law. Necessary to protect our legal rights. Working with trusted service providers that help operate the website. Required for security or fraud prevention." },
    { h: "8. Data Retention", p: "We retain personal information only for as long as necessary to fulfill the purposes described in this Privacy Policy or as required by applicable law." },
    { h: "9. Your Rights (GDPR)", p: "If you are located in the European Economic Area (EEA), you may have the right to: Access your personal data. Correct inaccurate information. Request deletion of your data. Restrict or object to processing. Request data portability. Withdraw consent where processing is based on consent. Lodge a complaint with your local data protection authority." },
    { h: "10. Data Security", p: "We implement reasonable technical and organizational measures to protect your information against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet is completely secure." },
    { h: "11. Third-Party Services", p: "Our website may contain links to third-party websites or use third-party services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing any personal information." },
    { h: "12. Children's Privacy", p: "This website is not intended for children under the age required by applicable law, and we do not knowingly collect personal information from children." },
    { h: "13. Changes to This Privacy Policy", p: "We may update this Privacy Policy from time to time. Any changes will be posted on this page together with the updated revision date." },
    { h: "14. Contact", p: "If you have any questions regarding this Privacy Policy or your personal data, you may contact us through the contact information provided on this website." },
  ],
};

export default function PrivacyPage() {
  const { lang } = useApp();
  const data = lang === "TR" ? TR : EN;

  return (
    <div className="page-inner max-w-3xl mx-auto">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {data.title}
            </span>
          </h2>
          <p className="text-xs text-[var(--text2)]">{data.updated}</p>
        </div>
      </Reveal>

      <div className="flex flex-col gap-6">
        {data.sections.map((s, i) => (
          <Reveal key={i} delay={i * 40}>
            <div className="card p-6">
              <h3 className="text-base font-bold text-[var(--text)] mb-2">{s.h}</h3>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{s.p}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
