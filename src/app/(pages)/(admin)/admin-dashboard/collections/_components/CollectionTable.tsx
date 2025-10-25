"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  Search,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { formatDate, cn } from "@/lib/utils";

import { AddCollectionDialog } from "./AddCollectionDialog";
import { EditCollectionDialog } from "./EditCollectionDialog";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

async function fetchCollections(): Promise<Collection[]> {
  const response = await fetch("/api/admin/collections");
  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }
  return response.json();
}

async function toggleCollectionStatus(id: string, isActive: boolean) {
  const response = await fetch(`/api/admin/collections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update collection status");
  }
  
  return response.json();
}

export function CollectionTable() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: collections = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCollectionStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      toast({
        title: "Success",
        description: "Collection status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update collection status",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setEditDialogOpen(true);
  };

  const handleDelete = (collection: Collection) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = (collection: Collection) => {
    toggleStatusMutation.mutate({
      id: collection.id,
      isActive: !collection.isActive,
    });
  };

  // Filter collections based on search and status
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && collection.isActive) ||
      (statusFilter === "inactive" && !collection.isActive);
    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = searchTerm || statusFilter !== "all";
  const totalCollections = collections.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading collections...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground">Failed to load collections</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Collections
                <Badge variant="secondary" className="ml-2">
                  {totalCollections}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your product collections and themes
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
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                <span className="hidden sm:inline">Add Collection</span>
                <span className="sm:hidden">Add</span>
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
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    setSearchTerm("");
                    setStatusFilter("all");
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
                  {filteredCollections.length} of {totalCollections} collections
                </>
              ) : (
                <>{totalCollections} collections total</>
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
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          {hasActiveFilters ? "No collections match your filters" : "No collections found"}
                        </p>
                        {hasActiveFilters ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setAddDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create your first collection
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((collection) => (
                    <TableRow key={collection.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                          {collection.image?.url ? (
                            <Image
                              src={collection.image.url}
                              alt={collection.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{collection.name}</p>
                          <p className="text-sm text-muted-foreground">/{collection.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {collection.description || "No description"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {collection._count.products} product{collection._count.products !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={collection.isActive ? "default" : "secondary"}>
                          {collection.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(collection.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(collection)}
                            disabled={toggleStatusMutation.isPending}
                            title={collection.isActive ? "Deactivate" : "Activate"}
                          >
                            {collection.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(collection)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(collection)}
                            disabled={collection._count.products > 0}
                            title={collection._count.products > 0 ? "Cannot delete collection with products" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCollections.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-4 py-12">
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No collections match your filters" : "No collections found"}
              </p>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first collection
                </Button>
              )}
            </div>
          ) : (
            filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                isToggling={toggleStatusMutation.isPending}
              />
            ))
          )}
        </div>
      )}

      {/* Mobile Card View (Always visible on mobile) */}
      <div className="block space-y-4 md:hidden">
        {filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">
              {hasActiveFilters ? "No collections match your filters" : "No collections found"}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first collection
              </Button>
            )}
          </div>
        ) : (
          filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isToggling={toggleStatusMutation.isPending}
              mobile
            />
          ))
        )}
      </div>

      <AddCollectionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {selectedCollection && (
        <>
          <EditCollectionDialog
            collection={selectedCollection}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteCollectionDialog
            collection={selectedCollection}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
}

// Collection Card Component for Grid and Mobile Views
function CollectionCard({
  collection,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
  mobile = false,
}: {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onToggleStatus: (collection: Collection) => void;
  isToggling: boolean;
  mobile?: boolean;
}) {
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
          {collection.image?.url ? (
            <Image
              src={collection.image.url}
              alt={collection.name}
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
                <h3
                  className={cn(
                    "truncate font-medium leading-tight",
                    mobile ? "text-sm" : "text-base"
                  )}
                >
                  {collection.name}
                </h3>
                <p
                  className={cn(
                    "truncate text-muted-foreground",
                    mobile ? "text-xs" : "text-sm"
                  )}
                >
                  /{collection.slug}
                </p>
              </div>

              {!mobile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(collection)}>
                      <Edit className="mr-2 size-4" />
                      Edit Collection
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onToggleStatus(collection)}
                      disabled={isToggling}
                    >
                      {collection.isActive ? (
                        <EyeOff className="mr-2 size-4" />
                      ) : (
                        <Eye className="mr-2 size-4" />
                      )}
                      {collection.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(collection)}
                      disabled={collection._count.products > 0}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-1">
              {collection.description && (
                <p
                  className={cn(
                    "line-clamp-2 text-muted-foreground",
                    mobile ? "text-xs" : "text-sm"
                  )}
                >
                  {collection.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant={collection.isActive ? "default" : "secondary"}
                className={mobile ? "text-xs" : ""}
              >
                {collection.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className={mobile ? "text-xs" : ""}>
                {collection._count.products} product{collection._count.products !== 1 ? "s" : ""}
              </Badge>
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
                  <DropdownMenuItem onClick={() => onEdit(collection)}>
                    <Edit className="mr-2 size-4" />
                    Edit Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onToggleStatus(collection)}
                    disabled={isToggling}
                  >
                    {collection.isActive ? (
                      <EyeOff className="mr-2 size-4" />
                    ) : (
                      <Eye className="mr-2 size-4" />
                    )}
                    {collection.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(collection)}
                    disabled={collection._count.products > 0}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Collection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}