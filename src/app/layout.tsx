import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";

import "./globals.css";

import CookieConsent from "@/components/ui/cookie-consent";
import { Toaster } from "@/components/ui/toaster";
import { ConditionalHeader } from "@/components/shared/ConditionalHeader";
import { Footer } from "@/components/shared/Footer";
import Providers from "@/providers/providers";
import { SITE_CONFIG } from "@/lib/metadata";
import ContactMethods from "@/components/shared/ContactMethods";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Global metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Premium Women's Dresses`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: "@abazexclusive", // Update with actual Twitter handle
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  category: "fashion",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
  applicationName: SITE_CONFIG.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.name,
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: SITE_CONFIG.url,
    // Add language alternates when implementing i18n
    // languages: {
    //   'en-US': '/en-US',
    //   'mk-MK': '/mk-MK',
    // },
  },
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
          <ConditionalHeader />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
          <ContactMethods variant="floating" />
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}