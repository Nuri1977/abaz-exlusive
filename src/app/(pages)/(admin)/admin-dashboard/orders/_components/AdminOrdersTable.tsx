"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2, Printer, Search } from "lucide-react";

import { type Order } from "@/types/Order";
import {
  deleteOrder,
  fetchOrders,
  updateOrderStatus,
  type PaginatedOrdersResponse,
} from "@/lib/query/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DeleteOrderDialog } from "./DeleteOrderDialog";
import { OrderStatusActions } from "./OrderStatusActions";

export function AdminOrdersTable() {
  const queryClient = useQueryClient();

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting and Filtering
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState<"all" | "new" | "finished">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch Orders
  const { data: ordersResponse, isLoading } = useQuery<PaginatedOrdersResponse>(
    {
      queryKey: ["admin-orders", pagination.pageIndex + 1, pagination.pageSize],
      queryFn: () =>
        fetchOrders({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        }),
    }
  );

  const totalPages = ordersResponse?.pagination.totalPages ?? 0;
  const totalCount = ordersResponse?.pagination.totalCount ?? 0;

  // Mutations
  const statusMutation = useMutation({
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

  // Filter Data based on Tab
  const filteredData = useMemo(() => {
    const currentOrders = ordersResponse?.data ?? [];
    if (activeTab === "all") {
      return currentOrders;
    }
    if (activeTab === "new") {
      return currentOrders.filter(
        (order) => order.status === "PENDING" || order.status === "PROCESSING"
      );
    } else {
      return currentOrders.filter(
        (order) =>
          order.status === "SHIPPED" ||
          order.status === "DELIVERED" ||
          order.status === "CANCELLED"
      );
    }
  }, [ordersResponse, activeTab]);

  // Columns Definition
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Customer
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <div>{order.customerName || order.user?.name || "Guest"}</div>
            <div className="text-xs text-muted-foreground">
              {order.customerEmail || order.user?.email || "-"}
            </div>
            {order.user && (
              <div className="text-xs text-muted-foreground">
                (Account: {order.user.name})
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Status
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status;
        let colorClass = "bg-gray-100 text-gray-800";
        if (status === "PENDING") colorClass = "bg-yellow-100 text-yellow-800";
        else if (status === "PROCESSING")
          colorClass = "bg-blue-100 text-blue-800";
        else if (status === "SHIPPED")
          colorClass = "bg-purple-100 text-purple-800";
        else if (status === "DELIVERED")
          colorClass = "bg-green-100 text-green-800";
        else if (status === "CANCELLED") colorClass = "bg-red-100 text-red-800";

        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Total
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => `${row.original.total} MKD`,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            {activeTab === "finished" ? "Completed" : "Created"}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date =
          activeTab === "finished"
            ? row.original.updatedAt || row.original.createdAt
            : row.original.createdAt;
        return new Date(date).toLocaleString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <OrderStatusActions
          order={row.original}
          mutation={statusMutation}
          onDelete={() => setDeleteId(row.original.id)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination, // We don't pass pagination state here for manual pagination in the same way, but we can
    },
    manualPagination: true, // We handle pagination manually via the API
    pageCount: totalPages,
  });

  // Custom filter function for search
  // Since we are filtering the *fetched* data client-side, we can use TanStack's global filter or just rely on the API search if we implemented it.
  // The previous implementation did client-side search on the fetched page.
  // Let's stick to that for now, but we can add a search input that calls setGlobalFilter if we wanted.
  // However, the previous implementation had a specific search input.
  // I'll add a search input that filters the *current view*.
  // Wait, if I filter the current view, I might end up with 0 results even if there are matches on other pages.
  // Ideally, search should trigger a refetch.
  // The `fetchOrders` function supports `search`.
  // Let's implement SERVER-SIDE search.

  // Update query when search changes (debounced ideally, but for now direct)
  // Actually, let's keep it simple and just use the search param in the query key if we want server side.
  // But the previous implementation was client-side on the page.
  // "Apply search filter... if (newSearchTerm) ..."
  // I will implement CLIENT-SIDE search on the current page to match behavior,
  // BUT I will also provide a way to search globally if the user wants?
  // No, let's just stick to the requested "enhance pagination" and port the existing logic.
  // Existing logic: Client side search on the fetched page.
  // I will implement that by filtering `filteredData` further before passing to table?
  // Or using TanStack's global filter.
  // Let's use TanStack's global filter.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="no-print"
        >
          <Printer className="mr-2 size-4" />
          Print List
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "new" | "finished")}
        className="w-full"
      >
        <TabsList className="no-print mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="new">New Orders</TabsTrigger>
          <TabsTrigger value="finished">Finished Orders</TabsTrigger>
        </TabsList>

        <div className="no-print mb-4 flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search in this page..."
              value={
                (table.getColumn("customerName")?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn("customerName")
                  ?.setFilterValue(event.target.value)
              }
              className="pl-9"
            />
          </div>
          {/* Status filter could go here if we want to filter within the tab further */}
        </div>

        <TabsContent value="all" className="space-y-4">
          <OrderTableContent
            table={table}
            isLoading={isLoading}
            columns={columns}
            statusMutation={statusMutation}
            setDeleteId={setDeleteId}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <OrderTableContent
            table={table}
            isLoading={isLoading}
            columns={columns}
            statusMutation={statusMutation}
            setDeleteId={setDeleteId}
          />
        </TabsContent>

        <TabsContent value="finished" className="space-y-4">
          <OrderTableContent
            table={table}
            isLoading={isLoading}
            columns={columns}
            statusMutation={statusMutation}
            setDeleteId={setDeleteId}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="no-print flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            totalCount
          )}{" "}
          of {totalCount} orders
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageIndex: 0, // Reset to first page on size change
                }));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.pageIndex > 0) {
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: prev.pageIndex - 1,
                      }));
                    }
                  }}
                  aria-disabled={pagination.pageIndex === 0}
                  className={
                    pagination.pageIndex === 0
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => {
                const page = i;
                const currentPage = pagination.pageIndex;

                if (
                  page === 0 ||
                  page === totalPages - 1 ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPagination((prev) => ({
                            ...prev,
                            pageIndex: page,
                          }));
                        }}
                        isActive={page === currentPage}
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.pageIndex < totalPages - 1) {
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: prev.pageIndex + 1,
                      }));
                    }
                  }}
                  aria-disabled={pagination.pageIndex >= totalPages - 1}
                  className={
                    pagination.pageIndex >= totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <DeleteOrderDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function OrderTableContent({
  table,
  isLoading,
  columns,
  statusMutation,
  setDeleteId,
}: {
  table: TanStackTable<Order>;
  isLoading: boolean;
  columns: ColumnDef<Order>[];
  statusMutation: UseMutationResult<
    Order,
    Error,
    { orderId: string; status: string },
    unknown
  >;
  setDeleteId: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    window.location.href = `/admin-dashboard/orders/${row.original.id}`;
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center gap-2 rounded-md border">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const order = row.original;
            const status = order.status;
            let colorClass = "bg-gray-100 text-gray-800";
            if (status === "PENDING")
              colorClass = "bg-yellow-100 text-yellow-800";
            else if (status === "PROCESSING")
              colorClass = "bg-blue-100 text-blue-800";
            else if (status === "SHIPPED")
              colorClass = "bg-purple-100 text-purple-800";
            else if (status === "DELIVERED")
              colorClass = "bg-green-100 text-green-800";
            else if (status === "CANCELLED")
              colorClass = "bg-red-100 text-red-800";

            return (
              <div
                key={order.id}
                className="relative space-y-3 rounded-lg border bg-card p-4 shadow-sm"
                onClick={() => {
                  window.location.href = `/admin-dashboard/orders/${order.id}`;
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold">
                    #{order.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}
                    >
                      {status}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <OrderStatusActions
                        order={order}
                        mutation={statusMutation}
                        onDelete={() => setDeleteId(order.id)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {order.customerName || order.user?.name || "Guest"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.customerEmail || order.user?.email || "-"}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2 text-xs">
                  <div className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="font-bold text-primary">
                    {order.total} MKD
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
