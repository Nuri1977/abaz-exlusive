"use client";

import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { fetchPaymentAnalytics } from "@/lib/query/admin-payments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentAnalyticsResponse {
  analytics: {
    totalPayments: number;
    totalRevenue: number;
    totalRefunded: number;
    netRevenue: number;
    successRate: number;
    paymentsByMethod: Record<string, number>;
    paymentsByStatus: Record<string, number>;
    revenueByMethod: Record<string, number>;
    averagePaymentAmount: number;
  };
  methodBreakdown: Record<
    string,
    {
      total: number;
      successful: number;
      failed: number;
      pending: number;
      revenue: number;
    }
  >;
  revenueStats: {
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    growthRate: number;
    totalTransactions: number;
  };
}

export function PaymentStatsWidget() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<PaymentAnalyticsResponse>({
    queryKey: ["payment-analytics-widget"],
    queryFn: () => fetchPaymentAnalytics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !response) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load payment statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { analytics, revenueStats } = response;

  // Calculate pending payments that need attention
  const pendingCashPayments =
    analytics.paymentsByStatus?.[PaymentStatus.CASH_PENDING] || 0;
  const failedPayments =
    analytics.paymentsByStatus?.[PaymentStatus.FAILED] || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment Overview</h2>
        <Link
          href="/admin-dashboard/payments"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all payments →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalRevenue?.toLocaleString("en-US", {
                style: "currency",
                currency: "MKD",
                minimumFractionDigits: 0,
              }) || "MKD 0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalPayments || 0} total payments
            </p>
          </CardContent>
        </Card>

        {/* Monthly Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Growth
            </CardTitle>
            <TrendingUp
              className={`h-4 w-4 ${
                revenueStats.growthRate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                revenueStats.growthRate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {revenueStats.growthRate >= 0 ? "+" : ""}
              {revenueStats.growthRate?.toFixed(1) || "0"}%
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.successRate?.toFixed(1) || "0"}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Needs Attention
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingCashPayments > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cash Pending</span>
                  <Badge variant="secondary">{pendingCashPayments}</Badge>
                </div>
              )}
              {failedPayments > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed</span>
                  <Badge variant="destructive">{failedPayments}</Badge>
                </div>
              )}
              {pendingCashPayments === 0 && failedPayments === 0 && (
                <div className="text-sm text-muted-foreground">
                  All payments processed
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(pendingCashPayments > 0 || failedPayments > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pendingCashPayments > 0 && (
                <Link href="/admin-dashboard/payments?status=CASH_PENDING">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Review {pendingCashPayments} Cash Payment
                    {pendingCashPayments > 1 ? "s" : ""}
                  </Badge>
                </Link>
              )}
              {failedPayments > 0 && (
                <Link href="/admin-dashboard/payments?status=FAILED">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Check {failedPayments} Failed Payment
                    {failedPayments > 1 ? "s" : ""}
                  </Badge>
                </Link>
              )}
              <Link href="/admin-dashboard/payments/analytics">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  View Analytics
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
