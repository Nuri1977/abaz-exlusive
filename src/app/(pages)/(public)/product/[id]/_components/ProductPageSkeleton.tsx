import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:sticky md:top-4 space-y-4">
          <Skeleton className="w-full h-[650px] rounded-xl" />
          <div className="flex space-x-2">
            <Skeleton className="w-20 h-20 rounded-md" />
            <Skeleton className="w-20 h-20 rounded-md" />
            <Skeleton className="w-20 h-20 rounded-md" />
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="w-3/4 h-10" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-40 h-10" />
          <Skeleton className="w-20 h-8" />
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-20 h-4 mb-2" />
                  <Skeleton className="w-32 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
