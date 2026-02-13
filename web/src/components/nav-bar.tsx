"use client";

import { Fragment } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon, Cog6ToothIcon, CreditCardIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isActive, isInGracePeriod, isPastDue, daysUntilBlock } = useSubscription();

  const isLanding = pathname === "/";

  const navigation = [
    { name: "Dispositivos", href: "/dispositivos", current: pathname.startsWith("/dispositivos") || pathname.startsWith("/dispositivo/") },
    { name: "Download", href: "/download", current: pathname === "/download" },
    { name: "Configurações", href: "/settings", current: pathname.startsWith("/settings") },
  ];

  const landingNav = [
    { name: "Funcionalidades", href: "#features" },
    { name: "Saúde Digital", href: "#saude-digital" },
    { name: "Depoimentos", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <Disclosure as="nav" className={isLanding ? "bg-white/80 backdrop-blur-lg border-b border-stone-200/50 sticky top-0 z-50" : "border-b border-stone-200 bg-white"}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex shrink-0 items-center">
                  <Link href="/" className="flex items-center gap-2 text-xl font-display text-slate-900">
                    <ComputerDesktopIcon className="size-6 text-teal-600" />
                    KidsPC
                  </Link>
                </div>
                <SignedIn>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "border-indigo-600 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SignedIn>
                {isLanding && (
                  <SignedOut>
                    <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-6">
                      {landingNav.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </SignedOut>
                )}
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center gap-3">
                <SignedOut>
                  {isLanding ? (
                    <>
                      <SignInButton mode="modal">
                        <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                          Entrar
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition shadow-sm">
                          Assine por R$&nbsp;19,90
                        </button>
                      </SignUpButton>
                    </>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
                        Entrar
                      </button>
                    </SignInButton>
                  )}
                </SignedOut>

                <SignedIn>
                  {/* Payment warning badge */}
                  {isPastDue && (
                    <span className="mr-3 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Pagamento pendente
                    </span>
                  )}
                  {isInGracePeriod && daysUntilBlock !== null && (
                    <span className="mr-3 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {daysUntilBlock}d restantes
                    </span>
                  )}

                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "size-8 rounded-full",
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
              <div className="-mr-2 flex items-center sm:hidden">
                <SignedIn>
                  <DisclosureButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                    <span className="sr-only">Abrir menu</span>
                    {open ? (
                      <XMarkIcon className="block size-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block size-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
                      Entrar
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                    "block border-l-4 py-2 pr-4 pl-3 text-base font-medium"
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <div className="shrink-0">
                  {user?.imageUrl && (
                    <img className="size-10 rounded-full" src={user.imageUrl} alt="" />
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.fullName || user?.firstName || "Usuário"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <DisclosureButton
                  as={Link}
                  href="/pricing"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Gerenciar assinatura
                </DisclosureButton>
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
