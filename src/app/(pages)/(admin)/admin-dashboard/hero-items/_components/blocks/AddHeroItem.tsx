"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HeroItemData } from "@/services/heroItems/heroItemService";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url?: string;
    appUrl?: string;
  } | null;
}

interface AddHeroItemProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editHeroItem: HeroItemData | null;
}

const AddHeroItem = ({ isOpen, setIsOpen, editHeroItem }: AddHeroItemProps) => {
  const { toast } = useToast();
  const router = useRouter();

  // Form state - only what user can control
  const [collectionId, setCollectionId] = useState(editHeroItem?.collectionId || "none");
  const [description, setDescription] = useState(editHeroItem?.description || "");
  const [isActive, setIsActive] = useState(editHeroItem?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(editHeroItem?.sortOrder || 0);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [existingHeroItems, setExistingHeroItems] = useState<HeroItemData[]>([]);

  // Filter out collections that are already used as hero items (except when editing)
  const usedCollectionIds = existingHeroItems
    .filter(item => editHeroItem ? item.id !== editHeroItem.id : true)
    .map(item => item.collectionId)
    .filter(Boolean);

  const availableCollections = collections.filter(collection =>
    !usedCollectionIds.includes(collection.id)
  );

  // Derived values from selected collection
  const selectedCollection = collections.find(c => c.id === collectionId);
  const title = selectedCollection?.name ?? "";
  const imageUrl = selectedCollection?.image?.url ?? selectedCollection?.image?.appUrl ?? "";
  const linkUrl = selectedCollection ? `/collections/${selectedCollection.slug}` : "";

  useEffect(() => {
    if (isOpen) {
      void fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      // Fetch both collections and existing hero items
      const [collectionsResponse, heroItemsResponse] = await Promise.all([
        fetch("/api/admin/collections"),
        fetch("/api/admin/hero-items")
      ]);

      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json() as Collection[];
        setCollections(collectionsData);
      }

      if (heroItemsResponse.ok) {
        const heroItemsData = await heroItemsResponse.json() as HeroItemData[];
        setExistingHeroItems(heroItemsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load collections data",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const addHeroItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (collectionId === "none" || !selectedCollection) {
      toast({
        title: "Error",
        description: "Please select a collection",
        variant: "destructive",
      });
      return;
    }

    if (availableCollections.length === 0) {
      toast({
        title: "Error",
        description: "No available collections. All collections are already used as hero items.",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Selected collection must have an image",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        ...(description.trim() && { description: description.trim() }),
        imageUrl,
        linkUrl,
        collectionId,
        isActive,
        sortOrder,
      };



      const response = await fetch(`/api/admin/hero-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string; details?: Array<{ message: string; path: string[] }> };


        let errorMessage = errorData.error || "Failed to add hero item";
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map(detail => `${detail.path.join('.')}: ${detail.message}`).join(', ');
          errorMessage = `Validation error: ${validationErrors}`;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        router.refresh();
        toast({
          title: "Success",
          description: "Hero item added successfully",
        });
        setIsOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHeroItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (collectionId === "none" || !selectedCollection || !editHeroItem?.id) {
      toast({
        title: "Error",
        description: "Please select a collection",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Selected collection must have an image",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/hero-items/${editHeroItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description.trim() || null,
          imageUrl,
          linkUrl,
          collectionId,
          isActive,
          sortOrder,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        toast({
          title: "Error",
          description: errorData.error || "Failed to update hero item",
          variant: "destructive",
        });
      } else {
        router.refresh();
        toast({
          title: "Success",
          description: "Hero item updated successfully",
        });
        setIsOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (editHeroItem) {
      await updateHeroItem(e);
    } else {
      await addHeroItem(e);
    }
  };

  const resetForm = () => {
    setDescription("");
    setCollectionId("none");
    setIsActive(true);
    setSortOrder(0);
  };

  return (
    <form className="w-full max-w-full p-6" onSubmit={handleSubmit}>
      {fetchingData && (
        <div className="mb-4 flex items-center justify-center rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>Loading collections...</span>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <Label>Select Collection</Label>
          {!fetchingData && availableCollections.length === 0 && !editHeroItem && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ All collections are already used as hero items. Create new collections or remove existing hero items first.
            </p>
          )}
          <Select value={collectionId} onValueChange={setCollectionId} disabled={fetchingData}>
            <SelectTrigger className="mt-2 w-full text-sm">
              <SelectValue placeholder={fetchingData ? "Loading collections..." : "Choose a collection"} />
            </SelectTrigger>
            <SelectContent>
              {fetchingData ? (
                <SelectItem value="loading" disabled>
                  Loading collections...
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="none">Select a collection</SelectItem>
                  {availableCollections.length > 0 ? (
                    availableCollections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-collections" disabled>
                      No available collections (all are already used)
                    </SelectItem>
                  )}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Preview of selected collection data */}
        {selectedCollection && (
          <div className="rounded-lg border bg-muted/50 p-5">
            <h4 className="mb-4 text-base font-medium">Hero Item Preview</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Title:</span>
                  <div className="mt-1 text-sm">{title}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Link URL:</span>
                  <div className="mt-1 text-sm text-blue-600">{linkUrl}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Image URL:</span>
                  {imageUrl ? (
                    <div className="mt-1 w-full overflow-hidden break-all rounded border bg-background p-2 text-xs text-muted-foreground">
                      {imageUrl}
                    </div>
                  ) : (
                    <div className="mt-1 w-full rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">
                      ⚠️ No image available for this collection
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label>Description (Optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter custom description for this hero item"
            className="mt-2 w-full resize-none text-sm"
            rows={2}
          />
        </div>

        <div>
          <Label>Sort Order</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="mt-2 w-full max-w-24 text-sm"
            min="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked as boolean)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="mt-8 border-t pt-4">
        <Button
          type="submit"
          className="w-full max-w-full rounded-md bg-primary px-6 py-3 text-white"
          disabled={loading || fetchingData || collectionId === "none" || !imageUrl || availableCollections.length === 0}
        >
          {loading
            ? `${editHeroItem ? "Updating..." : "Adding..."}`
            : `${editHeroItem ? "Update Hero Item" : "Add Hero Item"}`}
        </Button>
      </div>
    </form>
  );
};

export default AddHeroItem;