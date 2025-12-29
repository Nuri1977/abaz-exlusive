"use client";

import { useState } from "react";
import Link from "next/link";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Eye,
  MoreHorizontal,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  type AdminPaymentTableData,
  type PaymentActionData,
} from "@/types/admin-payments";
import {
  confirmCashPayment,
  fetchAdminPayments,
  processRefund,
  syncPaymentWithPolar,
  updatePaymentStatus,
} from "@/lib/query/admin-payments";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PaymentMethodIcon } from "@/components/payments/PaymentMethodIcon";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";

export function AdminPaymentTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payments data
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-payments",
      pagination.pageIndex + 1,
      pagination.pageSize,
      sorting,
      globalFilter,
      methodFilter,
      statusFilter,
    ],
    queryFn: () =>
      fetchAdminPayments({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        search: globalFilter || undefined,
        method: methodFilter !== "all" ? methodFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Confirm cash payment mutation
  const confirmCashMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      confirmCashPayment(id, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({
        title: "Success",
        description: "Cash payment confirmed successfully",
      });
    },
    onError: (error: { error?: string }) => {
      toast({
        title: "Error",
        description: error?.error || "Failed to confirm cash payment",
        variant: "destructive",
      });
    },
  });

  // Sync with Polar mutation
  const syncMutation = useMutation({
    mutationFn: ({
      id,
      forceSync = false,
    }: {
      id: string;
      forceSync?: boolean;
    }) => syncPaymentWithPolar(id, forceSync),
    onSuccess: (data: {
      message: string;
      previousStatus?: string;
      newStatus?: string;
      polarStatus?: string;
      synced: boolean;
      forceSync?: boolean;
      payment?: AdminPaymentTableData;
    }) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      if (data.synced) {
        toast({
          title: "Success",
          description: data.forceSync
            ? `Payment manually confirmed as paid`
            : `Payment status synced: ${data.previousStatus} → ${data.newStatus}`,
        });
      } else {
        toast({
          title: "Info",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to sync with Polar",
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation (fallback for non-Polar payments)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentActionData }) =>
      updatePaymentStatus(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    },
    onError: (error: { error?: string }) => {
      toast({
        title: "Error",
        description: error?.error || "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  // Process refund mutation
  const refundMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      reason,
    }: {
      id: string;
      amount: number;
      reason?: string;
    }) => processRefund(id, amount, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    },
    onError: (error: { error?: string }) => {
      toast({
        title: "Error",
        description: error?.error || "Failed to process refund",
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<AdminPaymentTableData>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Payment ID
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.getValue<string>("id").slice(0, 8)}...
        </div>
      ),
    },
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
          <Link
            href={`/admin-dashboard/orders/${orderId}`}
            className="font-mono text-xs text-blue-600 hover:underline"
          >
            {orderId.slice(0, 8)}...
          </Link>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Customer
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const payment = row.original;
        const customerName =
          payment.customerName || payment.order.customerName || "Guest";
        const customerEmail =
          payment.customerEmail || payment.order.customerEmail;

        return (
          <div className="space-y-1">
            <div className="font-medium">{customerName}</div>
            {customerEmail && (
              <div className="text-xs text-muted-foreground">
                {customerEmail}
              </div>
            )}
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
        const payment = row.original;
        const amount = parseFloat(payment.amount.toString());
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: payment.currency,
        }).format(amount);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue<PaymentMethod>("method");
        return <PaymentMethodIcon method={method} variant="badge" size="sm" />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <PaymentStatusBadge
            status={payment.status}
            method={payment.method}
            size="sm"
          />
        );
      },
    },
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => {
        const provider = row.getValue<string>("provider");
        return (
          <div className="text-sm capitalize text-muted-foreground">
            {provider}
          </div>
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
            className="h-auto p-0 font-semibold"
          >
            Created
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue<string>("createdAt"));
        return (
          <div className="text-sm">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
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
                <Link href={`/admin-dashboard/payments/${payment.id}`}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {payment.status === PaymentStatus.PENDING &&
                payment.method === "CARD" &&
                payment.provider === "polar" &&
                (payment.checkoutId || payment.providerPaymentId) && (
                  <>
                    <DropdownMenuItem
                      onClick={() => syncMutation.mutate({ id: payment.id })}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className="mr-2 size-4" />
                      Sync with Polar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        syncMutation.mutate({ id: payment.id, forceSync: true })
                      }
                      disabled={syncMutation.isPending}
                      className="text-orange-600"
                    >
                      <RefreshCw className="mr-2 size-4" />
                      Force Confirm as Paid
                    </DropdownMenuItem>
                  </>
                )}
              {payment.status === PaymentStatus.PENDING &&
                (payment.method !== "CARD" || payment.provider !== "polar") && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateMutation.mutate({
                        id: payment.id,
                        data: {
                          action: "updateStatus",
                          status: PaymentStatus.PAID,
                        },
                      })
                    }
                    disabled={updateMutation.isPending}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
              {payment.status === PaymentStatus.CASH_PENDING && (
                <DropdownMenuItem
                  onClick={() =>
                    confirmCashMutation.mutate({
                      id: payment.id,
                      notes: "Confirmed via admin dashboard",
                    })
                  }
                  disabled={confirmCashMutation.isPending}
                >
                  <RefreshCw className="mr-2 size-4" />
                  Confirm Cash Payment
                </DropdownMenuItem>
              )}
              {(payment.status === PaymentStatus.PAID ||
                payment.status === PaymentStatus.CASH_RECEIVED) && (
                <DropdownMenuItem
                  onClick={() =>
                    refundMutation.mutate({
                      id: payment.id,
                      amount: parseFloat(payment.amount.toString()),
                      reason: "Admin refund",
                    })
                  }
                  disabled={refundMutation.isPending}
                >
                  <Download className="mr-2 size-4" />
                  Process Refund
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: paymentsData?.payments || [],
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
    pageCount: paymentsData?.pagination.totalPages || 0,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load payments. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              void queryClient.invalidateQueries({
                queryKey: ["admin-payments"],
              })
            }
          >
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="no-print space-y-4">
        {/* Search Bar - Full width on mobile */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full pl-8"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
            <Select
              value={methodFilter}
              onValueChange={(value) =>
                setMethodFilter(value as PaymentMethod | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                <SelectItem value={PaymentMethod.CASH_ON_DELIVERY}>
                  Cash on Delivery
                </SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                  Bank Transfer
                </SelectItem>
                <SelectItem value={PaymentMethod.DIGITAL_WALLET}>
                  Digital Wallet
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as PaymentStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                <SelectItem value={PaymentStatus.CASH_PENDING}>
                  Cash Pending
                </SelectItem>
                <SelectItem value={PaymentStatus.CASH_RECEIVED}>
                  Cash Received
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* Analytics Button */}
            <Button variant="outline" asChild>
              <Link href="/admin-dashboard/payments/analytics">Analytics</Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="no-print"
            >
              <Printer className="mr-2 size-4" />
              Print List
            </Button>

            {/* Column visibility - Hidden on mobile since table is hidden */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden md:flex">
                  Columns <ChevronDown className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden rounded-md border md:block">
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 size-4 animate-spin" />
                    Loading payments...
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
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="mr-2 size-4 animate-spin" />
            Loading payments...
          </div>
        ) : paymentsData?.payments?.length ? (
          paymentsData.payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              {/* Header with Payment ID and Status */}
              <div className="mb-3 flex items-center justify-between">
                <div className="font-mono text-sm font-medium">
                  {payment.id.slice(0, 8)}...
                </div>
                <PaymentStatusBadge
                  status={payment.status}
                  method={payment.method}
                  size="sm"
                />
              </div>

              {/* Customer and Order Info */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Customer:
                  </span>
                  <span className="text-sm font-medium">
                    {payment.customerName ||
                      payment.order.customerName ||
                      "Guest"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order:</span>
                  <Link
                    href={`/admin-dashboard/orders/${payment.orderId}`}
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {payment.orderId.slice(0, 8)}...
                  </Link>
                </div>
              </div>

              {/* Amount and Method */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment.currency,
                    }).format(parseFloat(payment.amount.toString()))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Method:</span>
                  <PaymentMethodIcon
                    method={payment.method}
                    variant="badge"
                    size="sm"
                  />
                </div>
              </div>

              {/* Date and Provider */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Created:
                  </span>
                  <span className="text-sm">
                    {new Date(payment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Provider:
                  </span>
                  <span className="text-sm capitalize">{payment.provider}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {/* View Details + Primary Action Row */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/admin-dashboard/payments/${payment.id}`}>
                      <Eye className="mr-2 size-4" />
                      View Details
                    </Link>
                  </Button>

                  {payment.status === PaymentStatus.PENDING &&
                    payment.method === "CARD" &&
                    payment.provider === "polar" &&
                    (payment.checkoutId || payment.providerPaymentId) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => syncMutation.mutate({ id: payment.id })}
                        disabled={syncMutation.isPending}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 size-4" />
                        Sync
                      </Button>
                    )}

                  {payment.status === PaymentStatus.PENDING &&
                    (payment.method !== "CARD" ||
                      payment.provider !== "polar") && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          updateMutation.mutate({
                            id: payment.id,
                            data: {
                              action: "updateStatus",
                              status: PaymentStatus.PAID,
                            },
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 size-4" />
                        Mark as Paid
                      </Button>
                    )}

                  {payment.status === PaymentStatus.CASH_PENDING && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        confirmCashMutation.mutate({
                          id: payment.id,
                          notes: "Confirmed via admin dashboard",
                        })
                      }
                      disabled={confirmCashMutation.isPending}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 size-4" />
                      Confirm Cash
                    </Button>
                  )}

                  {(payment.status === PaymentStatus.PAID ||
                    payment.status === PaymentStatus.CASH_RECEIVED) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        refundMutation.mutate({
                          id: payment.id,
                          amount: parseFloat(payment.amount.toString()),
                          reason: "Admin refund",
                        })
                      }
                      disabled={refundMutation.isPending}
                      className="flex-1"
                    >
                      <Download className="mr-2 size-4" />
                      Refund
                    </Button>
                  )}
                </div>

                {/* Force Confirm Button - Full Width Row */}
                {payment.status === PaymentStatus.PENDING &&
                  payment.method === "CARD" &&
                  payment.provider === "polar" &&
                  (payment.checkoutId || payment.providerPaymentId) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        syncMutation.mutate({
                          id: payment.id,
                          forceSync: true,
                        })
                      }
                      disabled={syncMutation.isPending}
                      className="w-full text-orange-600"
                    >
                      <RefreshCw className="mr-2 size-4" />
                      Force Confirm as Paid
                    </Button>
                  )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">No payments found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="no-print flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            paymentsData?.pagination.totalCount || 0
          )}{" "}
          of {paymentsData?.pagination.totalCount || 0} payments
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
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
                    table.previousPage();
                  }}
                  aria-disabled={!table.getCanPreviousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: table.getPageCount() }, (_, i) => {
                const page = i;
                const currentPage = table.getState().pagination.pageIndex;

                // Show first page, last page, current page, and pages around current
                if (
                  page === 0 ||
                  page === table.getPageCount() - 1 ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          table.setPageIndex(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                // Ellipsis logic
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
                    table.nextPage();
                  }}
                  aria-disabled={!table.getCanNextPage()}
                  className={
                    !table.getCanNextPage()
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
