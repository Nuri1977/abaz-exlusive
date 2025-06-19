"use client";

import { useState } from "react";
import Image from "next/image";
import { FileUploadThing } from "@/types/UploadThing";

interface ProductImageGalleryProps {
  images: FileUploadThing[];
}

export default function ProductImageGallery({
  images,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <div className="flex h-full items-center justify-center text-gray-500">
          No image available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={images[selectedImage]?.url || ""}
          alt={images[selectedImage]?.name || "Product image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image?.key || index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                selectedImage === index ? "border-black" : "border-transparent"
              }`}
            >
              <Image
                src={image?.url || ""}
                alt={image?.name || `Product thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
