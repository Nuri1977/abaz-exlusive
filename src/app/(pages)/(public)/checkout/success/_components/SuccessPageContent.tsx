"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { formatCurrency } from "@/lib/checkout-utils";
import { getOrderStatus } from "@/lib/query/checkout";

// Define proper types for the order data
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  Product?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    variantOptions?: { name: string; value: string }[];
  };
}

interface OrderData {
  id: string;
  total: number;
  currency: string;
  paymentStatus: string;
  customerEmail?: string;
  customerName?: string;
  status: string;
  items?: OrderItem[];
}

export function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const checkoutId = searchParams.get("checkout_id");
  const customerSessionToken = searchParams.get("customer_session_token");
  const { clearCart } = useCartContext();
  const cartClearedRef = useRef(false);

  // Clear cart on successful payment - only once using ref to avoid dependency issues
  useEffect(() => {
    if ((orderId || checkoutId || paymentId) && !cartClearedRef.current) {
      clearCart();
      cartClearedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, checkoutId, paymentId]); // Intentionally excluding clearCart to prevent infinite loop

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await getOrderStatus(orderId!);
      return response as OrderData & {
        checkoutId?: string;
        latestPayment?: {
          checkoutId?: string;
        };
      };
    },
    enabled: !!orderId,
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-600">
          Order ID: {orderId || "Unknown"}
        </p>
        {paymentId && (
          <p className="text-sm text-gray-600">Payment ID: {paymentId}</p>
        )}
        {(checkoutId || order?.latestPayment?.checkoutId) && (
          <p className="text-sm text-gray-600">
            Checkout ID: {checkoutId || order?.latestPayment?.checkoutId}
          </p>
        )}
        {customerSessionToken && (
          <p className="text-sm text-gray-600">
            Session: {customerSessionToken.slice(0, 20)}...
          </p>
        )}
        {error && (
          <div className="space-y-1">
            <p className="text-sm text-red-600">
              Error:{" "}
              {error instanceof Error ? error.message : "Failed to load order"}
            </p>
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="mt-1 whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        )}
        <p className="text-xs text-gray-500">
          If you have any questions, please contact support with the above IDs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Order Number:</span>
          <span className="font-medium">
            {order?.id ? order.id.slice(-8).toUpperCase() : "N/A"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-medium">
            {formatCurrency(
              Number(order?.total || 0),
              order?.currency || "MKD"
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Payment Status:</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                order?.paymentStatus === "PAID"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {order?.paymentStatus || "Processing"}
            </span>
            {order?.paymentStatus !== "PAID" && (
              <button
                onClick={async () => {
                  if (paymentId) {
                    try {
                      await api.post(`/payments/${paymentId}/refresh`);
                      window.location.reload();
                    } catch (error) {
                      console.error("Failed to refresh payment:", error);
                      window.location.reload();
                    }
                  } else {
                    window.location.reload();
                  }
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
        {order?.customerEmail && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{order.customerEmail}</span>
          </div>
        )}
      </div>

      {order?.items && order.items.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Order Items:</h4>
          <div className="space-y-2">
            {order.items.map((item: OrderItem, index: number) => (
              <div
                key={index}
                className="flex justify-between rounded bg-gray-50 p-2 text-sm"
              >
                <div className="flex flex-col">
                  <span>{item?.Product?.name || "Product"}</span>
                  {/* Dynamic Variant Options */}
                  {item.variant?.variantOptions && item.variant.variantOptions.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] uppercase text-gray-500">
                      {item.variant.variantOptions.map((opt, idx) => (
                        <span key={idx}>{opt.name}: {opt.value}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span>
                  {item?.quantity}x{" "}
                  {formatCurrency(
                    Number(item?.price || 0),
                    order?.currency || "MKD"
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
