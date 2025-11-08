/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { type ProductWithVariants } from "@/types/product";
import { categoryKeys, fetchAdminCategories } from "@/lib/query/categories";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { DeleteProductDialog } from "./DeleteProductDialog";
import { ProductPreviewDialog } from "./ProductPreviewDialog";
import SocialPostCell from "./SocialPostCell";

export function ProductTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true }, // Default sort by latest modified
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products");
      if (!response?.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response?.json();
      // Convert Decimal to number
      return data?.map((product: any) => ({
        ...product,
        price: product?.price ? parseFloat(product?.price?.toString()) : null,
        variants:
          product?.variants?.map((variant: any) => ({
            ...variant,
            price: variant?.price
              ? parseFloat(variant?.price?.toString())
              : null,
          })) || [],
      }));
    },
  });

  const { data: categories } = useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: fetchAdminCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const categoryFilterFn = (
    row: any,
    columnId: string,
    filterValue: string
  ) => {
    if (!filterValue) return true;
    const category = row?.original?.category;
    if (!category) return false;

    // Find the selected category from the categories data
    const selectedCategory = categories?.find((cat) => cat?.id === filterValue);
    if (!selectedCategory) return false;

    // Direct match
    if (category?.id === filterValue) return true;

    // If selected category is a parent (level 0 or 1), match children
    if (selectedCategory?.level < 2) {
      // Match direct children
      if (category?.parentId === filterValue) return true;

      // If it's a top-level category (level 0), also match grandchildren
      if (selectedCategory?.level === 0) {
        const parentCategory = category?.parent;
        if (parentCategory?.parentId === filterValue) return true;
      }
    }

    return false;
  };

  const columns: ColumnDef<ProductWithVariants>[] = [
    {
      accessorKey: "images",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="relative size-16 overflow-hidden rounded-md bg-muted">
          {row?.original?.images?.[0]?.url ? (
            <Image
              src={row?.original?.images?.[0]?.url}
              alt={row?.original?.name || "Product image"}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="64px"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Name
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Base Price
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = row?.original?.price;
        return formatPrice(price ? Number(price) : 0);
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Brand
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Gender
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "style",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Style
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Category
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const category = row?.original?.category;
        if (!category) return "Uncategorized";

        // Build the category hierarchy string
        const names = [];

        // Start with grandparent if it exists
        if (category?.parent?.parent) {
          names?.push(category?.parent?.parent?.name);
        }

        // Add parent if it exists
        if (category?.parent) {
          names?.push(category?.parent?.name);
        }

        // Add current category
        names?.push(category?.name);

        // Join with " > " separator
        return names?.join(" > ");
      },
      sortingFn: (rowA, rowB) => {
        const catA = rowA?.original?.category;
        const catB = rowB?.original?.category;

        const getFullCategoryName = (cat: typeof catA) => {
          if (!cat) return "Uncategorized";
          const parts = [];
          if (cat?.parent?.parent?.name) parts?.push(cat?.parent?.parent?.name);
          if (cat?.parent?.name) parts?.push(cat?.parent?.name);
          parts?.push(cat?.name);
          return parts?.join(" > ");
        };

        return getFullCategoryName(catA)?.localeCompare(
          getFullCategoryName(catB)
        );
      },
      filterFn: categoryFilterFn,
    },
    {
      accessorKey: "collection",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Collection
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const collection = (row?.original as any)?.collection;
        if (!collection)
          return <span className="text-muted-foreground">No Collection</span>;
        return collection.name;
      },
      sortingFn: (rowA, rowB) => {
        const collectionA = (rowA?.original as any)?.collection?.name || "";
        const collectionB = (rowB?.original as any)?.collection?.name || "";
        return collectionA.localeCompare(collectionB);
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column?.toggleSorting(column?.getIsSorted() === "asc")
            }
            className="-ml-4"
          >
            Last Modified
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row?.original?.updatedAt)?.toLocaleDateString();
      },
    },
    {
      id: "post",
      header: "Post",
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original;
        return <SocialPostCell product={product} />;
      },
    },
    {
      accessorKey: "variants",
      header: "Variants",
      enableSorting: false,
      cell: ({ row }) => {
        const variants = row.original.variants;
        if (!variants || variants.length === 0) {
          return <span className="text-muted-foreground">No variants</span>;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {variants.length} variants
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {variants.map((variant: any) => (
                <DropdownMenuItem key={variant.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{variant.sku}</span>
                    <span className="text-sm text-muted-foreground">
                      {variant.options.map((opt: any) => (
                        <span key={opt.optionValue.id}>
                          {opt.optionValue.value}{" "}
                        </span>
                      ))}
                    </span>
                    <span className="text-sm">
                      {variant.price
                        ? formatPrice(Number(variant.price))
                        : formatPrice(Number(row.original.price))}
                      {" • "}
                      {variant.stock} in stock
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            <ProductPreviewDialog product={product} />
            <Button variant="ghost" size="icon" asChild title="Edit Product">
              <Link href={`/admin-dashboard/products/${product?.id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <DeleteProductDialog product={product} />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredProducts = table.getFilteredRowModel().rows;
  const totalProducts = products?.length || 0;
  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Products
                <Badge variant="secondary" className="ml-2">
                  {totalProducts}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your product catalog and inventory
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="size-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button asChild>
                <Link href="/admin-dashboard/products/add">
                  <Plus className="mr-2 size-4" />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                onValueChange={(value) =>
                  table
                    .getColumn("category")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
                defaultValue="all"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.parent
                        ? `${category?.parent?.name} > ${category?.name}`
                        : category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    table.resetColumnFilters();
                  }}
                  className="px-2"
                >
                  <X className="size-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* View Toggle - Desktop Only */}
          <div className="hidden items-center justify-between md:flex">
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  {filteredProducts.length} of {totalProducts} products
                </>
              ) : (
                <>{totalProducts} products total</>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Desktop Table View */}
      {viewMode === "table" && (
        <Card className="hidden md:block">
          <div className="overflow-auto">
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
                      className="hover:bg-muted/50"
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
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          No products found
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.resetColumnFilters()}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const product = row.original;
              return <ProductCard key={product.id} product={product} />;
            })
          ) : (
            <div className="col-span-full flex flex-col items-center gap-4 py-12">
              <p className="text-muted-foreground">No products found</p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.resetColumnFilters()}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View (Always visible on mobile) */}
      <div className="block space-y-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const product = row.original;
            return <ProductCard key={product.id} product={product} mobile />;
          })
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">No products found</p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.resetColumnFilters()}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} products
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rows per page</span>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
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

                      // Show ellipsis
                      if (
                        (page === currentPage - 2 && currentPage > 2) ||
                        (page === currentPage + 2 &&
                          currentPage < table.getPageCount() - 3)
                      ) {
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Product Card Component for Grid and Mobile Views
function ProductCard({
  product,
  mobile = false,
}: {
  product: ProductWithVariants;
  mobile?: boolean;
}) {
  const getCategoryPath = (category: ProductWithVariants["category"]) => {
    if (!category) return "Uncategorized";
    const names = [];
    if (category?.parent?.parent) names.push(category?.parent?.parent?.name);
    if (category?.parent) names.push(category?.parent?.name);
    names.push(category?.name);
    return names.join(" > ");
  };

  const getStockStatus = () => {
    const totalStock =
      product?.variants?.reduce(
        (sum, variant) => sum + (variant?.stock || 0),
        0
      ) || 0;
    if (totalStock === 0)
      return { status: "Out of Stock", color: "destructive" as const };
    if (totalStock < 10)
      return { status: "Low Stock", color: "secondary" as const };
    return { status: "In Stock", color: "default" as const };
  };

  const stockInfo = getStockStatus();

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        mobile && "border-l-4 border-l-primary/20"
      )}
    >
      <div className={cn("flex gap-4", mobile ? "p-4" : "flex-col")}>
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden rounded-md bg-muted",
            mobile ? "size-20 shrink-0" : "aspect-square"
          )}
        >
          {product?.images?.[0]?.url ? (
            <Image
              src={product?.images?.[0]?.url}
              alt={product?.name || "Product image"}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes={
                mobile
                  ? "80px"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              }
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span
                className={cn(
                  "text-muted-foreground",
                  mobile ? "text-xs" : "text-sm"
                )}
              >
                No image
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex flex-col",
            mobile ? "min-w-0 flex-1" : "p-4 pt-3"
          )}
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-medium leading-tight",
                  mobile ? "text-sm" : "text-base"
                )}
              >
                {product?.name}
              </h3>
              {!mobile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ProductPreviewDialog
                      product={product}
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 size-4" />
                          Preview Product
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin-dashboard/products/${product?.id}`}>
                        <Pencil className="mr-2 size-4" />
                        Edit Product
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DeleteProductDialog product={product} asMenuItem />
                    <DropdownMenuSeparator />
                    <SocialPostCell product={product} asDropdownItems />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-1">
              <p
                className={cn(
                  "text-muted-foreground",
                  mobile ? "text-xs" : "text-sm"
                )}
              >
                {getCategoryPath(product?.category)}
              </p>

              {(product as any)?.collection && (
                <p
                  className={cn(
                    "text-muted-foreground",
                    mobile ? "text-xs" : "text-sm"
                  )}
                >
                  Collection: {(product as any)?.collection?.name}
                </p>
              )}

              {product?.brand && (
                <p
                  className={cn("font-medium", mobile ? "text-xs" : "text-sm")}
                >
                  {product?.brand}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant={stockInfo.color}
                className={mobile ? "text-xs" : ""}
              >
                {stockInfo.status}
              </Badge>
              {product?.variants && product?.variants?.length > 0 && (
                <Badge variant="outline" className={mobile ? "text-xs" : ""}>
                  {product?.variants?.length} variants
                </Badge>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between pt-2",
              mobile && "mt-2"
            )}
          >
            <div className="font-semibold">
              {formatPrice(product?.price ? Number(product?.price) : 0)}
            </div>

            {mobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <ProductPreviewDialog
                    product={product}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 size-4" />
                        Preview Product
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem asChild>
                    <Link href={`/admin-dashboard/products/${product?.id}`}>
                      <Pencil className="mr-2 size-4" />
                      Edit Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteProductDialog product={product} asMenuItem />
                  <DropdownMenuSeparator />
                  <SocialPostCell product={product} asDropdownItems />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
