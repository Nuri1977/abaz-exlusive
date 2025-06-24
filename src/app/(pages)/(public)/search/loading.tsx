import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const LoadingSearchPage = () => {
  return (
    <main className="flex-1 pb-16">
      <div className="border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-14 w-full max-w-2xl" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LoadingSearchPage;
