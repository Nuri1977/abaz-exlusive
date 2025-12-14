import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSessionServer } from "@/helpers/getSessionServer";

import { UserPaymentDetailView } from "./_components/UserPaymentDetailView";

export const metadata: Metadata = {
  title: "Payment Details | Abaz Exclusive",
  description: "View detailed information about your payment and order.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPaymentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionServer();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/payments">
            <ArrowLeft className="mr-2 size-4" />
            Back to Payments
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Payment Details</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Complete information about your payment and order.
        </p>
      </div>

      <UserPaymentDetailView paymentId={id} />
    </div>
  );
}
