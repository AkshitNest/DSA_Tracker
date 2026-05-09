"use client";

import dynamic from 'next/dynamic';

// Next.js requires dynamic imports with ssr: false to happen inside a Client Component
const Background3D = dynamic(() => import('./Background3D'), { ssr: false });

export default function BackgroundWrapper() {
  return <Background3D />;
}
