"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Package,
  Printer,
  RotateCcw,
  User,
} from "lucide-react";

import type { PaymentDetailData } from "@/types/payment-details";
import {
  confirmCashPayment,
  fetchPaymentById,
  processRefund,
} from "@/lib/query/admin-payments";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryTracking } from "@/components/payments/DeliveryTracking";
import { PaymentMethodIcon } from "@/components/payments/PaymentMethodIcon";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { PaymentTimeline } from "@/components/payments/PaymentTimeline";
import { PricingBreakdown } from "@/components/payments/PricingBreakdown";
import { ProductDetailCard } from "@/components/payments/ProductDetailCard";

interface AdminPaymentDetailViewProps {
  paymentId: string;
}

export function AdminPaymentDetailView({
  paymentId,
}: AdminPaymentDetailViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const {
    data: payment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-payment", paymentId],
    queryFn: () => fetchPaymentById(paymentId),
  });

  const confirmCashMutation = useMutation({
    mutationFn: (confirmedBy: string) =>
      confirmCashPayment(paymentId, confirmedBy),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-payment", paymentId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({
        title: "Success",
        description: "Cash payment confirmed successfully",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { error?: string })?.error ||
        "Failed to confirm cash payment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason?: string }) =>
      processRefund(paymentId, amount, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-payment", paymentId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      setRefundDialogOpen(false);
      setRefundAmount("");
      setRefundReason("");
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { error?: string })?.error || "Failed to process refund";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleConfirmCash = () => {
    // In a real app, get the admin's name from session
    confirmCashMutation.mutate("Admin");
  };

  const handleRefund = () => {
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid refund amount",
        variant: "destructive",
      });
      return;
    }

    if (payment && amount > Number(payment.amount)) {
      toast({
        title: "Error",
        description: "Refund amount cannot exceed payment amount",
        variant: "destructive",
      });
      return;
    }

    refundMutation.mutate({ amount, reason: refundReason });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !payment) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            {error ? "Failed to load payment details" : "Payment not found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Management</span>
            <PaymentStatusBadge
              status={payment.status}
              method={payment.method}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payment ID</p>
              <p className="font-mono text-sm">{payment.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm">{payment.orderId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                {formatPrice(Number(payment.amount), payment.currency)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <PaymentMethodIcon method={payment.method} showLabel />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="text-sm">{payment.provider}</p>
            </div>
            {payment.providerPaymentId && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Provider Payment ID
                </p>
                <p className="font-mono text-xs">{payment.providerPaymentId}</p>
              </div>
            )}
            {payment.checkoutId && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Checkout ID</p>
                <p className="font-mono text-xs">{payment.checkoutId}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-2">
            {payment.status === "CASH_PENDING" && (
              <Button
                onClick={handleConfirmCash}
                disabled={confirmCashMutation.isPending}
                size="sm"
              >
                <CheckCircle className="mr-2 size-4" />
                Confirm Cash Received
              </Button>
            )}
            {(payment.status === "PAID" ||
              payment.status === "CASH_RECEIVED") && (
              <Button
                onClick={() => setRefundDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="mr-2 size-4" />
                Process Refund
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 size-4" />
              Print Receipt
            </Button>
            <Button variant="outline" size="sm" className="no-print">
              <FileText className="mr-2 size-4" />
              Add Note
            </Button>
            <Button variant="outline" size="sm" className="no-print">
              <Download className="mr-2 size-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {payment.customerName ||
                  payment.order?.customerName ||
                  payment.order?.user?.name ||
                  "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">
                {payment.customerEmail ||
                  payment.order?.customerEmail ||
                  payment.order?.user?.email ||
                  "N/A"}
              </p>
            </div>
            {payment.order?.phone && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{payment.order.phone}</p>
              </div>
            )}
            {payment.order?.user?.id && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{payment.order.user.id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information for Cash Payments */}
      {payment.method === "CASH_ON_DELIVERY" && (
        <DeliveryTracking
          payment={payment as PaymentDetailData}
          isAdmin={true}
        />
      )}

      {/* Order Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Order Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Status</p>
              <p className="font-medium capitalize">
                {payment.order?.status?.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Total</p>
              <p className="font-semibold">
                {formatPrice(
                  Number(payment.order?.total || 0),
                  payment.order?.currency || payment.currency
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(payment.order?.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Updated</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(
                    payment.order?.updatedAt || payment.updatedAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payment.order?.items?.map((item) => (
            <ProductDetailCard
              key={item.id}
              item={item}
              currency={payment.order?.currency || payment.currency}
              showAdminInfo={true}
            />
          ))}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <PricingBreakdown
        payment={payment as PaymentDetailData}
        showDetailedAnalysis={true}
      />

      {/* Payment Timeline */}
      {payment.timeline && payment.timeline.length > 0 && (
        <PaymentTimeline events={payment.timeline} showAdminDetails={true} />
      )}

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Enter the refund amount and reason. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0"
                max={Number(payment.amount)}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`Max: ${formatPrice(Number(payment.amount), payment.currency)}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason (Optional)</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
              disabled={refundMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={refundMutation.isPending}>
              {refundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
