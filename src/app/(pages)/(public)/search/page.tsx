import { Suspense } from "react";
import type { Metadata } from "next";

import { generateSearchMetadata } from "@/lib/metadata";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

import { SearchPageClient } from "./_components/SearchPageClient";

// Generate dynamic metadata based on search query
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  if (query) {
    return generateSearchMetadata(query);
  }

  // Default search page metadata when no query
  return {
    title: "Search Women's Dresses - Find Your Perfect Style",
    description: "Search our collection of premium women's dresses. Find elegant cocktail dresses, formal wear, and casual styles at Abaz Exclusive.",
    robots: { index: false, follow: true }, // Don't index search pages
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchPageClient />
    </Suspense>
  );
}
