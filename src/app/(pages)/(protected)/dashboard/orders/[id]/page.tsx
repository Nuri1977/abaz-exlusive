"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Package,
} from "lucide-react";

import type { Order } from "@/types/Order";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/user/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  const json = (await res.json()) as { data: Order };
  return json.data;
}

export default function UserOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["user-order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="text-destructive">Failed to load order details</div>
        <Button onClick={() => router.push("/dashboard/orders")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  type VariantOption = {
    optionValue?: {
      value?: string;
      option?: { name?: string };
    };
  };

  type OrderItem = {
    variant?: {
      options?: VariantOption[];
      sku?: string;
    };
    Product?: {
      name?: string | null;
      brand?: string | null;
      style?: string | null;
    };
    price: number;
    quantity: number;
    id: string;
  };

  const getVariantDisplay = (item: OrderItem) => {
    if (!item?.variant?.options || item?.variant?.options.length === 0) {
      return "-";
    }

    return (
      item?.variant?.options
        ?.map((opt) => {
          const name = opt?.optionValue?.option?.name;
          const value = opt?.optionValue?.value;
          return name ? `${name}: ${value}` : value;
        })
        ?.filter((v): v is string => Boolean(v))
        ?.join(" / ") ?? "-"
    );
  };

  const totalItems =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/orders")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              Order #{order.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <DollarSign className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatPrice(Number(order.total))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Package className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalItems}</span>
              <span className="text-sm text-muted-foreground">
                {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${getPaymentStatusColor(
                order.paymentStatus
              )}`}
            >
              {order.paymentStatus}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Created
                </div>
                <div className="text-base">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </div>
                <div className="text-base">
                  {new Date(order.updatedAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.updatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <div className="rounded-md border bg-muted/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Full Order ID
              </div>
              <div className="mt-1 break-all font-mono text-xs">{order.id}</div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
              {order.shippingAddress}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Order Items
          </CardTitle>
          <CardDescription>
            {order.items?.length || 0} product(s) • {totalItems} total item(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Options
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Price
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-medium">
                        {item.Product?.name || "Unknown Product"}
                      </div>
                      {item.Product?.brand && (
                        <div className="text-xs text-muted-foreground">
                          Brand: {item.Product.brand}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm">{getVariantDisplay(item)}</td>
                    <td className="p-4 text-right tabular-nums">
                      {formatPrice(Number(item.price))}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold tabular-nums">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2">
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-right text-base font-semibold"
                  >
                    Total Amount:
                  </td>
                  <td className="p-4 text-right text-xl font-bold tabular-nums">
                    {formatPrice(Number(order.total))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
