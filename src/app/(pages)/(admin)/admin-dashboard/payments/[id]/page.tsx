import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AdminPaymentDetailView } from "./_components/AdminPaymentDetailView";

export const metadata: Metadata = {
  title: "Payment Management | Admin Dashboard",
  description: "Complete payment and order management interface.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPaymentDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin-dashboard/payments">
            <ArrowLeft className="mr-2 size-4" />
            Back to Payments
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Payment Management</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Complete payment and order management interface.
        </p>
      </div>

      <AdminPaymentDetailView paymentId={id} />
    </div>
  );
}
