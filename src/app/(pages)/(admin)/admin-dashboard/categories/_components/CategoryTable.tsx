"use client";

import { useState } from "react";
import Image from "next/image";
import type { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronRight,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import type { FileUploadThing } from "@/types/UploadThing";
import {
  categoryKeys,
  fetchAdminCategories,
  type CategoryWithRelations,
} from "@/lib/query/categories";
import { cn } from "@/lib/utils";
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

import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";

const columns: ColumnDef<CategoryWithRelations>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.image;
      return image?.ufsUrl ? (
        <div className="relative size-16">
          <Image
            src={image.ufsUrl}
            alt={row.original.name}
            fill
            sizes="(max-width: 768px) 64px, 64px"
            className="rounded-md object-cover"
          />
        </div>
      ) : (
        <div className="flex size-16 items-center justify-center rounded-md bg-muted">
          <span className="text-xs text-muted-foreground">No image</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const level = row.original.level;
      const isParent = (row.original.children?.length ?? 0) > 0;
      return (
        <div className="flex items-center gap-2">
          <div
            style={{ marginLeft: `${level * 20}px` }}
            className="flex items-center gap-2"
          >
            {level > 0 && (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
            {row.getValue("name")}
            {isParent && (
              <Badge variant="secondary" className="ml-2">
                Parent
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Parent Category",
    cell: ({ row }) => {
      const parent = row.original.parent;
      return parent ? parent.name : "-";
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditCategoryDialog category={category} />
          <DeleteCategoryDialog category={category} />
        </div>
      );
    },
  },
];

export function CategoryTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const {
    data: categories,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: fetchAdminCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const table = useReactTable({
    data: categories || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading categories...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredCategories = table.getFilteredRowModel().rows;
  const totalCategories = categories?.length || 0;
  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Categories
                <Badge variant="secondary" className="ml-2">
                  {totalCategories}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your product categories and hierarchy
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
              <CreateCategoryDialog categories={categories || []}>
                <Button>
                  <Plus className="mr-2 size-4" />
                  <span className="hidden sm:inline">Add Category</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </CreateCategoryDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("isActive")?.setFilterValue(undefined);
                  } else {
                    table
                      .getColumn("isActive")
                      ?.setFilterValue(value === "active");
                  }
                }}
                defaultValue="all"
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                  {filteredCategories.length} of {totalCategories} categories
                </>
              ) : (
                <>{totalCategories} categories total</>
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
                          No categories found
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
              const category = row.original;
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  categories={categories || []}
                />
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center gap-4 py-12">
              <p className="text-muted-foreground">No categories found</p>
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
            const category = row.original;
            return (
              <CategoryCard
                key={category.id}
                category={category}
                categories={categories || []}
                mobile
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">No categories found</p>
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
                of {table.getFilteredRowModel().rows.length} categories
              </div>
              <div className="flex items-center gap-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Category Card Component for Grid and Mobile Views
function CategoryCard({
  category,
  categories,
  mobile = false,
}: {
  category: CategoryWithRelations;
  categories: CategoryWithRelations[];
  mobile?: boolean;
}) {
  const getParentPath = (cat: CategoryWithRelations) => {
    const path = [];
    let current = cat.parent;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path.join(" > ");
  };

  const hasChildren = (category?.children?.length ?? 0) > 0;
  const parentPath = getParentPath(category);

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
            mobile ? "size-16 shrink-0" : "aspect-square"
          )}
        >
          {category?.image?.ufsUrl ? (
            <Image
              src={category.image.ufsUrl}
              alt={category?.name || "Category image"}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes={
                mobile
                  ? "64px"
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {category?.level > 0 && (
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                  )}
                  <h3
                    className={cn(
                      "truncate font-medium leading-tight",
                      mobile ? "text-sm" : "text-base"
                    )}
                  >
                    {category?.name}
                  </h3>
                </div>
                {parentPath && (
                  <p
                    className={cn(
                      "truncate text-muted-foreground",
                      mobile ? "text-xs" : "text-sm"
                    )}
                  >
                    {parentPath}
                  </p>
                )}
              </div>

              {!mobile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditCategoryDialog
                      category={category}
                      categories={categories}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit Category
                      </DropdownMenuItem>
                    </EditCategoryDialog>
                    <DropdownMenuSeparator />
                    <DeleteCategoryDialog category={category}>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete Category
                      </DropdownMenuItem>
                    </DeleteCategoryDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-1">
              {category?.description && (
                <p
                  className={cn(
                    "line-clamp-2 text-muted-foreground",
                    mobile ? "text-xs" : "text-sm"
                  )}
                >
                  {category?.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant={category?.isActive ? "default" : "secondary"}
                className={mobile ? "text-xs" : ""}
              >
                {category?.isActive ? "Active" : "Inactive"}
              </Badge>
              {hasChildren && (
                <Badge variant="outline" className={mobile ? "text-xs" : ""}>
                  Parent ({category?.children?.length} children)
                </Badge>
              )}
              {category?.level > 0 && (
                <Badge variant="outline" className={mobile ? "text-xs" : ""}>
                  Level {category?.level}
                </Badge>
              )}
            </div>
          </div>

          {mobile && (
            <div className="mt-2 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditCategoryDialog
                    category={category}
                    categories={categories}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Edit Category
                    </DropdownMenuItem>
                  </EditCategoryDialog>
                  <DropdownMenuSeparator />
                  <DeleteCategoryDialog category={category}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete Category
                    </DropdownMenuItem>
                  </DeleteCategoryDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
