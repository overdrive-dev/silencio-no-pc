"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const secondaryNavigation = [
  { name: "Perfil", href: "/settings", icon: UserCircleIcon },
  { name: "Faturamento", href: "/settings/billing", icon: CreditCardIcon },
  { name: "Notificações", href: "/settings/notifications", icon: BellIcon },
  { name: "Segurança", href: "/settings/security", icon: ShieldCheckIcon },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="lg:flex lg:gap-x-16">
      <h1 className="sr-only">Configurações</h1>

      <aside className="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-0">
        <nav className="flex-none px-4 sm:px-6 lg:px-0">
          <ul role="list" className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
            {secondaryNavigation.map((item) => {
              const current = item.href === "/settings"
                ? pathname === "/settings"
                : pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      current
                        ? "bg-gray-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                      "group flex gap-x-3 rounded-md py-2 pr-3 pl-2 text-sm/6 font-semibold"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        current
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-indigo-600",
                        "size-6 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:flex-auto lg:px-0 lg:py-0">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
