"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, CreditCard, Download, Package } from "lucide-react";

import { fetchUserPaymentById } from "@/lib/query/user-payments";
import type { UserPaymentTableData } from "@/types/user-payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryTracking } from "@/components/payments/DeliveryTracking";
import { PaymentMethodIcon } from "@/components/payments/PaymentMethodIcon";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { PaymentTimeline } from "@/components/payments/PaymentTimeline";
import { PricingBreakdown } from "@/components/payments/PricingBreakdown";
import { ProductDetailCard } from "@/components/payments/ProductDetailCard";

// Helper function to extract cart items from payment metadata
function getCartItemsFromMetadata(metadata: unknown) {
  try {
    // Type guard to check if metadata is an object
    if (!metadata || typeof metadata !== 'object') return [];

    const metadataObj = metadata as Record<string, unknown>;

    if (!metadataObj.cartItems) return [];

    let cartItems: unknown;
    if (typeof metadataObj.cartItems === 'string') {
      cartItems = JSON.parse(metadataObj.cartItems) as unknown;
    } else {
      cartItems = metadataObj.cartItems;
    }

    if (!Array.isArray(cartItems)) return [];

    // Convert cart items to order item format for ProductDetailCard
    return cartItems.map((item: unknown, index: number) => {
      // Type guard for item
      const itemObj = item && typeof item === 'object' ? item as Record<string, unknown> : {};

      return {
        id: `metadata-item-${index}`,
        quantity: typeof itemObj.quantity === 'number' ? itemObj.quantity : 1,
        price: typeof itemObj.price === 'number' ? itemObj.price :
          typeof itemObj.unitPrice === 'number' ? itemObj.unitPrice : 0,
        Product: {
          id: typeof itemObj.productId === 'string' ? itemObj.productId : `unknown-${index}`,
          name: typeof itemObj.title === 'string' ? itemObj.title :
            typeof itemObj.productName === 'string' ? itemObj.productName : 'Unknown Product',
          slug: typeof itemObj.productSlug === 'string' ? itemObj.productSlug : '',
          images: typeof itemObj.imageUrl === 'string' ? [{ url: itemObj.imageUrl }] : [],
          brand: typeof itemObj.brand === 'string' ? itemObj.brand : undefined,
          category: undefined,
          collection: undefined,
        },
        variant: typeof itemObj.variantId === 'string' ? {
          id: itemObj.variantId,
          sku: typeof itemObj.variantSku === 'string' ? itemObj.variantSku : '',
          options: typeof itemObj.variantOptions === 'string' ? [{
            optionValue: {
              id: 'metadata-option',
              value: itemObj.variantOptions,
              option: { name: 'Options' }
            }
          }] : []
        } : undefined,
      };
    });
  } catch (error) {
    console.error('Failed to parse cart items from metadata:', error);
    return [];
  }
}

interface UserPaymentDetailViewProps {
  paymentId: string;
}

export function UserPaymentDetailView({
  paymentId,
}: UserPaymentDetailViewProps) {
  const {
    data: payment,
    isLoading,
    error,
  } = useQuery<UserPaymentTableData>({
    queryKey: ["user-payment", paymentId],
    queryFn: () => fetchUserPaymentById(paymentId),
  });



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
      {/* Payment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Summary</span>
            <PaymentStatusBadge
              status={payment.status}
              method={payment.method}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
                {Number(payment.amount).toFixed(2)} {payment.currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <PaymentMethodIcon method={payment.method} showLabel />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(payment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {payment.confirmedAt && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <p className="text-sm">
                    {new Date(payment.confirmedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {payment.failureReason && (
            <div className="rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Payment Failed
              </p>
              <p className="text-sm text-muted-foreground">
                {payment.failureReason}
              </p>
            </div>
          )}

          {payment.refundedAmount && Number(payment.refundedAmount) > 0 && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Refund Processed
              </p>
              <p className="text-sm text-muted-foreground">
                Amount: {Number(payment.refundedAmount).toFixed(2)}{" "}
                {payment.currency}
              </p>
              {payment.refundedAt && (
                <p className="text-sm text-muted-foreground">
                  Date:{" "}
                  {new Date(payment.refundedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Information for Cash Payments */}
      {payment.method === "CASH_ON_DELIVERY" && (
        <DeliveryTracking payment={payment} />
      )}

      {/* Order Information */}
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
                {Number(payment.order?.total || 0).toFixed(2)}{" "}
                {payment.order?.currency}
              </p>
            </div>
          </div>

          {payment.order?.deliveryNotes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Delivery Notes</p>
              <p className="text-sm">{payment.order.deliveryNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            // Try to get items from order first, then fallback to metadata
            const orderItems = payment.order?.items || [];
            const hasValidOrderItems = orderItems.some(item => item.Product && item.Product.name);
            const metadataItems = !hasValidOrderItems ? getCartItemsFromMetadata(payment.metadata) : [];
            const itemsToDisplay = hasValidOrderItems ? orderItems : metadataItems;

            // Debug logging


            if (itemsToDisplay.length === 0) {
              return (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Package className="mr-2 size-5" />
                  No items found
                </div>
              );
            }

            return itemsToDisplay.map((item, index) => (
              <ProductDetailCard
                key={item.id || `item-${index}`}
                item={item}
                currency={payment.currency}
              />
            ));
          })()}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <PricingBreakdown payment={payment as unknown} />

      {/* Payment Timeline */}
      {payment.timeline && payment.timeline.length > 0 && (
        <PaymentTimeline
          events={payment.timeline}
        />
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" variant="outline">
            <Download className="mr-2 size-4" />
            Download Receipt
          </Button>
          {payment.status === "PAID" && (
            <Button className="w-full" variant="outline">
              Request Refund
            </Button>
          )}
          <Button className="w-full" variant="outline">
            Contact Support
          </Button>
        </CardContent>
      </Card>
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
          <div className="grid gap-4 sm:grid-cols-2">
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
