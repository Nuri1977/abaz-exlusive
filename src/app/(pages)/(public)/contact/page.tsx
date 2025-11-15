import type { Metadata } from "next";

import { generateContactMetadata } from "@/lib/metadata";

import ContactForm from "./_components/ContactForm";

// Generate SEO metadata for Contact page
export const metadata: Metadata = generateContactMetadata();

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-xl py-12">
      <ContactForm />
    </div>
  );
}
