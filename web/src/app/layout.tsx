import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { ptBR } from "@clerk/localizations";
import NavBar from "@/components/nav-bar";
import MainWrapper from "@/components/main-wrapper";
import "./globals.css";

const displayFont = Outfit({
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
  title: "KidsPC — Controle Parental Inteligente",
  description: "Limite tempo de tela, monitore barulho e gerencie os dispositivos do seu filho remotamente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={ptBR}
      appearance={{
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#ffffff",
          colorInputBackground: "#f8fafc",
          colorText: "#0f172a",
        },
      }}
    >
      <html lang="pt-BR" className="h-full">
        <body className={`${displayFont.variable} ${bodyFont.variable} antialiased h-full bg-background`}>
          <NavBar />
          <MainWrapper>
            {children}
          </MainWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
