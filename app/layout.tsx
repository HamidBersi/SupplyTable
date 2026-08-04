import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/app/components/HeaderNav";
import { Providers } from "@/app/providers";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Felicita commandes — Catalogue fournisseurs",
  description:
    "Catalogue et commandes fournisseurs pour La Félicità : filtres, e-mail et historique.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers session={session}>
          <HeaderNav session={session} />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
