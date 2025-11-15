import type { Metadata } from "next";

import { generateTermsMetadata } from "@/lib/metadata";

// Generate SEO metadata for Terms & Conditions page
export const metadata: Metadata = generateTermsMetadata();

export default function TermsPage() {
  return (
    <div className="prose container mx-auto max-w-2xl py-12">
      <h1>Terms & Conditions</h1>
      <p>
        Welcome to Abaz Exclusive. By accessing or using our website, you agree
        to comply with and be bound by the following terms and conditions.
        Please read them carefully.
      </p>
      <h2>Use of Site</h2>
      <p>
        You agree to use this site for lawful purposes only and in a way that
        does not infringe the rights of, restrict, or inhibit anyone else’s use
        and enjoyment of the site.
      </p>
      <h2>Intellectual Property</h2>
      <p>
        All content on this site, including text, graphics, logos, and images,
        is the property of Abaz Exclusive or its content suppliers and is
        protected by copyright laws.
      </p>
      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to update these terms at any time. Continued use of
        the site means you accept those changes.
      </p>
    </div>
  );
}
