import type { Metadata } from "next";

import AdminSidebar from "./_components/AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrative dashboard of the Shopping App",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 pt-4 md:pt-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
