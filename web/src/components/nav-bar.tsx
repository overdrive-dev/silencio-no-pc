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

  const isLanding = pathname === "/" || pathname === "/pricing" || pathname === "/politica-privacidade" || pathname === "/download";

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
        ? "bg-background/60 backdrop-blur-xl border-b border-white/[0.06]"
        : "bg-white border-b border-zinc-200"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={cn(
              "flex items-center justify-center size-8 rounded-lg transition",
              isLanding
                ? "bg-violet-500/20 group-hover:bg-violet-500/30"
                : "bg-violet-100 group-hover:bg-violet-200"
            )}>
              <svg className={cn("size-4", isLanding ? "text-violet-400" : "text-violet-600")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span className={cn(
              "text-lg font-display font-bold tracking-tight",
              isLanding ? "text-white" : "text-zinc-900"
            )}>
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
                    isLanding
                      ? item.current
                        ? "text-white bg-white/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                      : item.current
                        ? "text-violet-700 bg-violet-50"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
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
                <span className="hidden sm:inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400">
                  Pagamento pendente
                </span>
              )}
              {isInGracePeriod && daysUntilBlock !== null && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  {daysUntilBlock}d restantes
                </span>
              )}
            </SignedIn>

            {/* Auth buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isLanding
                      ? "text-zinc-400 hover:text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}>
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30">
                    Começar grátis
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "size-8 rounded-full ring-2 ring-white/10",
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
              className={cn(
                "md:hidden p-2 rounded-lg transition",
                isLanding
                  ? "text-zinc-400 hover:text-white hover:bg-white/10"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              {mobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={cn(
          "md:hidden border-t",
          isLanding ? "bg-background/95 backdrop-blur-xl border-white/[0.06]" : "bg-white border-zinc-200"
        )}>
          <div className="px-4 py-3 space-y-1">
            <SignedIn>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition",
                    isLanding
                      ? item.current ? "text-white bg-white/10" : "text-zinc-400 hover:text-white"
                      : item.current ? "text-violet-700 bg-violet-50" : "text-zinc-600 hover:bg-zinc-50"
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
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition"
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                <SignInButton mode="modal">
                  <button className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition text-left">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition">
                    Começar grátis
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
          <SignedIn>
            <div className={cn(
              "px-4 py-3 border-t",
              isLanding ? "border-white/[0.06]" : "border-zinc-200"
            )}>
              <div className="flex items-center gap-3">
                {user?.imageUrl && (
                  <img className="size-9 rounded-full" src={user.imageUrl} alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", isLanding ? "text-white" : "text-zinc-900")}>
                    {user?.fullName || user?.firstName || "Usuário"}
                  </p>
                  <p className={cn("text-xs truncate", isLanding ? "text-zinc-500" : "text-zinc-500")}>
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
