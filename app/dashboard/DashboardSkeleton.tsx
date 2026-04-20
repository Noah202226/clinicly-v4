import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-6 px-6">
      <Skeleton className="h-10 w-64 mb-2" /> {/* Title Skeleton */}
      {/* Birthday List Skeleton */}
      <Skeleton className="h-[200px] w-full rounded-xl" />
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border rounded-xl space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      {/* Analytics/Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
      </div>
    </div>
  );
}
