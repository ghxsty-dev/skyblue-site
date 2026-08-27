"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-xl font-bold text-[var(--text)]">Hizmetler yüklenirken hata oluştu</h2>
      <p className="text-sm text-[var(--text2)]">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
