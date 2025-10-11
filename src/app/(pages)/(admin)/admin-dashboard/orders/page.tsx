"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Order } from "@/types/Order";
import {
  deleteOrder,
  fetchOrders,
  updateOrderStatus,
} from "@/lib/query/orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage customer orders and track their status.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-lg border bg-background shadow-sm md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">Order #</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading orders...
                </td>
              </tr>
            )}
            {!isLoading && orders?.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No orders found.
                </td>
              </tr>
            )}
            {orders?.map((order) => (
              <tr key={order?.id} className="border-b hover:bg-accent/30">
                <td className="px-4 py-3 font-mono text-xs">
                  {order?.id?.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <div>
                    {order?.customerName || order?.user?.name || "Guest"}
                    <div className="text-xs text-muted-foreground">
                      {order?.customerEmail || order?.user?.email || "-"}
                    </div>
                    {order?.user && (
                      <div className="text-xs text-muted-foreground">
                        (Account: {order?.user?.name} / {order?.user?.email})
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{order?.phone || "-"}</td>
                <td className="px-4 py-3 font-semibold">{order?.status}</td>
                <td className="px-4 py-3">{order?.total} MKD</td>
                <td className="px-4 py-3">
                  {new Date(order?.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusActions
                    order={order}
                    mutation={statusMutation}
                    onDelete={() => setDeleteId(order?.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block space-y-4 md:hidden">
        {isLoading && (
          <div className="py-8 text-center text-muted-foreground">
            Loading orders...
          </div>
        )}
        {!isLoading && orders?.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No orders found.
          </div>
        )}
        {orders?.map((order) => (
          <div
            key={order?.id}
            className="rounded-lg border bg-background p-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-medium">
                    #{order?.id?.slice(0, 8)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order?.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{order?.status}</div>
                  <div className="text-sm font-medium">{order?.total} MKD</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-medium">
                  {order?.customerName || order?.user?.name || "Guest"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order?.customerEmail || order?.user?.email || "-"}
                </div>
                {order?.phone && (
                  <div className="text-sm text-muted-foreground">
                    Phone: {order?.phone}
                  </div>
                )}
                {order?.user && (
                  <div className="text-xs text-muted-foreground">
                    Account: {order?.user?.name} / {order?.user?.email}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <OrderStatusActions
                  order={order}
                  mutation={statusMutation}
                  onDelete={() => setDeleteId(order?.id)}
                  mobile={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteOrderDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function OrderStatusActions({
  order,
  mutation,
  onDelete,
  mobile = false,
}: {
  order: any;
  mutation: any;
  onDelete: () => void;
  mobile?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${mobile ? "flex-wrap" : ""}`}>
      {order?.status === "PENDING" && (
        <>
          <Button
            size="sm"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ orderId: order?.id, status: "PROCESSING" })
            }
            className={mobile ? "flex-1" : ""}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ orderId: order?.id, status: "CANCELLED" })
            }
            className={mobile ? "flex-1" : ""}
          >
            Decline
          </Button>
        </>
      )}
      {order?.status === "PROCESSING" && (
        <Button
          size="sm"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate({ orderId: order?.id, status: "SHIPPED" })
          }
          className={mobile ? "flex-1" : ""}
        >
          Mark Shipped
        </Button>
      )}
      {order?.status === "SHIPPED" && (
        <Button
          size="sm"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate({ orderId: order?.id, status: "DELIVERED" })
          }
          className={mobile ? "flex-1" : ""}
        >
          Mark Delivered
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className={`border-destructive text-destructive hover:bg-destructive/10 ${mobile ? "mt-2 w-full" : ""}`}
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}

function DeleteOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to delete this order? This action cannot be
          undone.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
