"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  MapPin,
  Package,
  Trash2,
  User,
} from "lucide-react";

import type { Order } from "@/types/Order";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  const json = await res.json();
  return json.data;
}

async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<Order> {
  const res = await fetch("/api/admin/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

async function deleteOrder(orderId: string): Promise<void> {
  const res = await fetch(`/api/admin/orders/${orderId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order");
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-order", orderId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      router.push("/admin-dashboard/orders");
    },
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
        <Button onClick={() => router.push("/admin-dashboard/orders")}>
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
    optionValue?: { value?: string };
  };

  type OrderItem = {
    variant?: {
      options?: VariantOption[];
      sku?: string;
    };
    Product?: {
      name?: string;
      brand?: string;
      style?: string;
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
        ?.map((opt) => opt?.optionValue?.value)
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
            onClick={() => router.push("/admin-dashboard/orders")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              Order #{order.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
          <Select
            value={order.status}
            onValueChange={(status) => statusMutation.mutate({ status })}
            disabled={statusMutation.isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Status Update Alert */}
      {statusMutation.isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Order status has been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {statusMutation.isError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            Failed to update order status. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
                {Number(order.total).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">MKD</span>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Order Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-lg font-semibold">
              {order.user ? "Registered" : "Guest"}
            </span>
            <p className="text-xs text-muted-foreground">
              {order.user ? "Account order" : "Guest checkout"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Name
              </div>
              <div className="text-base font-medium">
                {order.customerName || order.user?.name || "Guest"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Email
              </div>
              <div className="text-base">
                {order.customerEmail || order.user?.email || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Phone
              </div>
              <div className="text-base">{order.phone || "-"}</div>
            </div>
            {order.user && (
              <div className="rounded-md border bg-muted/50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Registered Account
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-medium">{order.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.user.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    User ID: {order.user.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
              {order.billingAddress}
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
                    SKU
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
                      {item.Product?.style && (
                        <div className="text-xs text-muted-foreground">
                          Style: {item.Product.style}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {item.variant?.sku || "-"}
                      </code>
                    </td>
                    <td className="p-4 text-sm">{getVariantDisplay(item)}</td>
                    <td className="p-4 text-right tabular-nums">
                      {Number(item.price).toFixed(2)} MKD
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold tabular-nums">
                      {(Number(item.price) * item.quantity).toFixed(2)} MKD
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2">
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-right text-base font-semibold"
                  >
                    Total Amount:
                  </td>
                  <td className="p-4 text-right text-xl font-bold tabular-nums">
                    {Number(order.total).toFixed(2)} MKD
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Deleting this order will permanently
              remove all associated data including order items and customer
              information.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate();
                setDeleteDialogOpen(false);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
