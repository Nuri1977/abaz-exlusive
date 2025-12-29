import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionServer } from "@/helpers/getSessionServer";

import { UserOrdersTable } from "./_components/UserOrdersTable";

export const metadata: Metadata = {
  title: "My Orders | Dashboard",
  description: "View your order history and track shipments.",
};

export default async function UserOrdersPage() {
  const session = await getSessionServer();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">My Orders</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          View your order history and track shipments.
        </p>
      </div>
      <UserOrdersTable />
    </div>
  );
}
