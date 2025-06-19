"use client";

import Image from "next/image";
import React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useToast } from "@/hooks/useToast";
import { FileUploadThing } from "@/types/UploadThing";

interface MultiImageUploaderProps {
  onChange?: (value: FileUploadThing[], newItem?: FileUploadThing) => void;
  onRemove: (value: FileUploadThing[], key?: string) => void;
  value: FileUploadThing[];
  maxLimit?: number;
}

const MultiImageUploader = ({
  onChange,
  onRemove,
  value,
  maxLimit = 10,
}: MultiImageUploaderProps) => {
  const { toast } = useToast();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const deleteUploadThingFile = async (
    key: string | undefined,
    userId: string | undefined
  ) => {
    let success = false;
    try {
      const res = await fetch(`/api/uploadthing/files`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          fileKey: key || "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        if (data?.deletedCount > 0) {
          success = true;
        }
      }
    } catch (error: any) {
      console.log("Error deleting file:", error);
      success = false;
    }

    return success;
  };
  const onDeleteFile = async (key: string) => {
    const files = value;
    const fileToDelete = files.find((item) => item.key === key);
    let filteredFiles = files.filter((item) => item.key !== key);
    onRemove(filteredFiles, key);
    const result = await deleteUploadThingFile(key, userId);
  };
  const onUpdateFile = (newFiles: FileUploadThing[]) => {
    onChange?.([...value, ...newFiles], newFiles[0]);
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap flex-col sm:flex-row items-center gap-4">
        {!!value.length &&
          value?.map((item) => (
            <div
              key={item.key}
              className="relative w-[200px] h-[200px] rounded-md overflow-hidden border"
            >
              <div className="z-10 absolute top-2 right-2">
                <Button
                  type="button"
                  onClick={() => onDeleteFile(item.key)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Image
                  fill
                  className="object-cover"
                  alt="Image"
                  src={item.url || "/no-image.jpg"}
                />
              </div>
            </div>
          ))}
      </div>
      <div>
        {value.length < maxLimit && (
          <UploadDropzone<OurFileRouter, "imageUploader">
            className="dark:bg-zinc-800 py-2 ut-label:text-sm ut-allowed-content:ut-uploading:text-red-300"
            endpoint="imageUploader"
            config={{ mode: "auto" }}
            content={{
              allowedContent({ isUploading }: { isUploading: boolean }) {
                if (isUploading)
                  return (
                    <>
                      <p className="mt-2 text-base text-primary animate-pulse">
                        Img Uploading...
                      </p>
                    </>
                  );
              },
            }}
            onClientUploadComplete={(res: any) => {
              if (res) {
                const uploadedFiles: FileUploadThing[] = res.map(
                  (file: any) => ({
                    ...file,
                    lastModified: file.lastModified ?? Date.now(),
                    serverData: {
                      uploadedBy: "system",
                    },
                  })
                );
                onUpdateFile(uploadedFiles);
              }
            }}
            onUploadError={(error: Error) => {
              toast({
                title: "Error",
                variant: "destructive",
                description: error.message,
              });
            }}
            onUploadBegin={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default MultiImageUploader;
