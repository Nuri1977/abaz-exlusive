import { Suspense } from "react";
import { CollectionsList } from "./_components/CollectionsList";

export const metadata = {
  title: "Collections | Abaz Exclusive",
  description: "Explore our curated collections of premium footwear",
};

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-light tracking-wide text-left">CATALOG</h1>
      </div>

      <Suspense fallback={<div className="py-16 text-center">Loading collections...</div>}>
        <CollectionsList />
      </Suspense>
    </div>
  );
}