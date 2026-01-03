
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" /> {/* Title */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
