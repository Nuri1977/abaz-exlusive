import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Analytics | Admin Dashboard",
  description: "View payment analytics and performance metrics.",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
