import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Image
        src="/hata.png"
        alt="404"
        width={400}
        height={400}
        className="w-full max-w-[400px] h-auto"
        priority
      />
    </div>
  );
}
