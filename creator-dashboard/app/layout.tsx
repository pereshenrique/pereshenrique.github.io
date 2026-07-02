import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "@tres.ag — Painel de Conteúdo",
  description: "Hook Vault, Analytics, Concorrentes, Agendador, Calendário e Em Alta em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
