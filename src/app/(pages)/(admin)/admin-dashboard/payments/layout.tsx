import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments | Admin Dashboard",
  description: "Manage payments and process transactions.",
};

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
