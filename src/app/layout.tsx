import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";

import "./globals.css";

import CookieConsent from "@/components/ui/cookie-consent";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import Providers from "@/providers/providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abaz Exclusive",
  description: "Premium women's shoes for every occasion",
  keywords: [
    "shoes",
    "women's shoes",
    "footwear",
    "premium shoes",
    "fashion",
    "accessories",
  ],
  authors: [{ name: "Abaz Exclusive" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
