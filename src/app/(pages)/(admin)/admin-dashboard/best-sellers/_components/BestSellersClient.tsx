"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BestSellers, Product } from "@prisma/client";
import {
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ModalWrapper from "@/components/shared/modals/ModalWrapper";

import AddBestSeller from "./blocks/AddBestSeller";

interface BestSellerWithProduct extends BestSellers {
  product: Product & {
    category: {
      id: string;
      name: string;
    };
  };
}

// Helper function to safely get image URL from JSON images
const getImageUrl = (images: any): string | null => {
  if (!images || !Array.isArray(images)) return null;
  const firstImage = images[0];
  if (!firstImage || typeof firstImage !== "object") return null;
  return firstImage?.url || firstImage?.ufsUrl || firstImage?.appUrl || null;
};

interface Props {
  bestSellers: BestSellerWithProduct[];
}

const BestSellersClient = ({ bestSellers }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddNewMode, setIsAddNewMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteBestSellerId, setDeleteBestSellerId] = useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [editBestSeller, setEditBestSeller] =
    useState<BestSellerWithProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const handleDeleteBestSeller = async () => {
    if (!deleteBestSellerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/best-sellers`, {
        method: "DELETE",
        body: JSON.stringify({ id: deleteBestSellerId }),
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to delete best seller",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Best seller removed successfully",
        });
        router.refresh();
        setIsDeleteMode(false);
        setDeleteBestSellerId(undefined);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter best sellers based on search term
  const filteredBestSellers = bestSellers.filter(
    (item) =>
      item?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.product?.category?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Best Sellers
                <Badge variant="secondary" className="ml-2">
                  {bestSellers.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your best selling products and top performers
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="size-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button onClick={() => setIsAddNewMode(true)}>
                <Plus className="mr-2 size-4" />
                <span className="hidden sm:inline">Add Best Seller</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search best sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="px-2"
              >
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>

          {/* View Toggle - Desktop Only */}
          <div className="hidden items-center justify-between md:flex">
            <div className="text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  {filteredBestSellers.length} of {bestSellers.length} best
                  sellers
                </>
              ) : (
                <>{bestSellers.length} best sellers total</>
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
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBestSellers.length ? (
                  filteredBestSellers.map((bestSeller) => (
                    <TableRow key={bestSeller.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {bestSeller?.product?.name}
                      </TableCell>
                      <TableCell>
                        {bestSeller?.product?.category?.name}
                      </TableCell>
                      <TableCell>
                        {formatPrice(Number(bestSeller?.product?.price) || 0)}
                      </TableCell>
                      <TableCell>
                        {new Date(bestSeller.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditBestSeller(bestSeller);
                              setIsAddNewMode(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsDeleteMode(true);
                              setDeleteBestSellerId(bestSeller.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "No best sellers found"
                            : "No best sellers yet"}
                        </p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear search
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
          {filteredBestSellers.length ? (
            filteredBestSellers.map((bestSeller) => (
              <BestSellerCard
                key={bestSeller.id}
                bestSeller={bestSeller}
                onEdit={() => {
                  setEditBestSeller(bestSeller);
                  setIsAddNewMode(true);
                }}
                onDelete={() => {
                  setIsDeleteMode(true);
                  setDeleteBestSellerId(bestSeller.id);
                }}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center gap-4 py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No best sellers found" : "No best sellers yet"}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View (Always visible on mobile) */}
      <div className="block space-y-4 md:hidden">
        {filteredBestSellers.length ? (
          filteredBestSellers.map((bestSeller) => (
            <BestSellerCard
              key={bestSeller.id}
              bestSeller={bestSeller}
              mobile
              onEdit={() => {
                setEditBestSeller(bestSeller);
                setIsAddNewMode(true);
              }}
              onDelete={() => {
                setIsDeleteMode(true);
                setDeleteBestSellerId(bestSeller.id);
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No best sellers found" : "No best sellers yet"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddNewMode && (
        <ModalWrapper
          openModal={isAddNewMode}
          setOpenModal={setIsAddNewMode}
          titleText={editBestSeller ? "Edit Best Seller" : "Add Best Seller"}
          buttonTest="Cancel"
          onButtonClick={() => {
            setIsAddNewMode(false);
            setEditBestSeller(null);
          }}
        >
          <AddBestSeller
            isOpen={isAddNewMode}
            setIsOpen={setIsAddNewMode}
            editBestSeller={editBestSeller}
          />
        </ModalWrapper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteMode} onOpenChange={setIsDeleteMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Best Seller</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this product from best sellers?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteMode(false);
                setDeleteBestSellerId(undefined);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBestSeller}
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Best Seller Card Component for Grid and Mobile Views
function BestSellerCard({
  bestSeller,
  mobile = false,
  onEdit,
  onDelete,
}: {
  bestSeller: BestSellerWithProduct;
  mobile?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        mobile && "border-l-4 border-l-primary/20"
      )}
    >
      <div className={cn("flex gap-4", mobile ? "p-4" : "flex-col")}>
        {/* Product Image */}
        <div
          className={cn(
            "relative overflow-hidden rounded-md bg-muted",
            mobile ? "size-16 shrink-0" : "aspect-square"
          )}
        >
          {getImageUrl(bestSeller?.product?.images) ? (
            <Image
              src={getImageUrl(bestSeller?.product?.images)!}
              alt={bestSeller?.product?.name || "Product image"}
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
                  {bestSeller?.product?.name}
                </h3>
                <p
                  className={cn(
                    "truncate text-muted-foreground",
                    mobile ? "text-xs" : "text-sm"
                  )}
                >
                  {bestSeller?.product?.category?.name}
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
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-semibold",
                    mobile ? "text-sm" : "text-base"
                  )}
                >
                  {formatPrice(Number(bestSeller?.product?.price) || 0)}
                </span>
                <Badge variant="default" className={mobile ? "text-xs" : ""}>
                  Best Seller
                </Badge>
              </div>
              <p
                className={cn(
                  "text-muted-foreground",
                  mobile ? "text-xs" : "text-sm"
                )}
              >
                Added {new Date(bestSeller.createdAt).toLocaleDateString()}
              </p>
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
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Remove
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

export default BestSellersClient;
