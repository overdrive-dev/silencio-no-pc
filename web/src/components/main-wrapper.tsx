"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === "/" || pathname === "/politica-privacidade" || pathname === "/sobre" || pathname === "/dicas-atividades";

  if (isPublic) {
    return <main className="bg-background text-foreground">{children}</main>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
