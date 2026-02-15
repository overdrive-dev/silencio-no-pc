"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/pricing" || pathname === "/politica-privacidade";
  const isDownload = pathname === "/download";

  if (isLanding || isDownload) {
    return <main className="bg-background text-foreground">{children}</main>;
  }

  return (
    <main className="min-h-screen bg-dash-bg text-dash-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
