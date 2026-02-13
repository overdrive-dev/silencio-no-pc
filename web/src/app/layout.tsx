import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/nav-bar";
import MainWrapper from "@/components/main-wrapper";
import "./globals.css";

const displayFont = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KidsPC — Painel",
  description: "Painel de controle parental remoto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          colorText: "#1e293b",
          colorTextSecondary: "#64748b",
          colorBackground: "#ffffff",
          colorInputBackground: "#f8fafc",
          colorInputText: "#1e293b",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-body), sans-serif",
        },
        elements: {
          userButtonPopoverCard: "shadow-xl border border-gray-200 bg-white",
          userButtonPopoverActionButton: "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700",
          userButtonPopoverActionButtonText: "text-slate-700",
          userButtonPopoverActionButtonIcon: "text-slate-400",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <html lang="pt-BR" className="h-full">
        <body className={`${displayFont.variable} ${bodyFont.variable} antialiased h-full bg-stone-50 text-slate-800`}>
          <div className="min-h-full">
            <NavBar />
            <MainWrapper>
              {children}
            </MainWrapper>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
