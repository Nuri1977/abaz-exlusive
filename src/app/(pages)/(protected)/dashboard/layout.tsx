import { ReactNode } from "react";
import type { Metadata } from "next";

import UserSidebar from "./_components/UserSidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User Dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="container mx-auto max-w-screen-md py-8 md:py-12">
      <div className="space-y-6">{children}</div>
    </div>
  );
}
