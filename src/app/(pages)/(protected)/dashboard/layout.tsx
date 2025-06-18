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
    <div className="flex min-h-screen flex-col md:flex-row">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto p-6 pt-4 md:pt-6">
        {children}
      </main>
    </div>
  );
}
