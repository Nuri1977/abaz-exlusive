import { Suspense } from "react";
import { CollectionsList } from "./_components/CollectionsList";

export const metadata = {
  title: "Collections | Abaz Exclusive",
  description: "Explore our curated collections of premium footwear",
};

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h1 className="text-3xl font-light tracking-wide text-left sm:text-4xl md:text-5xl lg:text-6xl">CATALOG</h1>
      </div>

      <Suspense fallback={<div className="py-16 text-center">Loading collections...</div>}>
        <CollectionsList />
      </Suspense>
    </div>
  );
}