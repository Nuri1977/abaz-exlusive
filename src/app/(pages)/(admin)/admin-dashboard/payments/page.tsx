"use client";

import { AdminPaymentTable } from "./_components/AdminPaymentTable";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Payments</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage payments and process transactions.
        </p>
      </div>
      <AdminPaymentTable />
    </div>
  );
}
