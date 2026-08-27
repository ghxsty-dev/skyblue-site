"use client";

import dynamic from "next/dynamic";

const OfflineGame = dynamic(() => import("./OfflineGame"), { ssr: false });

export default function OfflineGameWrapper() {
  return <OfflineGame />;
}
