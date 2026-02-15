"use client";

import { useState } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Bars3Icon, XMarkIcon, Cog6ToothIcon, CreditCardIcon } from "@heroicons/react/24/outline";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isInGracePeriod, isPastDue, daysUntilBlock } = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === "/" || pathname === "/politica-privacidade" || pathname === "/sobre" || pathname === "/dicas-atividades";

  const navigation = [
    { name: "Dispositivos", href: "/dispositivos", current: pathname.startsWith("/dispositivos") || pathname.startsWith("/dispositivo/") },
    { name: "Download", href: "/download", current: pathname === "/download" },
    { name: "Configurações", href: "/settings", current: pathname.startsWith("/settings") },
  ];

  const landingNav = pathname === "/" ? [
    { name: "Funcionalidades", href: "#features" },
    { name: "Depoimentos", href: "#testimonials" },
    { name: "Preços", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ] : [
    { name: "Início", href: "/" },
    { name: "Dicas de Atividades", href: "/dicas-atividades" },
    { name: "Sobre", href: "/sobre" },
    { name: "Preços", href: "/pricing" },
  ];

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      isLanding
        ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
        : "bg-white/90 backdrop-blur-xl border-b border-border"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center size-8 rounded-lg bg-[#4A7AFF] shadow-md shadow-[#4A7AFF]/20 group-hover:shadow-lg group-hover:shadow-[#4A7AFF]/30 transition">
              <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span className="text-lg font-display tracking-tight text-[#1a1a2e]">
              KidsPC
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-1">
            <SignedIn>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    item.current
                      ? "text-[#4A7AFF] bg-[#EDF2FF]"
                      : "text-gray-500 hover:text-[#1a1a2e] hover:bg-[#F0EBE5]"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </SignedIn>
            <SignedOut>
              {isLanding && landingNav.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-[#1a1a2e] hover:bg-[#F0EBE5] transition-all"
                >
                  {item.name}
                </a>
              ))}
            </SignedOut>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Payment warnings */}
            <SignedIn>
              {isPastDue && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-[#FF6B6B]">
                  Pagamento pendente
                </span>
              )}
              {isInGracePeriod && daysUntilBlock !== null && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                  {daysUntilBlock}d restantes
                </span>
              )}
            </SignedIn>

            {/* Auth buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1a1a2e] transition-all">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-pill btn-pill-primary text-sm py-2 px-5">
                    Começar grátis
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "size-8 rounded-full ring-2 ring-[#DAE5FF]",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Configurações"
                      labelIcon={<Cog6ToothIcon className="size-4" />}
                      href="/settings"
                    />
                    <UserButton.Link
                      label="Faturamento"
                      labelIcon={<CreditCardIcon className="size-4" />}
                      href="/settings/billing"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-[#1a1a2e] hover:bg-[#F0EBE5] transition"
            >
              {mobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl border-border">
          <div className="px-4 py-3 space-y-1">
            <SignedIn>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition",
                    item.current ? "text-[#4A7AFF] bg-[#EDF2FF]" : "text-gray-600 hover:bg-[#F0EBE5]"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </SignedIn>
            <SignedOut>
              {isLanding && landingNav.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-[#1a1a2e] transition"
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <SignInButton mode="modal">
                  <button className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#1a1a2e] transition text-left">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-3 py-2.5 rounded-full text-sm font-semibold bg-[#4A7AFF] text-white hover:bg-[#3A6AEF] transition">
                    Começar grátis
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
          <SignedIn>
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-3">
                {user?.imageUrl && (
                  <img className="size-9 rounded-full" src={user.imageUrl} alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[#1a1a2e]">
                    {user?.fullName || user?.firstName || "Usuário"}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  );
}
