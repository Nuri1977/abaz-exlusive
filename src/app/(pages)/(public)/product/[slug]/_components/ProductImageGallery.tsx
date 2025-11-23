import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FileUploadThing } from "@/types/UploadThing";

interface ProductImageGalleryProps {
  images: FileUploadThing[];
}

export default function ProductImageGallery({
  images,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Lock body scroll when lightbox is open
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

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
    <div className="space-y-4 shadow-md p-1">
      {/* Main Image - Natural Aspect Ratio */}
      <div 
        className="relative flex w-full h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[700px] 3xl:h-[800px] cursor-zoom-in items-center justify-center overflow-hidden rounded-lg"
        onClick={openLightbox}
      >
        <Image
          src={images[selectedImage]?.url || ""}
          alt={images[selectedImage]?.name || "Product image"} 
          width={2000}
          height={2000}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="max-h-[450px] min-h-[450px] md:max-h-[500px] md:min-h-[500px] lg:max-h-[550px] lg:min-h-[550px] xl:max-h-[600px] xl:min-h-[600px] 2xl:max-h-[700px] 2xl:min-h-[700px] 3xl:max-h-[800px] 3xl:min-h-[800px] max-w-full object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2 md:grid-cols-8">
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

      {/* Lightbox Portal */}
      {mounted && isLightboxOpen && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Lightbox Image */}
          <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedImage]?.url || ""}
              alt={images[selectedImage]?.name || "Product image full screen"}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}