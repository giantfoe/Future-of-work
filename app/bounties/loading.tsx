import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  // Create an array of 9 items for the skeleton grid
  const skeletonItems = Array.from({ length: 9 }, (_, i) => i)

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Mobile filters skeleton */}
        <div className="lg:hidden mb-6">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar skeleton - Desktop */}
          <div className="space-y-8 hidden lg:block">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-16" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-10 w-full" />
          </div>

          {/* Bounties grid skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skeletonItems.map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden bg-white h-[460px] flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="mb-4">
                      <Skeleton className="h-6 w-16 mb-3 rounded-full" />
                      <Skeleton className="h-7 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>

                    <div className="space-y-2 mt-4">
                      <Skeleton className="h-5 w-24" />
                      <div className="mt-3">
                        <Skeleton className="h-20 w-full rounded-md" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
