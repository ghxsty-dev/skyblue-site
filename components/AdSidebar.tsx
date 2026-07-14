"use client";

import { usePathname } from "next/navigation";
import AdUnit from "./AdUnit";

export default function AdSidebar() {
  const pathname = usePathname();
  const adPages = ["/designs", "/services", "/packages", "/reviews", "/contact"];
  if (!adPages.includes(pathname)) return null;

  return (
    <>
      <div className="absolute left-0 top-32 z-40 hidden xl:block w-[200px]">
        <AdUnit slot="1234567890" format="vertical" className="w-[160px] mx-auto" />
      </div>
      <div className="absolute right-0 top-32 z-40 hidden xl:block w-[200px]">
        <AdUnit slot="1234567891" format="vertical" className="w-[160px] mx-auto" />
      </div>
    </>
  );
}
