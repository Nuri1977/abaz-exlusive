"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import type { HeroItemData } from "@/services/heroItems/heroItemService";

import AddHeroItem from "./blocks/AddHeroItem";

interface HeroItemsClientProps {
  heroItems: HeroItemData[];
}

const HeroItemsClient = ({ heroItems }: HeroItemsClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddNewMode, setIsAddNewMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteHeroItemId, setDeleteHeroItemId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [editHeroItem, setEditHeroItem] = useState<HeroItemData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const handleDeleteHeroItem = async () => {
    if (!deleteHeroItemId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/hero-items/${deleteHeroItemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to delete hero item",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Hero item deleted successfully",
        });
        router.refresh();
        setIsDeleteMode(false);
        setDeleteHeroItemId(undefined);
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "An error occurred while deleting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/hero-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to update hero item status",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Hero item ${isActive ? "activated" : "deactivated"} successfully`,
        });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while updating status",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (items: { id: string; sortOrder: number }[]) => {
    try {
      const response = await fetch("/api/admin/hero-items/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to reorder hero items",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Hero items reordered successfully",
        });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while reordering",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = (id: string) => {
    const currentIndex = heroItems.findIndex((item) => item.id === id);
    if (currentIndex > 0) {
      const newItems = [...heroItems];
      const currentItem = newItems[currentIndex];
      const previousItem = newItems[currentIndex - 1];

      if (currentItem && previousItem) {
        [newItems[currentIndex], newItems[currentIndex - 1]] = [previousItem, currentItem];

        const reorderData = newItems.map((item, index) => ({
          id: item.id,
          sortOrder: index,
        }));

        void handleReorder(reorderData);
      }
    }
  };

  const handleMoveDown = (id: string) => {
    const currentIndex = heroItems.findIndex((item) => item.id === id);
    if (currentIndex < heroItems.length - 1) {
      const newItems = [...heroItems];
      const currentItem = newItems[currentIndex];
      const nextItem = newItems[currentIndex + 1];

      if (currentItem && nextItem) {
        [newItems[currentIndex], newItems[currentIndex + 1]] = [nextItem, currentItem];

        const reorderData = newItems.map((item, index) => ({
          id: item.id,
          sortOrder: index,
        }));

        void handleReorder(reorderData);
      }
    }
  };

  // Filter hero items based on search term
  const filteredHeroItems = heroItems.filter(
    (item) =>
      item?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.collection?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                Hero Items
                <Badge variant="secondary" className="ml-2">
                  {heroItems.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your homepage hero carousel items and featured content
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
                <span className="hidden sm:inline">Add Hero Item</span>
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
                placeholder="Search hero items..."
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
                  {filteredHeroItems.length} of {heroItems.length} hero items
                </>
              ) : (
                <>{heroItems.length} hero items total</>
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
                  <TableHead>Hero Item</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHeroItems.length ? (
                  filteredHeroItems.map((heroItem, index) => (
                    <TableRow key={heroItem.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 overflow-hidden rounded bg-muted">
                            <Image
                              src={heroItem.imageUrl}
                              alt={heroItem.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{heroItem.title}</div>
                            {heroItem.description && (
                              <div className="text-sm text-muted-foreground">
                                {heroItem.description.length > 50
                                  ? `${heroItem.description.substring(0, 50)}...`
                                  : heroItem.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {heroItem.collection ? (
                          <Badge variant="outline">{heroItem.collection.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">No collection</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={heroItem.isActive ? "default" : "secondary"}>
                          {heroItem.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{heroItem.sortOrder}</TableCell>
                      <TableCell>
                        {new Date(heroItem.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveUp(heroItem.id)}
                            disabled={index === 0}
                            className="size-8"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveDown(heroItem.id)}
                            disabled={index === filteredHeroItems.length - 1}
                            className="size-8"
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(heroItem.id, !heroItem.isActive)}
                            className="size-8"
                          >
                            {heroItem.isActive ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditHeroItem(heroItem);
                              setIsAddNewMode(true);
                            }}
                            className="size-8"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsDeleteMode(true);
                              setDeleteHeroItemId(heroItem.id);
                            }}
                            className="size-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          {searchTerm ? "No hero items found" : "No hero items yet"}
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
          {filteredHeroItems.length ? (
            filteredHeroItems.map((heroItem, index) => (
              <HeroItemCard
                key={heroItem.id}
                heroItem={heroItem}
                onEdit={() => {
                  setEditHeroItem(heroItem);
                  setIsAddNewMode(true);
                }}
                onDelete={() => {
                  setIsDeleteMode(true);
                  setDeleteHeroItemId(heroItem.id);
                }}
                onToggleActive={() => handleToggleActive(heroItem.id, !heroItem.isActive)}
                onMoveUp={() => handleMoveUp(heroItem.id)}
                onMoveDown={() => handleMoveDown(heroItem.id)}
                canMoveUp={index > 0}
                canMoveDown={index < filteredHeroItems.length - 1}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center gap-4 py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No hero items found" : "No hero items yet"}
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
        {filteredHeroItems.length ? (
          filteredHeroItems.map((heroItem, index) => (
            <HeroItemCard
              key={heroItem.id}
              heroItem={heroItem}
              mobile
              onEdit={() => {
                setEditHeroItem(heroItem);
                setIsAddNewMode(true);
              }}
              onDelete={() => {
                setIsDeleteMode(true);
                setDeleteHeroItemId(heroItem.id);
              }}
              onToggleActive={() => handleToggleActive(heroItem.id, !heroItem.isActive)}
              onMoveUp={() => handleMoveUp(heroItem.id)}
              onMoveDown={() => handleMoveDown(heroItem.id)}
              canMoveUp={index > 0}
              canMoveDown={index < filteredHeroItems.length - 1}
            />
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No hero items found" : "No hero items yet"}
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
          titleText={editHeroItem ? "Edit Hero Item" : "Add Hero Item"}
          description={
            editHeroItem
              ? "Update the hero item details and settings below."
              : "Create a new hero item by selecting a collection and configuring the display settings."
          }
          buttonTest="Cancel"
          onButtonClick={() => {
            setIsAddNewMode(false);
            setEditHeroItem(null);
          }}
        >
          <AddHeroItem
            isOpen={isAddNewMode}
            setIsOpen={setIsAddNewMode}
            editHeroItem={editHeroItem}
          />
        </ModalWrapper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteMode} onOpenChange={setIsDeleteMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hero Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hero item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteMode(false);
                setDeleteHeroItemId(undefined);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHeroItem}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Hero Item Card Component for Grid and Mobile Views
function HeroItemCard({
  heroItem,
  mobile = false,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  heroItem: HeroItemData;
  mobile?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        mobile && "border-l-4 border-l-primary/20"
      )}
    >
      <div className={cn("flex gap-4", mobile ? "p-4" : "flex-col")}>
        {/* Hero Item Image */}
        <div
          className={cn(
            "relative overflow-hidden rounded-md bg-muted",
            mobile ? "size-16 shrink-0" : "aspect-video"
          )}
        >
          <Image
            src={heroItem.imageUrl}
            alt={heroItem.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes={
              mobile
                ? "64px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            }
          />
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
                  {heroItem.title}
                </h3>
                {heroItem.description && (
                  <p
                    className={cn(
                      "line-clamp-2 text-muted-foreground",
                      mobile ? "text-xs" : "text-sm"
                    )}
                  >
                    {heroItem.description}
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
                    <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
                      <ArrowUp className="mr-2 size-4" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
                      <ArrowDown className="mr-2 size-4" />
                      Move Down
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onToggleActive}>
                      {heroItem.isActive ? (
                        <>
                          <EyeOff className="mr-2 size-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 size-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
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
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={heroItem.isActive ? "default" : "secondary"}>
                    {heroItem.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {heroItem.collection && (
                    <Badge variant="outline" className={mobile ? "text-xs" : ""}>
                      {heroItem.collection.name}
                    </Badge>
                  )}
                </div>
                <span
                  className={cn(
                    "text-muted-foreground",
                    mobile ? "text-xs" : "text-sm"
                  )}
                >
                  #{heroItem.sortOrder}
                </span>
              </div>
              <p
                className={cn(
                  "text-muted-foreground",
                  mobile ? "text-xs" : "text-sm"
                )}
              >
                Created {new Date(heroItem.createdAt).toLocaleDateString()}
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
                  <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
                    <ArrowUp className="mr-2 size-4" />
                    Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
                    <ArrowDown className="mr-2 size-4" />
                    Move Down
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onToggleActive}>
                    {heroItem.isActive ? (
                      <>
                        <EyeOff className="mr-2 size-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 size-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
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
                    Delete
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

export default HeroItemsClient;