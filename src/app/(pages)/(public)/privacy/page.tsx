import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Shalom Radio",
};

export default function PrivacyPage() {
  return (
    <div className="prose container mx-auto max-w-2xl py-12">
      <h1>Privacy Policy</h1>
      <p>
        Your privacy is important to us. This policy explains how Shalom Radio
        collects, uses, and protects your information when you use our website.
      </p>
      <h2>Information Collection</h2>
      <p>
        We may collect personal information that you voluntarily provide to us
        when you use our site or contact us.
      </p>
      <h2>Use of Information</h2>
      <p>
        We use your information to provide and improve our services, communicate
        with you, and comply with legal obligations.
      </p>
      <h2>Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        through our website.
      </p>
    </div>
  );
}
