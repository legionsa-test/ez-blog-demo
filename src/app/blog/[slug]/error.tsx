'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Blog post error:', error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 text-center">
            <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Something went wrong
            </h2>
            <p className="mt-4 text-muted-foreground">
                We couldn&apos;t load this post properly. It might be a temporary issue with our connection to Notion.
            </p>
            <div className="mt-8 flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
            </div>
        </div>
    );
}
