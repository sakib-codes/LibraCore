import { Skeleton } from "@/components/ui/skeleton";

export function BookCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm p-4 space-y-3"
        >
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-md pt-2" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton({ variant = "card" }: { variant?: "card" | "row" }) {
  if (variant === "row") {
    return <Skeleton className="h-16 w-full rounded-xl" />;
  }
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm p-4 space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-9 w-full rounded-md pt-2" />
    </div>
  );
}

