import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Toaster } from "@/components/ui/toaster";
import { isAdminServer } from "@/helpers/isAdminServer";

import AdminSidebar from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrative dashboard of the Shopping App",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isAdminServer();
  if (!isAdmin) redirect("/");
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
