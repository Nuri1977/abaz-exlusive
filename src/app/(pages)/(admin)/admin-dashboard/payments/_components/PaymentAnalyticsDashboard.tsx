"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  HandCoins,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { fetchPaymentAnalytics } from "@/lib/query/admin-payments";
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

const methodConfig: Record<
  string,
  { icon: any; label: string; color: string }
> = {
  CARD: {
    icon: CreditCard,
    label: "Card Payment",
    color: "bg-blue-500",
  },
  CASH_ON_DELIVERY: {
    icon: HandCoins,
    label: "Cash on Delivery",
    color: "bg-green-500",
  },
};

const statusConfig: Record<
  string,
  { icon: any; label: string; color: string }
> = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    color: "bg-yellow-500",
  },
  PAID: {
    icon: CheckCircle,
    label: "Paid",
    color: "bg-green-500",
  },
  FAILED: {
    icon: XCircle,
    label: "Failed",
    color: "bg-red-500",
  },
  REFUNDED: {
    icon: RotateCcw,
    label: "Refunded",
    color: "bg-blue-500",
  },
  CASH_PENDING: {
    icon: Clock,
    label: "Cash Pending",
    color: "bg-orange-500",
  },
  CASH_RECEIVED: {
    icon: CheckCircle,
    label: "Cash Received",
    color: "bg-green-600",
  },
};

export function PaymentAnalyticsDashboard() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<PaymentAnalyticsResponse>({
    queryKey: ["payment-analytics"],
    queryFn: () => fetchPaymentAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
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

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            Failed to load payment analytics. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { analytics, methodBreakdown, revenueStats } = response;

  // Calculate total payments for percentage calculations
  const totalPaymentsByMethod = Object.values(
    analytics.paymentsByMethod || {}
  ).reduce((sum, count) => sum + count, 0);
  const totalPaymentsByStatus = Object.values(
    analytics.paymentsByStatus || {}
  ).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              From {analytics.totalPayments || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averagePaymentAmount?.toLocaleString("en-US", {
                style: "currency",
                currency: "MKD",
                minimumFractionDigits: 0,
              }) || "MKD 0"}
            </div>
            <p className="text-xs text-muted-foreground">Average per payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Growth
            </CardTitle>
            {revenueStats.growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
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
      </div>

      {/* Revenue Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Month</span>
                <span className="text-lg font-bold">
                  {revenueStats.currentMonthRevenue?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "MKD",
                    minimumFractionDigits: 0,
                  }) || "MKD 0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Month</span>
                <span className="text-lg font-bold text-muted-foreground">
                  {revenueStats.lastMonthRevenue?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "MKD",
                    minimumFractionDigits: 0,
                  }) || "MKD 0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  {analytics.netRevenue?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "MKD",
                    minimumFractionDigits: 0,
                  }) || "MKD 0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.paymentsByMethod || {}).map(
                ([method, count]) => {
                  const config = methodConfig[method] || {
                    icon: CreditCard,
                    label: method,
                    color: "bg-gray-500",
                  };
                  const Icon = config.icon;
                  const percentage =
                    totalPaymentsByMethod > 0
                      ? (count / totalPaymentsByMethod) * 100
                      : 0;
                  const revenue = analytics.revenueByMethod?.[method] || 0;

                  return (
                    <div
                      key={method}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`rounded-full p-1 ${config.color}`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">
                          {config.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {count} ({percentage.toFixed(1)}%)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {revenue.toLocaleString("en-US", {
                            style: "currency",
                            currency: "MKD",
                            minimumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analytics.paymentsByStatus || {}).map(
              ([status, count]) => {
                const config = statusConfig[status] || {
                  icon: Clock,
                  label: status,
                  color: "bg-gray-500",
                };
                const Icon = config.icon;
                const percentage =
                  totalPaymentsByStatus > 0
                    ? (count / totalPaymentsByStatus) * 100
                    : 0;

                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-1 ${config.color}`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        {config.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Method Performance Details */}
      {methodBreakdown && Object.keys(methodBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(methodBreakdown).map(([method, stats]) => {
                const config = methodConfig[method] || {
                  icon: CreditCard,
                  label: method,
                  color: "bg-gray-500",
                };
                const Icon = config.icon;
                const successRate =
                  stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;

                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-full p-1 ${config.color}`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {successRate.toFixed(1)}% success rate
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stats.revenue.toLocaleString("en-US", {
                            style: "currency",
                            currency: "MKD",
                            minimumFractionDigits: 0,
                          })}{" "}
                          revenue
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {stats.successful}
                        </div>
                        <div className="text-muted-foreground">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">
                          {stats.pending}
                        </div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">
                          {stats.failed}
                        </div>
                        <div className="text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{stats.total}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
