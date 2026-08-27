"use client";

import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

const TR = {
  title: "Hakkımızda",
  sections: [
    {
      h: "Biz Kimiz?",
      p: "SkyBlue, dijital dünyada markaların ihtiyaç duyduğu profesyonel tasarım hizmetlerini sunan genç ve dinamik bir ekiptir. Logo tasarımı, kurumsal kimlik, web tasarımı ve daha birçok alanda müşterilerimize yaratıcı ve işlevsel çözümler üretiyoruz. Amacımız, her projede estetik ve kaliteyi bir arada sunarak müşterilerimizin dijital dünyada fark edilmesini sağlamaktır.",
    },
    {
      h: "Ekibimiz",
      p: "SkyBlue ekibi, tasarım ve teknoloji alanlarında uzman profesyonellerden oluşmaktadır. Her bir projede titizlikle çalışan ekibimiz, müşteri memnuniyetini ön planda tutarak en iyi sonuçları elde etmeye odaklanmaktadır. Yaratıcı bakış açımız ve teknik yetkinliğimizle, müşterilerimizin beklentilerinin ötesine geçmeyi hedefliyoruz.",
    },
    {
      h: "Tarihçemiz",
      p: "SkyBlue, tasarım tutkusuyla yola çıkan bir ekip tarafından kuruldu. Küçük bir atölye olarak başladığımız yolculuğumuzda, zamanla büyüyerek geniş bir müşteri kitlesine ulaştık. Her projede kendimizi geliştirmeye ve yenilikçi çözümler üretmeye devam ediyoruz. Bugün, ulusal ve uluslararası birçok markaya hizmet veriyoruz.",
    },
    {
      h: "Değerlerimiz & Vizyonumuz",
      p: "Değerlerimiz: Kalite, yaratıcılık, şeffaflık ve müşteri memnuniyeti. Her projede bu değerleri temel alarak hareket ediyoruz. Vizyonumuz: Dijital dünyada tasarım standartlarını yükselterek, markaların éxito elde etmesine katkı sağlamak. Sürekli öğrenme ve gelişim felsefesiyle, sektöre yön vermeye devam etmeyi hedefliyoruz.",
    },
  ],
};

const EN = {
  title: "About Us",
  sections: [
    {
      h: "Who Are We?",
      p: "SkyBlue is a young and dynamic team providing professional design services that brands need in the digital world. We produce creative and functional solutions for our customers in many areas such as logo design, corporate identity, web design and more. Our goal is to ensure that our customers stand out in the digital world by presenting aesthetics and quality together in every project.",
    },
    {
      h: "Our Team",
      p: "The SkyBlue team consists of professionals specialized in design and technology. Working meticulously on every project, our team focuses on achieving the best results by prioritizing customer satisfaction. With our creative perspective and technical competence, we aim to go beyond our customers' expectations.",
    },
    {
      h: "Our History",
      p: "SkyBlue was founded by a team with a passion for design. Starting our journey as a small studio, we have grown over time and reached a wide customer base. We continue to improve ourselves and produce innovative solutions in every project. Today, we serve many national and international brands.",
    },
    {
      h: "Our Values & Vision",
      p: "Our values: Quality, creativity, transparency and customer satisfaction. We act based on these values in every project. Our vision: To contribute to the success of brands by raising design standards in the digital world. With our philosophy of continuous learning and development, we aim to continue leading the sector.",
    },
  ],
};

export default function AboutPage() {
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
