"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye, Loader2, MoreHorizontal } from "lucide-react";

import { type Order } from "@/types/Order";
import { fetchUserOrders } from "@/lib/query/user-orders";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Helper to safely get product image URL
function getProductImage(product: unknown): string | null {
  if (!product || typeof product !== "object") return null;

  const p = product as Record<string, unknown>;

  if (!Array.isArray(p.images)) return null;

  const images = p.images as unknown[];
  const firstImage = images[0];
  if (
    typeof firstImage === "object" &&
    firstImage !== null &&
    "url" in firstImage
  ) {
    return (firstImage as Record<string, unknown>).url as string;
  }
  return null;
}

export function UserOrdersTable() {
  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting and Filtering
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fetch Orders
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["user-orders", pagination.pageIndex + 1, pagination.pageSize],
    queryFn: () =>
      fetchUserOrders({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }),
  });

  const orders = ordersResponse?.data ?? [];
  const totalPages = ordersResponse?.pagination.totalPages ?? 0;
  const totalCount = ordersResponse?.pagination.totalCount ?? 0;

  // Columns Definition
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order #",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/orders/${row.original.id}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          #{row.original.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items || [];
        const displayItems = items.slice(0, 2);
        const remainingCount = items.length - 2;

        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {displayItems.map((item) => {
                const imageUrl = getProductImage(item.Product);
                return (
                  <div
                    key={item.id}
                    className="relative size-8 overflow-hidden rounded border-2 border-background"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.Product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted text-xs">
                        ?
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {displayItems[0]?.Product?.name || "Unknown Product"}
              </div>
              {remainingCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  +{remainingCount} more item{remainingCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
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
      cell: ({ row }) => formatPrice(Number(row.original.total)),
    },
    {
      accessorKey: "status",
      header: "Status",
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
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Date
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${row.original.id}`}>
                <Eye className="mr-2 size-4" />
                View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
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

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const order = row.original;
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-mono text-sm font-medium text-primary hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "SHIPPED"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {order.items?.slice(0, 2).map((item) => {
                          const imageUrl = getProductImage(item.Product);
                          return (
                            <div
                              key={item.id}
                              className="relative size-10 overflow-hidden rounded border-2 border-background"
                            >
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.Product?.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center bg-muted text-xs">
                                  ?
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {order.items?.[0]?.Product?.name || "Unknown Product"}
                        </div>
                        {(order.items?.length || 0) > 1 && (
                          <div className="text-xs text-muted-foreground">
                            +{(order.items?.length || 0) - 1} more item
                            {(order.items?.length || 0) - 1 > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={`/dashboard/orders/${order.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
                  pageIndex: 0,
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
    </div>
  );
}
