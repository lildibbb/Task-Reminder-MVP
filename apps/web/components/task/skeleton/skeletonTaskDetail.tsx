"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";

export default function TaskDetailSkeleton() {
  return (
    <div className="container mx-auto py-4 px-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Back Button */}
      <div className="mb-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            {/* Badges & Meta */}
            <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Description */}
            <div className="prose max-w-none dark:prose-invert mb-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            {/* Activity Log */}
            <div className="mb-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Assignee */}
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              {/* Verifier */}
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              {/* Status */}
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              {/* Priority */}
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              {/* Dates */}
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
              {/* Participants */}
              <div className="border rounded-md p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
