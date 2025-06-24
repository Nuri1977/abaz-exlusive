import { Suspense } from "react";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

import { SearchPageClient } from "./_components/SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchPageClient />
    </Suspense>
  );
}
