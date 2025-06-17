"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

import { useToast } from "@/hooks/useToast";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadButton } from "@/utils/uploadthing";

interface UploadButtonProps {
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  endpoint?: keyof OurFileRouter;
  className?: string;
}

const CustomUploadButton = ({
  onClientUploadComplete,
  onUploadError,
  endpoint = "imageUploader",
  className,
}: UploadButtonProps) => {
  const { toast } = useToast();

  return (
    <UploadButton
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        console.log("Files: ", res);

        if (onClientUploadComplete) {
          onClientUploadComplete(res);
        }
      }}
      onUploadError={(error: Error) => {
        toast({
          title: "Error",
          description: `${error.message}`,
          variant: "destructive",
        });

        if (onUploadError) {
          onUploadError(error);
        }
      }}
      className={`ut-button:bg-primary ut-button:text-primary-foreground ut-button:after:bg-primary/90 ut-button:focus-within:ring-2 ut-button:focus-within:ring-ring ut-button:focus-within:ring-offset-2 ut-button:hover:bg-primary/90 ut-button:data-[state=readying]:cursor-pointer ut-button:data-[state=uploading]:after:bg-primary ut-allowed-content:block ut-allowed-content:h-[1.25rem] ut-allowed-content:text-sm ut-allowed-content:text-muted-foreground ut-button:ut-readying:bg-primary/80 ut-button:ut-uploading:bg-primary/80 ${className || ""}`}
      config={{ cn: twMerge }}
    />
  );
};

export default CustomUploadButton;
