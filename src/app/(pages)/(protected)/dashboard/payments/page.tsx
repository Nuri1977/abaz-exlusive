import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionServer } from "@/helpers/getSessionServer";

import { UserPaymentTable } from "./_components/UserPaymentTable";

export const metadata: Metadata = {
  title: "My Payments | Abaz Exclusive",
  description: "View your payment history and manage transactions.",
};

export default async function UserPaymentsPage() {
  const session = await getSessionServer();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">My Payments</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          View your payment history and manage transactions.
        </p>
      </div>

      <UserPaymentTable />
    </div>
  );
}
