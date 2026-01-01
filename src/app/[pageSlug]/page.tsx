'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getPageBySlug, getPublishedPages } from '@/lib/pages';
import { getPostBySlug } from '@/lib/storage';
import { Page } from '@/lib/types';
import { notFound } from 'next/navigation';

// Reserved routes that should not be handled by this catch-all
const RESERVED_ROUTES = ['blog', 'admin', 'login', 'api', 'feed.xml'];

export default function PageSlugPage() {
    const params = useParams();
    const slug = params.pageSlug as string;

    const [page, setPage] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    useEffect(() => {
        // Don't handle reserved routes
        if (RESERVED_ROUTES.includes(slug)) {
            setNotFoundState(true);
            setIsLoading(false);
            return;
        }

        // First check if it's a published page
        const foundPage = getPageBySlug(slug);
        if (foundPage && foundPage.published) {
            setPage(foundPage);
            setIsLoading(false);
            return;
        }

        // If no page found, show 404
        setNotFoundState(true);
        setIsLoading(false);
    }, [slug]);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <Skeleton className="mb-4 h-12 w-3/4" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (notFoundState || !page) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <Button asChild className="mt-8">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Page Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {page.title}
                </h1>
            </header>

            {/* Page Content */}
            <div
                className="prose prose-lg max-w-none dark:prose-invert 
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-img:rounded-xl prose-img:shadow-md
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </article>
    );
}
