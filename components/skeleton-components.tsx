import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function VCCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-0 mb-4 pl-[52px]">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded ml-1" />
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StartupCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-0 mb-4 pl-[52px]">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded ml-1" />
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="h-9 w-9 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function VCGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <VCCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StartupGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <StartupCardSkeleton key={i} />
      ))}
    </div>
  )
}
