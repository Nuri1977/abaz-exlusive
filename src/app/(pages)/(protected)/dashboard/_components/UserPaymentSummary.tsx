"use client";

import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Clock,
  CreditCard,
  DollarSign,
  Receipt,
} from "lucide-react";

import { fetchUserPayments } from "@/lib/query/user-payments";
import type { UserPaymentResponse } from "@/types/user-payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { PaymentMethodIcon } from "@/components/payments/PaymentMethodIcon";

// Use the existing types from the types file

export function UserPaymentSummary() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<UserPaymentResponse>({
    queryKey: ["user-payment-summary"],
    queryFn: () => fetchUserPayments({ page: 1, limit: 5 }),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="size-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="mt-1 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-1 h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !response) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load payment information
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/dashboard/payments">View Payments</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const payments = response?.payments || [];
  const pagination = response?.pagination || { totalCount: 0 };

  // Calculate summary statistics from the payments data
  const totalCount = pagination.totalCount;
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(p =>
    p.status === PaymentStatus.PENDING ||
    p.status === PaymentStatus.CASH_PENDING
  ).length;
  const completedPayments = payments.filter(p =>
    p.status === PaymentStatus.PAID ||
    p.status === PaymentStatus.CASH_RECEIVED
  ).length;
  const currency = payments[0]?.currency || "MKD";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Summary</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/payments">
            View All Payments
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalCount}
              </Badge>
            )}
          </Link>
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpent?.toLocaleString("en-US", {
                style: "currency",
                currency: currency || "MKD",
                minimumFractionDigits: 0,
              }) || `${currency || "MKD"} 0`}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedPayments || 0} completed payment{completedPayments !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Payment{pendingPayments !== 1 ? "s" : ""} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Receipt className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time payment{totalCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {payments && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <PaymentMethodIcon
                        method={payment.method}
                        size="sm"
                      />
                      <CreditCard className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Order #{payment.orderId.slice(-8)}
                        </span>
                        <PaymentStatusBadge
                          status={payment.status}
                          method={payment.method}
                          size="sm"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {payment.order?.items?.[0]?.Product && (
                          <span className="ml-2">
                            • {payment.order.items[0].Product.name}
                            {payment.order.items.length > 1 &&
                              ` +${payment.order.items.length - 1} more`
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {payment.amount?.toLocaleString("en-US", {
                        style: "currency",
                        currency: payment.currency || "MKD",
                        minimumFractionDigits: 0,
                      })}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/payments/${payment.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {payments.length === 0 && (
              <div className="py-8 text-center">
                <CreditCard className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No payments yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your payment history will appear here once you make your first purchase.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {pendingPayments > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/payments?status=PENDING">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Review {pendingPayments} Pending Payment{pendingPayments > 1 ? "s" : ""}
                </Badge>
              </Link>
              <Link href="/dashboard/payments?status=CASH_PENDING">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Track Cash Deliveries
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}