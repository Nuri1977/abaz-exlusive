import Logo from "./Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { navLinks } from "@/app/constants/routes";

export function Footer() {
  return (
    <footer className="w-full backdrop-blur-sm">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative h-16 w-16">
                  <Link href="/" className="cursor-pointer flex items-center gap-2">
                    <Logo size={180} />
                  </Link>
                </div>
              </div>
              <p className="text-white hover:text-white/90 text-sm">
                Discover premium women's shoes designed for style, comfort, and confidence. Shop the latest
                collections and timeless classics at Molini Shoes.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-primary">
                <Link href="/about" rel="noopener noreferrer">
                  Learn more about us →
                </Link>
              </Button>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground mb-4">Quick Links</h3>
              <nav className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-white hover:text-white/90 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <h3 className="text-base font-bold text-foreground mt-6 mb-2">Legal</h3>
              <div className="flex flex-col gap-2">
                <Link href="/terms" className="text-white hover:text-white/90 transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="text-white hover:text-white/90 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Column 3: Contact & Social */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-0.5 text-white hover:text-white/90 shrink-0" />
                  <span className="text-white hover:text-white/90">Your Address, City, Country</span>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-white hover:text-white/90 shrink-0" />
                  <Link href="tel:+0000000000" className="text-sm text-white hover:text-white/90">
                    +00 000 000 0000
                  </Link>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-white hover:text-white/90 shrink-0" />
                  <Link href="mailto:info@example.com" className="text-sm text-white hover:text-white/90">
                    info@example.com
                  </Link>
                </div>
              </div>

              <h3 className="text-base font-bold text-foreground mt-6 mb-3">Follow Us</h3>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="bg-transparent text-white hover:text-white/80 rounded-full p-2 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </Link>
                <Link
                  href="#"
                  className="bg-transparent text-white hover:text-white/80 rounded-full p-2 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </Link>
                <Link
                  href="#"
                  className="bg-transparent text-white hover:text-white/80 rounded-full p-2 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </Link>
                <Link
                  href="#"
                  className="bg-transparent text-white hover:text-white/80 rounded-full p-2 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </Link>
                <Link
                  href="#"
                  className="bg-transparent text-white hover:text-white/80 rounded-full p-2 transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white hover:text-white/80"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-tertiary text-tertiary-foreground py-4">
        <div className="container mx-auto px-4">
          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center">
              <Button asChild variant="ghost" size="sm" className="text-xs text-tertiary-foreground">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  Resources
                </Link>
              </Button>
            </div>
            <p className="text-xs text-tertiary-foreground mt-4 sm:mt-0">
              &copy; {new Date().getFullYear()} Molini Shoes. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
