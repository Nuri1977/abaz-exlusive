"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { PromoBannerData } from "@/services/promoBanner/promoBannerService";
import type { Collection } from "@prisma/client";

interface PromoBannerFormProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentPromoBanner: PromoBannerData | null;
  collections: Collection[];
}

const PromoBannerForm = ({
  isOpen,
  setIsOpen,
  currentPromoBanner,
  collections
}: PromoBannerFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [selectedCollectionId, setSelectedCollectionId] = useState(
    currentPromoBanner?.collectionId || "none"
  );
  const [loading, setLoading] = useState(false);

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const collectionId = selectedCollectionId === "none" ? null : selectedCollectionId;

      const response = await fetch("/api/admin/promo-banner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collectionId }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        toast({
          title: "Error",
          description: errorData.error || "Failed to update promo banner",
          variant: "destructive",
        });
      } else {
        router.refresh();
        toast({
          title: "Success",
          description: collectionId
            ? "Promo banner updated successfully"
            : "Promo banner cleared successfully",
        });
        setIsOpen(false);
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

  const handleClear = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/promo-banner", {
        method: "DELETE",
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to clear promo banner",
          variant: "destructive",
        });
      } else {
        router.refresh();
        toast({
          title: "Success",
          description: "Promo banner cleared successfully",
        });
        setIsOpen(false);
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

  return (
    <form className="w-full max-w-full p-6" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Current Status */}
        {currentPromoBanner?.collection && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-3 text-sm font-medium">Current Selection</h4>
            <div className="flex items-center gap-3">
              <div className="relative size-10 overflow-hidden rounded bg-muted">
                {currentPromoBanner.collection.image &&
                  typeof currentPromoBanner.collection.image === 'object' &&
                  currentPromoBanner.collection.image !== null &&
                  'url' in currentPromoBanner.collection.image ? (
                  <Image
                    src={currentPromoBanner.collection.image.url as string}
                    alt={currentPromoBanner.collection.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{currentPromoBanner.collection.name}</div>
                <div className="text-sm text-muted-foreground">
                  /collections/{currentPromoBanner.collection.slug}
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        )}

        {/* Collection Selection */}
        <div>
          <Label>Select Collection</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a collection to feature in the promo banner, or select "None" to use default content.
          </p>
          <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
            <SelectTrigger className="mt-2 w-full text-sm">
              <SelectValue placeholder="Choose a collection or none" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Use default content)</SelectItem>
              {collections.length > 0 ? (
                collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    <div className="flex items-center gap-2">
                      <span>{collection.name}</span>
                      {!collection.image && (
                        <Badge variant="outline" className="text-xs">
                          No Image
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-collections" disabled>
                  No collections available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Preview of selected collection */}
        {selectedCollection && (
          <div className="rounded-lg border bg-muted/50 p-5">
            <h4 className="mb-4 text-base font-medium">Preview</h4>
            <div className="space-y-4">
              {/* Collection Info */}
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded bg-muted">
                  {selectedCollection.image &&
                    typeof selectedCollection.image === 'object' &&
                    selectedCollection.image !== null &&
                    'url' in selectedCollection.image ? (
                    <Image
                      src={selectedCollection.image.url as string}
                      alt={selectedCollection.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{selectedCollection.name}</div>
                  <div className="text-sm text-muted-foreground">
                    /collections/{selectedCollection.slug}
                  </div>
                </div>
              </div>

              {/* Banner Preview */}
              <div className="relative aspect-[3/1] overflow-hidden rounded border bg-muted">
                {selectedCollection.image &&
                  typeof selectedCollection.image === 'object' &&
                  selectedCollection.image !== null &&
                  'url' in selectedCollection.image ? (
                  <Image
                    src={selectedCollection.image.url as string}
                    alt={selectedCollection.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                    <span className="text-white">No Image Available</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <h3 className="mb-1 text-sm font-bold md:text-base">
                    {selectedCollection.name}
                  </h3>
                  <p className="mb-2 text-xs opacity-90">COLLECTION</p>
                  <div className="rounded bg-white px-2 py-1 text-xs text-black">
                    Shop Collection
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banner Title:</span>
                  <span>{selectedCollection.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Link URL:</span>
                  <span className="text-blue-600">/collections/{selectedCollection.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has Image:</span>
                  <span>{selectedCollection.image ? "Yes" : "No"}</span>
                </div>
              </div>

              {!selectedCollection.image && (
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  ⚠️ This collection doesn't have an image. The banner will use a default background.
                </div>
              )}
            </div>
          </div>
        )}

        {selectedCollectionId === "none" && (
          <div className="rounded-lg border bg-muted/50 p-5">
            <h4 className="mb-4 text-base font-medium">Default Content Preview</h4>
            <div className="relative aspect-[3/1] overflow-hidden rounded border bg-gradient-to-r from-blue-500 to-purple-600">
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60" />

              {/* Fallback Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                <h3 className="mb-1 text-sm font-bold md:text-base">
                  Free Express Shipping
                </h3>
                <p className="mb-2 text-xs opacity-90">SPECIAL OFFER</p>
                <div className="rounded bg-white px-2 py-1 text-xs text-black">
                  Shop Now
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Default promotional content will be displayed when no collection is selected.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3 border-t pt-4">
        {currentPromoBanner?.collection && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Clearing..." : "Clear Banner"}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || collections.length === 0}
          className="flex-1"
        >
          {loading
            ? "Updating..."
            : selectedCollectionId === "none"
              ? "Clear Selection"
              : "Update Banner"}
        </Button>
      </div>
    </form>
  );
};

export default PromoBannerForm;