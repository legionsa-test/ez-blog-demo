'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchPhotos, trackDownload, isUnsplashConfigured } from '@/lib/unsplash';
import { UnsplashPhoto } from '@/lib/types';

interface UnsplashPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (photo: UnsplashPhoto) => void;
}

export function UnsplashPicker({ open, onOpenChange, onSelect }: UnsplashPickerProps) {
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const isConfigured = isUnsplashConfigured();

    useEffect(() => {
        if (!open) {
            setQuery('');
            setPhotos([]);
            setHasSearched(false);
            setPage(1);
            setHasMore(false);
        }
    }, [open]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim() || !isConfigured) return;

        setIsLoading(true);
        setPage(1);
        setHasSearched(true);

        try {
            const result = await searchPhotos(query, 1);
            setPhotos(result.results);
            setHasMore(result.total_pages > 1);
        } catch (error) {
            console.error('Failed to search photos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!query.trim() || !isConfigured || isLoading) return;

        setIsLoading(true);
        const nextPage = page + 1;

        try {
            const result = await searchPhotos(query, nextPage);
            setPhotos([...photos, ...result.results]);
            setPage(nextPage);
            setHasMore(nextPage < result.total_pages);
        } catch (error) {
            console.error('Failed to load more photos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = async (photo: UnsplashPhoto) => {
        // Track download as per Unsplash guidelines
        await trackDownload(photo.links.download_location);
        onSelect(photo);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Search Unsplash Photos</DialogTitle>
                </DialogHeader>

                {!isConfigured ? (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">
                            Unsplash API is not configured. Please add your API key to the environment variables.
                        </p>
                        <a
                            href="https://unsplash.com/developers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            Get an API key
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for photos..."
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" disabled={isLoading || !query.trim()}>
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                    'Search'
                                )}
                            </Button>
                        </form>

                        <ScrollArea className="h-[400px]">
                            {!hasSearched ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">
                                        Search for beautiful, free photos from Unsplash
                                    </p>
                                </div>
                            ) : photos.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">
                                        No photos found. Try a different search term.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {photos.map((photo) => (
                                            <button
                                                key={photo.id}
                                                onClick={() => handleSelect(photo)}
                                                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border transition-all hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                type="button"
                                            >
                                                <img
                                                    src={photo.urls.small}
                                                    alt={photo.alt_description || 'Unsplash photo'}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                                    <p className="w-full truncate p-2 text-xs text-white">
                                                        by {photo.user.name}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {hasMore && (
                                        <div className="flex justify-center pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={handleLoadMore}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                                ) : null}
                                                Load More
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>

                        <p className="text-center text-xs text-muted-foreground">
                            Photos provided by{' '}
                            <a
                                href="https://unsplash.com?utm_source=ezblog&utm_medium=referral"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Unsplash
                            </a>
                        </p>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
