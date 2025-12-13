"use client";

import { Receipt } from "lucide-react";

import type { PaymentDetailData } from "@/types/payment-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PricingBreakdownProps {
  payment: PaymentDetailData;
  showDetailedAnalysis?: boolean; // Admin only
}

export function PricingBreakdown({
  payment,
  showDetailedAnalysis = false,
}: PricingBreakdownProps) {
  // Calculate subtotal from order items
  const subtotal =
    payment.order?.items?.reduce((sum, item) => {
      const unitPrice = Number(item.variant?.price || item.price);
      return sum + unitPrice * item.quantity;
    }, 0) || 0;

  const total = Number(payment.order?.total || payment.amount);
  const shipping = 0; // TODO: Add shipping calculation
  const tax = 0; // TODO: Add tax calculation
  const discount = subtotal + shipping + tax - total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="size-5" />
          Pricing Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Itemized Products */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Items</p>
          {payment.order?.items?.map((item) => {
            const unitPrice = Number(item.variant?.price || item.price);
            const itemTotal = unitPrice * item.quantity;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    {item.Product?.name || "Product"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {unitPrice.toFixed(2)} {payment.currency}
                  </p>
                </div>
                <p className="font-medium">
                  {itemTotal.toFixed(2)} {payment.currency}
                </p>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Subtotal</p>
          <p className="font-medium">
            {subtotal.toFixed(2)} {payment.currency}
          </p>
        </div>

        {/* Shipping */}
        {shipping > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Shipping</p>
            <p className="font-medium">
              {shipping.toFixed(2)} {payment.currency}
            </p>
          </div>
        )}

        {/* Tax */}
        {tax > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Tax</p>
            <p className="font-medium">
              {tax.toFixed(2)} {payment.currency}
            </p>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Discount</p>
            <p className="font-medium text-green-600">
              -{discount.toFixed(2)} {payment.currency}
            </p>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Total</p>
          <p className="text-lg font-bold">
            {total.toFixed(2)} {payment.currency}
          </p>
        </div>

        {/* Refund Information */}
        {payment.refundedAmount && Number(payment.refundedAmount) > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Refunded Amount</p>
              <p className="font-medium text-blue-600">
                -{Number(payment.refundedAmount).toFixed(2)} {payment.currency}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-semibold">Net Amount</p>
              <p className="font-bold">
                {(total - Number(payment.refundedAmount)).toFixed(2)}{" "}
                {payment.currency}
              </p>
            </div>
          </>
        )}

        {/* Admin Analysis */}
        {showDetailedAnalysis && (
          <>
            <Separator />
            <div className="space-y-2 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">Admin Analysis</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-medium">{payment.provider}</span>
                </div>
                {payment.providerPaymentId && (
                  <div className="flex justify-between">
                    <span>Provider ID:</span>
                    <span className="font-mono text-xs">
                      {payment.providerPaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
