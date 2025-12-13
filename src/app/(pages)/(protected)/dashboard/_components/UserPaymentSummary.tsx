"use client";

import Link from "next/link";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  CreditCard,
  DollarSign,
} from "lucide-react";

import { fetchUserPayments } from "@/lib/query/user-payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserPaymentSummary() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-payments-summary"],
    queryFn: async () => {
      const result = await fetchUserPayments({
        page: 1,
        limit: 5, // Just get recent payments for summary
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      // Ensure we always return a valid response
      return (
        result || {
          payments: [],
          pagination: {
            page: 1,
            limit: 5,
            totalCount: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      );
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="size-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
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
              Failed to load payment summary
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { payments, pagination } = response;

  // Calculate summary statistics
  const totalSpent =
    payments?.reduce((sum, payment) => {
      if (
        payment.status === PaymentStatus.PAID ||
        payment.status === PaymentStatus.CASH_RECEIVED
      ) {
        return sum + payment.amount;
      }
      return sum;
    }, 0) || 0;

  const pendingPayments =
    payments?.filter(
      (p) =>
        p.status === PaymentStatus.PENDING ||
        p.status === PaymentStatus.CASH_PENDING
    ).length || 0;

  const completedPayments =
    payments?.filter(
      (p) =>
        p.status === PaymentStatus.PAID ||
        p.status === PaymentStatus.CASH_RECEIVED
    ).length || 0;

  const recentPayments = payments?.slice(0, 3) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment Summary</h2>
        <Link
          href="/dashboard/payments"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpent.toLocaleString("en-US", {
                style: "currency",
                currency: "MKD",
                minimumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedPayments} completed payment
              {completedPayments !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Payment{pendingPayments !== 1 ? "s" : ""} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagination?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All time payment{(pagination?.totalCount || 0) !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {payment.method === PaymentMethod.CARD ? (
                        <CreditCard className="size-4 text-blue-600" />
                      ) : (
                        <DollarSign className="size-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium">
                        Order #{payment.orderId.slice(-8)}
                      </span>
                    </div>
                    <Badge
                      variant={
                        payment.status === PaymentStatus.PAID ||
                        payment.status === PaymentStatus.CASH_RECEIVED
                          ? "default"
                          : payment.status === PaymentStatus.FAILED
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {payment.status === PaymentStatus.CASH_PENDING
                        ? "Cash Pending"
                        : payment.status === PaymentStatus.CASH_RECEIVED
                          ? "Cash Received"
                          : payment.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {payment.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "MKD",
                        minimumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalCount > 3 && (
              <div className="mt-4 border-t pt-3">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/payments">
                    View All {pagination.totalCount} Payments
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Payments State */}
      {recentPayments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No Payments Yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              You haven&apos;t made any payments yet. Start shopping to see your
              payment history here.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
