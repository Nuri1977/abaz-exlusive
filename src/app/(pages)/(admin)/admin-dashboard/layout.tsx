import type { Metadata } from "next";
import AdminSidebar from "./_components/AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Shalom Radio - Admin Dashboard",
  description: "Administrative dashboard for Shalom Radio",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:pt-6 pt-4">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
