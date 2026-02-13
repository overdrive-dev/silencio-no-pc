import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/nav-bar";
import MainWrapper from "@/components/main-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
        <body className={`${geistSans.variable} antialiased h-full bg-gray-50 text-gray-900`}>
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
