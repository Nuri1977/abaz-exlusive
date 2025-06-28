import { Suspense } from "react";

import GalleryClient from "./_components/GalleryClient";

export default async function GalleryPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading...</div>}>
      <GalleryClient />
    </Suspense>
  );
}
