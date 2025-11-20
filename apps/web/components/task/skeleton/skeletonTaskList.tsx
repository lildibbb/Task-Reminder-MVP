"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TaskCardSkeleton = () => (
  <Skeleton className="overflow-hidden border-l-4 border-transparent">
    <div className="p-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40 rounded" />
          </div>
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
      </div>
    </div>
  </Skeleton>
);
export const TaskCardSkeletonList = () => (
  <div className="grid gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <TaskCardSkeleton key={i} />
    ))}
  </div>
);
