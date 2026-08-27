"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

export default function SubCategoryDetail() {
  const { lang } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace("/services/design");
  }, [router]);

  return (
    <div className="page-inner text-center py-20">
      <p className="text-[var(--text2)]">{lang === "TR" ? "Yönlendiriliyorsunuz..." : "Redirecting..."}</p>
    </div>
  );
}
