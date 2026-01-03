import { Skeleton } from "@/components/ui/skeleton"

export function BlogPostSkeleton() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="mx-auto max-w-3xl text-center space-y-4 mb-8">
                <Skeleton className="h-4 w-32 mx-auto" /> {/* Date */}
                <Skeleton className="h-12 w-3/4 mx-auto" /> {/* Title */}
                <div className="flex justify-center gap-2">
                    <Skeleton className="h-6 w-20" /> {/* Tag */}
                    <Skeleton className="h-6 w-20" /> {/* Tag */}
                </div>
            </div>

            {/* Cover Image Skeleton */}
            <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
                <Skeleton className="aspect-[2/1] w-full rounded-xl" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Sidebar Left */}
                <div className="hidden lg:col-span-3 lg:block">
                    <Skeleton className="h-40 w-full" />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-64 w-full rounded-lg mt-8" /> {/* Image/Block */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
    )
}
