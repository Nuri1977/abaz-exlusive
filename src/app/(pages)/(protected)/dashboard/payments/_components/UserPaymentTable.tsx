"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type PaymentMethod, type PaymentStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, Eye, MoreHorizontal } from "lucide-react";

import {
  type UserPaymentParams,
  type UserPaymentTableData,
} from "@/types/user-payments";
import { fetchUserPayments } from "@/lib/query/user-payments";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentMethodIcon } from "@/components/payments/PaymentMethodIcon";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";

const columns: ColumnDef<UserPaymentTableData>[] = [
  {
    accessorKey: "orderId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Order ID
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderId = row.getValue<string>("orderId");

      return (
        <div className="font-mono text-sm">
          <Link
            href={`/dashboard/orders/${orderId}`}
            className="text-primary hover:underline"
          >
            #{orderId.slice(-8)}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "order.items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.order?.items || [];
      const displayItems = items.slice(0, 2);
      const remainingCount = items.length - 2;

      return (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="relative size-8 overflow-hidden rounded border-2 border-background"
              >
                {item.Product?.images?.[0] &&
                  typeof item.Product.images[0] === "string" ? (
                  <Image
                    src={item.Product.images[0]}
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
            ))}
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
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Amount
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue<string>("amount"));
      const currency = row.original.currency;
      return <div className="font-medium">{formatPrice(amount, currency)}</div>;
    },
  },
  {
    accessorKey: "method",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue<PaymentMethod>("method");
      return <PaymentMethodIcon method={method} variant="badge" size="sm" />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<PaymentStatus>("status");
      const method = row.original.method;
      return <PaymentStatusBadge status={status} method={method} size="sm" />;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Date
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
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
              <Link href={`/dashboard/payments/${payment.id}`}>
                <Eye className="mr-2 size-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {(payment.status === "PAID" ||
              payment.status === "CASH_RECEIVED") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="mr-2 size-4" />
                    Download Receipt
                  </DropdownMenuItem>
                </>
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface UserPaymentTableProps {
  className?: string;
}

export function UserPaymentTable({ className }: UserPaymentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Build query parameters
  const queryParams: UserPaymentParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting[0]?.id || "createdAt",
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  };

  // Add filters
  const methodFilter = columnFilters.find((f) => f.id === "method")?.value as
    | PaymentMethod
    | undefined;
  const statusFilter = columnFilters.find((f) => f.id === "status")?.value as
    | PaymentStatus
    | undefined;

  if (methodFilter) queryParams.method = methodFilter;
  if (statusFilter) queryParams.status = statusFilter;

  const {
    data: paymentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-payments", queryParams],
    queryFn: () => {
      console.log("🔍 [UserPaymentTable] Query params:", queryParams);
      return fetchUserPayments(queryParams);
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  console.log("📊 [UserPaymentTable] Query result:", {
    paymentsData,
    isLoading,
    error,
  });

  const table = useReactTable({
    data: paymentsData?.payments ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: paymentsData?.pagination?.totalPages ?? 0,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <PaymentTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Failed to load payments. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Select
              value={
                (table.getColumn("method")?.getFilterValue() as string) ?? ""
              }
              onValueChange={(value) =>
                table
                  .getColumn("method")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CARD">Card Payment</SelectItem>
                <SelectItem value="CASH_ON_DELIVERY">
                  Cash on Delivery
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? ""
              }
              onValueChange={(value) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CASH_PENDING">Cash Pending</SelectItem>
                <SelectItem value="CASH_RECEIVED">Cash Received</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
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
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 md:hidden">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const payment = row.original;
              return (
                <Card key={row.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm">
                          <Link
                            href={`/dashboard/orders/${payment.orderId}`}
                            className="text-primary hover:underline"
                          >
                            #{payment.orderId.slice(-8)}
                          </Link>
                        </div>
                        <PaymentStatusBadge
                          status={payment.status}
                          method={payment.method}
                          size="sm"
                        />
                      </div>

                      {/* Items Preview */}
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {payment.order?.items?.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="relative size-10 overflow-hidden rounded border-2 border-background"
                            >
                              {item.Product?.images?.[0] &&
                                typeof item.Product.images[0] === "string" ? (
                                <Image
                                  src={item.Product.images[0]}
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
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {payment.order?.items?.[0]?.Product?.name ||
                              "Unknown Product"}
                          </div>
                          {(payment.order?.items?.length || 0) > 1 && (
                            <div className="text-xs text-muted-foreground">
                              +{(payment.order?.items?.length || 0) - 1} more
                              item
                              {(payment.order?.items?.length || 0) - 1 > 1
                                ? "s"
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon
                            method={payment.method}
                            variant="badge"
                            size="xs"
                          />
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="font-medium">
                          {formatPrice(payment.amount, payment.currency)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link href={`/dashboard/payments/${payment.id}`}>
                            <Eye className="mr-2 size-4" />
                            View Details
                          </Link>
                        </Button>
                        {(payment.status === "PAID" ||
                          payment.status === "CASH_RECEIVED") && (
                            <Button variant="outline" size="sm">
                              <Download className="size-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No payments found.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {paymentsData?.pagination?.totalCount ? (
              <>
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  paymentsData.pagination.totalCount
                )}{" "}
                of {paymentsData.pagination.totalCount} payment
                {paymentsData.pagination.totalCount !== 1 ? "s" : ""}
              </>
            ) : (
              "No payments found"
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Skeleton className="h-10 w-full sm:w-[180px]" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-8 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-8 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="space-y-4 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
