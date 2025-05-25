import type { Metadata } from "next";
import ContactForm from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Shalom Radio",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 max-w-xl">
      <ContactForm />
    </div>
  );
}
