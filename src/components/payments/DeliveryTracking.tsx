"use client";

import { Calendar, CheckCircle, MapPin, Package, Truck } from "lucide-react";

import type { PaymentDetailData } from "@/types/payment-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeliveryTrackingProps {
  payment: PaymentDetailData;
  isAdmin?: boolean;
}

export function DeliveryTracking({
  payment,
  isAdmin = false,
}: DeliveryTrackingProps) {
  // Determine delivery status based on payment status
  const getDeliveryStatus = () => {
    switch (payment.status) {
      case "CASH_PENDING":
        return payment.order?.deliveryDate ? "scheduled" : "pending";
      case "CASH_RECEIVED":
        return "delivered";
      default:
        return "pending";
    }
  };

  const deliveryStatus = getDeliveryStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Truck className="size-5" />
            Delivery Information
          </span>
          <DeliveryStatusBadge status={deliveryStatus} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery Address */}
        {(payment.deliveryAddress || payment.order?.shippingAddress) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              Delivery Address
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              {payment.deliveryAddress || payment.order?.shippingAddress}
            </p>
          </div>
        )}

        {/* Scheduled Delivery Date */}
        {payment.order?.deliveryDate && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="size-4 text-muted-foreground" />
              Scheduled Delivery
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              {new Date(payment.order.deliveryDate).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        )}

        {/* Delivery Notes */}
        {(payment.deliveryNotes || payment.order?.deliveryNotes) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="size-4 text-muted-foreground" />
              Delivery Notes
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              {payment.deliveryNotes || payment.order?.deliveryNotes}
            </p>
          </div>
        )}

        {/* Delivery Status Timeline */}
        <div className="space-y-3 pt-4">
          <p className="text-sm font-medium">Delivery Progress</p>
          <div className="space-y-2">
            <DeliveryStep
              label="Order Confirmed"
              completed={true}
              active={deliveryStatus === "pending"}
            />
            <DeliveryStep
              label="Scheduled for Delivery"
              completed={
                deliveryStatus === "scheduled" || deliveryStatus === "delivered"
              }
              active={deliveryStatus === "scheduled"}
            />
            <DeliveryStep
              label="Delivered & Payment Received"
              completed={deliveryStatus === "delivered"}
              active={deliveryStatus === "delivered"}
            />
          </div>
        </div>

        {/* Confirmed Delivery Info */}
        {payment.status === "CASH_RECEIVED" && payment.confirmedAt && (
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Payment Received
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Confirmed on{" "}
                  {new Date(payment.confirmedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {isAdmin && payment.confirmedBy && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    By: {payment.confirmedBy}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Delivery Info */}
        {payment.status === "CASH_PENDING" && (
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Awaiting Delivery
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please have the exact amount ready for the delivery person.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeliveryStatusBadge({
  status,
}: {
  status: "pending" | "scheduled" | "delivered";
}) {
  const config = {
    pending: {
      label: "Pending",
      variant: "secondary" as const,
    },
    scheduled: {
      label: "Scheduled",
      variant: "default" as const,
    },
    delivered: {
      label: "Delivered",
      variant: "default" as const,
    },
  };

  const { label, variant } = config[status];

  return (
    <Badge
      variant={variant}
      className={status === "delivered" ? "bg-green-600" : ""}
    >
      {label}
    </Badge>
  );
}

function DeliveryStep({
  label,
  completed,
  active,
}: {
  label: string;
  completed: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-6 items-center justify-center rounded-full ${completed
            ? "bg-green-600 text-white"
            : active
              ? "border-2 border-blue-600 bg-blue-50 dark:bg-blue-950"
              : "border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          }`}
      >
        {completed && <CheckCircle className="size-4" />}
        {active && !completed && (
          <div className="size-2 rounded-full bg-blue-600" />
        )}
      </div>
      <p
        className={`text-sm ${completed || active
            ? "font-medium text-foreground"
            : "text-muted-foreground"
          }`}
      >
        {label}
      </p>
    </div>
  );
}
