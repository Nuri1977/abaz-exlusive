"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteImage } from "@/services/shared/image-service";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ImageDetail {
  id: string;
  name: string;
  size: number;
  url: string;
  key: string;
  type: string;
  createdAt: string;
  lastModified: number;
  metadata: any;
}

export default function ImageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [image, setImage] = useState<ImageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/admin/gallery/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch image");
        const data = await response.json();
        setImage(data);
      } catch (error) {
        console.error("Error fetching image:", error);
        toast({
          title: "Error",
          description: "Failed to fetch image details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [params.id, toast]);

  const handleDelete = async () => {
    try {
      const result = await deleteImage(image?.key || "");
      if (result.success) {
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
        router.push("/admin-dashboard/gallery");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = async () => {
    if (!image?.url) return;
    try {
      await navigator.clipboard.writeText(image.url);
      toast({
        title: "Success",
        description: "Image URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!image) {
    return <div className="text-center py-8">Image not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/admin-dashboard/gallery">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{image.name}</h1>
            <p className="text-sm text-gray-500">
              Uploaded on {new Date(image.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium mb-2">File Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Size</p>
                  <p>{(image.size / 1024).toFixed(1)} KB</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p>{image.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Modified</p>
                  <p>{new Date(image.lastModified * 1000).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">File Key</p>
                  <p className="truncate">{image.key}</p>
                </div>
              </div>
            </div>

            {image.metadata && Object.keys(image.metadata).length > 0 && (
              <div>
                <h2 className="text-sm font-medium mb-2">Metadata</h2>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(image.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>

              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Image
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Image</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this image? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
