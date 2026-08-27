export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="text-6xl">🔍</div>
      <h2 className="text-xl font-bold text-[var(--text)]">Sayfa Bulunamadı</h2>
      <p className="text-sm text-[var(--text2)]">Aradığınız sayfa mevcut değil.</p>
      <a
        href="/"
        className="px-4 py-2 rounded-lg bg-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  );
}
