import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

import { navLinks } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { getSettingsSA } from "@/services/settings/settingsService";

import Logo from "./Logo";

export async function Footer() {
  const settings = await getSettingsSA();

  return (
    <footer className="w-full border-t backdrop-blur-sm">
      <div className="bg-background/80 py-8 text-foreground">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Column 1: About */}
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="relative size-16">
                  <Link
                    href="/"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Logo size={180} />
                  </Link>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {settings?.aboutInfo ||
                  "Discover premium women's shoes designed for style, comfort, and confidence. Shop the latest collections and timeless classics at Abaz Exclusive."}
              </p>
              <Button
                asChild
                variant="link"
                className="h-auto p-0 text-primary"
              >
                <Link href="/about" rel="noopener noreferrer">
                  Learn more about us →
                </Link>
              </Button>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="mb-4 text-base font-bold text-primary">
                Quick Links
              </h3>
              <nav className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link?.name}
                    href={link?.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link?.name}
                  </Link>
                ))}
              </nav>

              <h3 className="mb-2 mt-6 text-base font-bold text-primary">
                Legal
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms & Conditions
                </Link>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Column 3: Contact & Social */}
            <div className="space-y-4">
              <h3 className="mb-4 text-base font-bold text-primary">
                Get in Touch
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin
                    size={16}
                    className="mr-2 mt-0.5 shrink-0 text-primary"
                  />
                  <span className="text-muted-foreground">
                    {settings?.address
                      ? `${settings?.address}, ${settings?.city}, ${settings?.state}`
                      : "Your Address, City, Country"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 shrink-0 text-primary" />
                  <Link
                    href={`tel:${settings?.telephone}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {settings?.telephone || "+00 000 000 0000"}
                  </Link>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 shrink-0 text-primary" />
                  <Link
                    href={`mailto:${settings?.email}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {settings?.email || "info@example.com"}
                  </Link>
                </div>
              </div>

              <h3 className="mb-3 mt-6 text-base font-bold text-primary">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {settings?.facebook && (
                  <Link
                    href={settings.facebook}
                    className="rounded-full bg-transparent p-2 text-white transition-colors hover:text-white/80"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook size={18} />
                  </Link>
                )}
                {settings?.twitter && (
                  <Link
                    href={settings.twitter}
                    className="rounded-full bg-transparent p-2 text-white transition-colors hover:text-white/80"
                    aria-label="Twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter size={18} />
                  </Link>
                )}
                {settings?.instagram && (
                  <Link
                    href={settings.instagram}
                    className="rounded-full bg-transparent p-2 text-white transition-colors hover:text-white/80"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram size={18} />
                  </Link>
                )}
                {settings?.youtube && (
                  <Link
                    href={settings.youtube}
                    className="rounded-full bg-transparent p-2 text-white transition-colors hover:text-white/80"
                    aria-label="YouTube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Youtube size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t bg-muted py-4">
        <div className="container mx-auto px-4">
          {/* Footer Bottom */}
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="flex items-center">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  Resources
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground sm:mt-0">
              &copy; {new Date().getFullYear()}{" "}
              {settings?.name || "Abaz Exclusive"}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
