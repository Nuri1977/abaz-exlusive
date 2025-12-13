"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PaymentAnalyticsDashboard } from "../_components/PaymentAnalyticsDashboard";

export default function PaymentAnalyticsPage() {
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
        <h1 className="text-2xl font-bold md:text-3xl">Payment Analytics</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          View payment analytics and performance metrics.
        </p>
      </div>

      <PaymentAnalyticsDashboard />
    </div>
  );
}
