import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Skeleton className="h-8 w-32" />
      <div className="mt-4 flex max-w-md flex-col gap-4 py-8">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="mt-2 h-[100px] w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  );
}
