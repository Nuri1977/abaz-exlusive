"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RefreshCw, Settings, Eye, EyeOff, Edit } from "lucide-react";

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
import ModalWrapper from "@/components/shared/modals/ModalWrapper";
import type { PromoBannerData } from "@/services/promoBanner/promoBannerService";
import type { Collection } from "@prisma/client";

import PromoBannerForm from "./blocks/PromoBannerForm";

interface PromoBannerClientProps {
  promoBanner: PromoBannerData | null;
  collections: Collection[];
}

const PromoBannerClient = ({ promoBanner, collections }: PromoBannerClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClearPromoBanner = async () => {
    setLoading(true);
    try {
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
        toast({
          title: "Success",
          description: "Promo banner cleared successfully",
        });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while clearing promo banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const hasActivePromoBanner = promoBanner?.isActive && promoBanner?.collection;
  const selectedCollection = promoBanner?.collection;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Promo Banner Configuration
                <Badge variant={hasActivePromoBanner ? "default" : "secondary"}>
                  {hasActivePromoBanner ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure the promotional banner displayed on your homepage
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
              <Button onClick={() => setIsEditMode(true)}>
                <Settings className="mr-2 size-4" />
                <span className="hidden sm:inline">Configure</span>
                <span className="sm:hidden">Config</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Configuration</CardTitle>
            <CardDescription>
              Current promo banner settings and selected collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasActivePromoBanner && selectedCollection ? (
              <div className="space-y-4">
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
                    <h3 className="font-medium">{selectedCollection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Collection • {selectedCollection.slug}
                    </p>
                  </div>
                  <Badge variant="default">
                    <Eye className="mr-1 size-3" />
                    Active
                  </Badge>
                </div>

                <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
                  <h4 className="text-sm font-medium">Banner Details</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">Title:</span> {selectedCollection.name}</p>
                    <p><span className="font-medium">Link:</span> /collections/{selectedCollection.slug}</p>
                    <p><span className="font-medium">Updated:</span> {new Date(promoBanner.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearPromoBanner}
                    disabled={loading}
                    className="flex-1"
                  >
                    <EyeOff className="mr-2 size-4" />
                    {loading ? "Clearing..." : "Clear"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
                  <div className="text-center">
                    <EyeOff className="mx-auto size-8 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No Promo Banner</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No collection is currently selected for the promo banner
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditMode(true)}
                  className="w-full"
                >
                  <Settings className="mr-2 size-4" />
                  Select Collection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>
              How the promo banner will appear on your homepage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg border bg-muted">
              {hasActivePromoBanner && selectedCollection ? (
                <div className="relative h-full">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                    <h2 className="mb-2 text-lg font-bold md:text-xl">
                      {selectedCollection.name}
                    </h2>
                    <p className="mb-4 text-sm opacity-90 md:text-base">
                      COLLECTION
                    </p>
                    <div className="rounded bg-white px-3 py-1 text-xs text-black">
                      Shop Collection
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-full bg-gradient-to-r from-blue-500 to-purple-600">
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60" />

                  {/* Fallback Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                    <h2 className="mb-2 text-lg font-bold md:text-xl">
                      Free Express Shipping
                    </h2>
                    <p className="mb-4 text-sm opacity-90 md:text-base">
                      SPECIAL OFFER
                    </p>
                    <div className="rounded bg-white px-3 py-1 text-xs text-black">
                      Shop Now
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                {hasActivePromoBanner ? "Collection Banner Preview" : "Default Fallback Preview"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
          <CardDescription>
            Promo banner configuration overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {collections.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Collections
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {hasActivePromoBanner ? "1" : "0"}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Banner
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {promoBanner ? new Date(promoBanner.updatedAt).toLocaleDateString() : "Never"}
              </div>
              <div className="text-sm text-muted-foreground">
                Last Updated
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {hasActivePromoBanner ? "Live" : "Fallback"}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Status
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditMode && (
        <ModalWrapper
          openModal={isEditMode}
          setOpenModal={setIsEditMode}
          titleText="Configure Promo Banner"
          description="Select a collection to feature in the promo banner or clear the selection to use default content."
          buttonTest="Cancel"
          onButtonClick={() => setIsEditMode(false)}
        >
          <PromoBannerForm
            isOpen={isEditMode}
            setIsOpen={setIsEditMode}
            currentPromoBanner={promoBanner}
            collections={collections}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default PromoBannerClient;