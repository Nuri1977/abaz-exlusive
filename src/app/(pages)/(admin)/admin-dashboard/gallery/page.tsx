"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/useToast";
import { useGalleryQuery, useGalleryMutation } from "@/hooks/useGallery";
import { UploadButton } from "@/utils/uploadthing";
import { Eye, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { GalleryImage } from "@/lib/query/gallery";
import type { FileUploadThing } from "@/types/UploadThing";

export default function GalleryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncing, setSyncing] = useState(false);
  const currentPage = parseInt(searchParams?.get("page") || "1");
  const limit = 12;

  const { data, isLoading, error, refetch, isPending } = useGalleryQuery(currentPage, limit);
  const { mutate: createGalleryItem } = useGalleryMutation();
  const images = data?.items ?? [];
  const pagination = data?.pagination;

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/admin/gallery/sync", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Synced ${data.synced} items, deleted ${data.deleted} items`,
        });
        refetch();
      } else {
        throw new Error(data.error || "Failed to sync gallery");
      }
    } catch (error) {
      console.error("Error syncing gallery:", error);
      toast({
        title: "Error",
        description: "Failed to sync gallery",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pagination || newPage < 1 || newPage > pagination.totalPages) return;
    router.push(`/admin-dashboard/gallery?page=${newPage}`);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch images",
      variant: "destructive",
    });
  }

  const renderPaginationItems = () => {
    if (!pagination) return null;
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, pagination.page - halfVisible);
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pagination.page - 1);
          }}
          className={
            pagination.page === 1 || isPending ? "pointer-events-none opacity-50" : ""
          }
        />
      </PaginationItem>
    );

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={i === pagination.page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={pagination.totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(pagination.totalPages);
            }}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pagination.page + 1);
          }}
          className={
            (pagination.page === pagination.totalPages || isPending)
              ? "pointer-events-none opacity-50"
              : ""
          }
        />
      </PaginationItem>
    );

    return items;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <div className="flex gap-4">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Gallery"}
          </Button>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (!res?.[0]) return;
              
              const uploadedFile = res[0];
              const mainUrl = uploadedFile.url;

              createGalleryItem({
                name: uploadedFile.name,
                size: uploadedFile.size,
                key: uploadedFile.key,
                lastModified: Math.floor((uploadedFile.lastModified || Date.now()) / 1000),
                serverData: uploadedFile.serverData || { uploadedBy: null },
                url: mainUrl,
                appUrl: mainUrl,
                ufsUrl: mainUrl,
                customId: null,
                type: uploadedFile.type,
                fileHash: uploadedFile.key,
                reference: null,
                metadata: {},
                width: null,
                height: null,
                tags: [],
                uploadedBy: uploadedFile.serverData?.uploadedBy || null,
                usedIn: [],
                isDeleted: false
              },
              {
                  onSuccess: () => {
                    refetch();
                  },
                  onError: (error) => {
                    toast({
                      title: "Upload Error",
                      description: error.message,
                      variant: "destructive",
                    });
                  },
              });
            }}
            onUploadError={(error: Error) => {
              toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
              });
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : images.length === 0 ? (
        <div className="text-center text-gray-500">No images found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image: GalleryImage) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(image.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Link href={`/admin-dashboard/gallery/${image.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>{renderPaginationItems()}</PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
