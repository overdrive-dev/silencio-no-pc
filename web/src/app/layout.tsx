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
    <ClerkProvider>
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
