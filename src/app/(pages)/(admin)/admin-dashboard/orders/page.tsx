"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SortField = "createdAt" | "total" | "status" | "customerName";
type SortDirection = "asc" | "desc" | null;

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  const statusMutation = useMutation<
    Order,
    Error,
    { orderId: string; status: string }
  >({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter states for New Orders
  const [newSearchTerm, setNewSearchTerm] = useState("");
  const [newStatusFilter, setNewStatusFilter] = useState("all");
  const [newSortField, setNewSortField] = useState<SortField | null>(null);
  const [newSortDirection, setNewSortDirection] = useState<SortDirection>(null);

  // Filter states for Finished Orders
  const [finishedSearchTerm, setFinishedSearchTerm] = useState("");
  const [finishedStatusFilter, setFinishedStatusFilter] = useState("all");
  const [finishedSortField, setFinishedSortField] = useState<SortField | null>(
    null
  );
  const [finishedSortDirection, setFinishedSortDirection] =
    useState<SortDirection>(null);

  const handleSort = (
    field: SortField,
    currentField: SortField | null,
    currentDirection: SortDirection,
    setField: (field: SortField | null) => void,
    setDirection: (direction: SortDirection) => void
  ) => {
    if (currentField === field) {
      // Cycle through: asc -> desc -> null
      if (currentDirection === "asc") {
        setDirection("desc");
      } else if (currentDirection === "desc") {
        setField(null);
        setDirection(null);
      }
    } else {
      setField(field);
      setDirection("asc");
    }
  };

  const sortOrders = (
    orders: Order[],
    sortField: SortField | null,
    sortDirection: SortDirection
  ) => {
    if (!sortField || !sortDirection) return orders;

    return [...orders].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a?.createdAt || 0).getTime();
          bValue = new Date(b?.createdAt || 0).getTime();
          break;
        case "total":
          aValue = Number(a?.total || 0);
          bValue = Number(b?.total || 0);
          break;
        case "status":
          aValue = a?.status || "";
          bValue = b?.status || "";
          break;
        case "customerName":
          aValue = (a?.customerName || a?.user?.name || "Guest").toLowerCase();
          bValue = (b?.customerName || b?.user?.name || "Guest").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Filter orders based on status
  const newOrders = useMemo(() => {
    let filtered = orders?.filter(
      (order) => order?.status === "PENDING" || order?.status === "PROCESSING"
    );

    // Apply search filter
    if (newSearchTerm) {
      filtered = filtered?.filter(
        (order) =>
          order?.id?.toLowerCase()?.includes(newSearchTerm.toLowerCase()) ||
          order?.customerName
            ?.toLowerCase()
            ?.includes(newSearchTerm.toLowerCase()) ||
          order?.customerEmail
            ?.toLowerCase()
            ?.includes(newSearchTerm.toLowerCase()) ||
          order?.user?.name
            ?.toLowerCase()
            ?.includes(newSearchTerm.toLowerCase()) ||
          order?.user?.email
            ?.toLowerCase()
            ?.includes(newSearchTerm.toLowerCase()) ||
          order?.phone?.toLowerCase()?.includes(newSearchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (newStatusFilter !== "all") {
      filtered = filtered?.filter((order) => order?.status === newStatusFilter);
    }

    // Apply sorting
    return sortOrders(filtered, newSortField, newSortDirection);
  }, [orders, newSearchTerm, newStatusFilter, newSortField, newSortDirection]);

  const finishedOrders = useMemo(() => {
    let filtered = orders?.filter(
      (order) =>
        order?.status === "SHIPPED" ||
        order?.status === "DELIVERED" ||
        order?.status === "CANCELLED"
    );

    // Apply search filter
    if (finishedSearchTerm) {
      filtered = filtered?.filter(
        (order) =>
          order?.id
            ?.toLowerCase()
            ?.includes(finishedSearchTerm.toLowerCase()) ||
          order?.customerName
            ?.toLowerCase()
            ?.includes(finishedSearchTerm.toLowerCase()) ||
          order?.customerEmail
            ?.toLowerCase()
            ?.includes(finishedSearchTerm.toLowerCase()) ||
          order?.user?.name
            ?.toLowerCase()
            ?.includes(finishedSearchTerm.toLowerCase()) ||
          order?.user?.email
            ?.toLowerCase()
            ?.includes(finishedSearchTerm.toLowerCase()) ||
          order?.phone
            ?.toLowerCase()
            ?.includes(finishedSearchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (finishedStatusFilter !== "all") {
      filtered = filtered?.filter(
        (order) => order?.status === finishedStatusFilter
      );
    }

    // Apply sorting
    return sortOrders(filtered, finishedSortField, finishedSortDirection);
  }, [
    orders,
    finishedSearchTerm,
    finishedStatusFilter,
    finishedSortField,
    finishedSortDirection,
  ]);

  const resetNewFilters = () => {
    setNewSearchTerm("");
    setNewStatusFilter("all");
    setNewSortField(null);
    setNewSortDirection(null);
  };

  const resetFinishedFilters = () => {
    setFinishedSearchTerm("");
    setFinishedStatusFilter("all");
    setFinishedSortField(null);
    setFinishedSortDirection(null);
  };

  const SortIcon = ({
    field,
    currentField,
    currentDirection,
  }: {
    field: SortField;
    currentField: SortField | null;
    currentDirection: SortDirection;
  }) => {
    if (currentField !== field) {
      return <ArrowUpDown className="ml-1 inline size-4 opacity-30" />;
    }
    if (currentDirection === "asc") {
      return <ArrowUp className="ml-1 inline size-4" />;
    }
    return <ArrowDown className="ml-1 inline size-4" />;
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Orders</h1>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="new">
            New Orders ({newOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finished Orders ({finishedOrders?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          {/* Filters for New Orders */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="relative min-w-[250px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer, email, phone..."
                value={newSearchTerm}
                onChange={(e) => setNewSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={newStatusFilter} onValueChange={setNewStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
              </SelectContent>
            </Select>
            {(newSearchTerm ||
              newStatusFilter !== "all" ||
              newSortField !== null) && (
              <Button
                variant="outline"
                size="icon"
                onClick={resetNewFilters}
                title="Clear filters"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="overflow-x-auto rounded border bg-background p-4 shadow">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left">Order #</th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "customerName",
                        newSortField,
                        newSortDirection,
                        setNewSortField,
                        setNewSortDirection
                      )
                    }
                  >
                    Customer
                    <SortIcon
                      field="customerName"
                      currentField={newSortField}
                      currentDirection={newSortDirection}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "status",
                        newSortField,
                        newSortDirection,
                        setNewSortField,
                        setNewSortDirection
                      )
                    }
                  >
                    Status
                    <SortIcon
                      field="status"
                      currentField={newSortField}
                      currentDirection={newSortDirection}
                    />
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "total",
                        newSortField,
                        newSortDirection,
                        setNewSortField,
                        setNewSortDirection
                      )
                    }
                  >
                    Total
                    <SortIcon
                      field="total"
                      currentField={newSortField}
                      currentDirection={newSortDirection}
                    />
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "createdAt",
                        newSortField,
                        newSortDirection,
                        setNewSortField,
                        setNewSortDirection
                      )
                    }
                  >
                    Created
                    <SortIcon
                      field="createdAt"
                      currentField={newSortField}
                      currentDirection={newSortDirection}
                    />
                  </th>
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
                {!isLoading && newOrders?.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {newSearchTerm || newStatusFilter !== "all"
                        ? "No orders match your filters."
                        : "No new orders found."}
                    </td>
                  </tr>
                )}
                {newOrders?.map((order) => (
                  <tr
                    key={order?.id}
                    className="cursor-pointer border-b hover:bg-accent/30"
                    onClick={() =>
                      (window.location.href = `/admin-dashboard/orders/${order?.id}`)
                    }
                  >
                    <td className="px-3 py-2 font-mono text-xs">
                      {order?.id?.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2">
                      {order?.customerName || order?.user?.name || "Guest"}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {order?.customerEmail || order?.user?.email || "-"}
                      </span>
                      {order?.user && (
                        <span className="block text-xs text-muted-foreground">
                          (Account: {order?.user?.name} / {order?.user?.email})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{order?.phone || "-"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          order?.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order?.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{order?.total} MKD</td>
                    <td className="px-3 py-2">
                      {new Date(order?.createdAt).toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
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
        </TabsContent>

        <TabsContent value="finished">
          {/* Filters for Finished Orders */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="relative min-w-[250px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer, email, phone..."
                value={finishedSearchTerm}
                onChange={(e) => setFinishedSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={finishedStatusFilter}
              onValueChange={setFinishedStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {(finishedSearchTerm ||
              finishedStatusFilter !== "all" ||
              finishedSortField !== null) && (
              <Button
                variant="outline"
                size="icon"
                onClick={resetFinishedFilters}
                title="Clear filters"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="overflow-x-auto rounded border bg-background p-4 shadow">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left">Order #</th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "customerName",
                        finishedSortField,
                        finishedSortDirection,
                        setFinishedSortField,
                        setFinishedSortDirection
                      )
                    }
                  >
                    Customer
                    <SortIcon
                      field="customerName"
                      currentField={finishedSortField}
                      currentDirection={finishedSortDirection}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "status",
                        finishedSortField,
                        finishedSortDirection,
                        setFinishedSortField,
                        setFinishedSortDirection
                      )
                    }
                  >
                    Status
                    <SortIcon
                      field="status"
                      currentField={finishedSortField}
                      currentDirection={finishedSortDirection}
                    />
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "total",
                        finishedSortField,
                        finishedSortDirection,
                        setFinishedSortField,
                        setFinishedSortDirection
                      )
                    }
                  >
                    Total
                    <SortIcon
                      field="total"
                      currentField={finishedSortField}
                      currentDirection={finishedSortDirection}
                    />
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2 text-left hover:bg-accent/50"
                    onClick={() =>
                      handleSort(
                        "createdAt",
                        finishedSortField,
                        finishedSortDirection,
                        setFinishedSortField,
                        setFinishedSortDirection
                      )
                    }
                  >
                    Completed
                    <SortIcon
                      field="createdAt"
                      currentField={finishedSortField}
                      currentDirection={finishedSortDirection}
                    />
                  </th>
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
                {!isLoading && finishedOrders?.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {finishedSearchTerm || finishedStatusFilter !== "all"
                        ? "No orders match your filters."
                        : "No finished orders found."}
                    </td>
                  </tr>
                )}
                {finishedOrders?.map((order) => (
                  <tr
                    key={order?.id}
                    className="cursor-pointer border-b hover:bg-accent/30"
                    onClick={() =>
                      (window.location.href = `/admin-dashboard/orders/${order?.id}`)
                    }
                  >
                    <td className="px-3 py-2 font-mono text-xs">
                      {order?.id?.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2">
                      {order?.customerName || order?.user?.name || "Guest"}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {order?.customerEmail || order?.user?.email || "-"}
                      </span>
                      {order?.user && (
                        <span className="block text-xs text-muted-foreground">
                          (Account: {order?.user?.name} / {order?.user?.email})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{order?.phone || "-"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          order?.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-800"
                            : order?.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order?.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{order?.total} MKD</td>
                    <td className="px-3 py-2">
                      {new Date(
                        order?.updatedAt || order?.createdAt
                      ).toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
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
        </TabsContent>
      </Tabs>

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
  order: Order;
  mutation: UseMutationResult<
    Order,
    Error,
    { orderId: string; status: string },
    unknown
  >;
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
