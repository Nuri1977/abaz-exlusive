import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Shalom Radio",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 max-w-2xl prose">
      <h1>Terms & Conditions</h1>
      <p>
        Welcome to Shalom Radio. By accessing or using our website, you agree to
        comply with and be bound by the following terms and conditions. Please
        read them carefully.
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
        is the property of Shalom Radio or its content suppliers and is
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
