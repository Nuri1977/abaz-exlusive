import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | shalom radio",
  description: "Dashboard for shalom radio",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto max-w-screen-md py-8 md:py-12">
      <div className="space-y-6">{children}</div>
    </div>
  );
}
