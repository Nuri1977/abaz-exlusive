import { Suspense } from "react";
import GalleryClient from "./_components/GalleryClient";


export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <GalleryClient />
    </Suspense>
  );
}
