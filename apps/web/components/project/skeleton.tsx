import { Skeleton } from "../ui/skeleton";

export function ProjectSkeleton() {
  return (
    <div className="container mx-auto py-6 px-2 sm:px-4">
      <div className="flex items-center gap-2 text-sm mb-6 border-b pb-4">
        <div className="p-2 border rounded">
          <Skeleton className="h-4 w-4" />
        </div>
        <Skeleton className="h-4 w-20" />
        <span>/</span>
        <Skeleton className="h-4 w-20" />{" "}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />{" "}
      </div>

      <div className="border-b mb-6 flex w-full justify-start rounded-none bg-transparent h-auto p-0 overflow-x-auto">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="px-4 py-2 whitespace-nowrap">
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Search and Filter Skeleton */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>

      <div className="border rounded-md overflow-x-auto">
        {[...Array(5)].map((_, index) => (
          <ProjectItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
function ProjectItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Skeleton className="w-8 h-8 rounded" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <Skeleton className="h-5 w-40" />

            <Skeleton className="h-4 w-4" />

            <Skeleton className="h-4 w-20" />
          </div>

          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-6" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />{" "}
      </div>
    </div>
  );
}
