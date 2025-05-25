import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { navLinks } from "@/utils/constants";

export function Footer() {
  return (
    <footer className="w-full bg-primary-foreground/95 backdrop-blur-sm mt-12 border-t pt-12 pb-6 shadow-inner">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo/logo.png"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-primary">Molini Shoes</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your company description goes here. This area is perfect for a
              short mission statement, company overview, or value proposition
              that introduces visitors to your business.
            </p>
            <Button asChild variant="link" className="p-0 h-auto text-primary">
              <Link href="/about" rel="noopener noreferrer">
                Learn more about us →
              </Link>
            </Button>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground mb-4">
              Quick Links
            </h3>
            <nav className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <h3 className="text-base font-bold text-foreground mt-6 mb-2">
              Legal
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Column 3: Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground mb-4">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin
                  size={16}
                  className="mr-2 mt-0.5 text-primary shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  Your Address, City, Country
                </span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2 text-primary shrink-0" />
                <Link
                  href="tel:+0000000000"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  +00 000 000 0000
                </Link>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-2 text-primary shrink-0" />
                <Link
                  href="mailto:info@example.com"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  info@example.com
                </Link>
              </div>
            </div>

            <h3 className="text-base font-bold text-foreground mt-6 mb-3">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="bg-muted hover:bg-primary hover:text-white rounded-full p-2 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href="#"
                className="bg-muted hover:bg-primary hover:text-white rounded-full p-2 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="#"
                className="bg-muted hover:bg-primary hover:text-white rounded-full p-2 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="#"
                className="bg-muted hover:bg-primary hover:text-white rounded-full p-2 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </Link>
              <Link
                href="#"
                className="bg-muted hover:bg-primary hover:text-white rounded-full p-2 transition-colors"
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
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center">
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                Resources
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} Molini Shoes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
