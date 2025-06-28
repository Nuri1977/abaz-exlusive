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
    <div>
      <h1 className="mb-6 text-3xl font-bold">Orders</h1>
      <div className="overflow-x-auto rounded border bg-background p-4 shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-left">Order #</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Actions</th>
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
                <td className="px-3 py-2 font-mono text-xs">
                  {order?.id?.slice(0, 8)}
                </td>
                <td className="px-3 py-2">
                  {order?.user?.name || "Guest"}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {order?.user?.email || "-"}
                  </span>
                </td>
                <td className="px-3 py-2">{order?.phone || "-"}</td>
                <td className="px-3 py-2 font-semibold">{order?.status}</td>
                <td className="px-3 py-2">{order?.total} MKD</td>
                <td className="px-3 py-2">
                  {new Date(order?.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <OrderStatusActions
                    order={order}
                    mutation={statusMutation}
                    onDelete={() => setDeleteId(order.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
}: {
  order: any;
  mutation: any;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-2">
      {order?.status === "PENDING" && (
        <>
          <Button
            size="sm"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ orderId: order.id, status: "PROCESSING" })
            }
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ orderId: order.id, status: "CANCELLED" })
            }
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
            mutation.mutate({ orderId: order.id, status: "SHIPPED" })
          }
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
            mutation.mutate({ orderId: order.id, status: "DELIVERED" })
          }
        >
          Mark Delivered
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive/10"
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
