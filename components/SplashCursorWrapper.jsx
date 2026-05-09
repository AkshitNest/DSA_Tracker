"use client";
import dynamic from "next/dynamic";

const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function SplashCursorWrapper() {
  return (
    <SplashCursor
      COLOR="#e9f0f1ff"
    />
  );
}
