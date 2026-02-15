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

  const isLanding = pathname === "/" || pathname === "/politica-privacidade";

  const navigation = [
    { name: "Dispositivos", href: "/dispositivos", current: pathname.startsWith("/dispositivos") || pathname.startsWith("/dispositivo/") },
    { name: "Download", href: "/download", current: pathname === "/download" },
    { name: "Configurações", href: "/settings", current: pathname.startsWith("/settings") },
  ];

  const landingNav = [
    { name: "Funcionalidades", href: "#features" },
    { name: "Depoimentos", href: "#testimonials" },
    { name: "Preços", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      isLanding
        ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
        : "bg-white/80 backdrop-blur-xl border-b border-slate-200"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 shadow-md shadow-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition">
              <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span className="text-lg font-display font-bold tracking-tight text-slate-900">
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
                      ? "text-violet-700 bg-violet-50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
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
                <span className="hidden sm:inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-600">
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
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-all">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:from-violet-500 hover:to-pink-400 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
                    Começar grátis
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "size-8 rounded-full ring-2 ring-violet-100",
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
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              {mobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur-xl border-slate-200">
          <div className="px-4 py-3 space-y-1">
            <SignedIn>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition",
                    item.current ? "text-violet-700 bg-violet-50" : "text-slate-600 hover:bg-slate-50"
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
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 transition"
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <SignInButton mode="modal">
                  <button className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition text-left">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:from-violet-500 hover:to-pink-400 transition">
                    Começar grátis
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
          <SignedIn>
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="flex items-center gap-3">
                {user?.imageUrl && (
                  <img className="size-9 rounded-full" src={user.imageUrl} alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-slate-900">
                    {user?.fullName || user?.firstName || "Usuário"}
                  </p>
                  <p className="text-xs truncate text-slate-500">
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
