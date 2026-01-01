'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Clock, Calendar, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublishedPosts } from '@/lib/storage';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const allPosts = getPublishedPosts();
        setPosts(allPosts);
        setFilteredPosts(allPosts);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let filtered = posts;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query) ||
                    post.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Filter by tag
        if (selectedTag) {
            filtered = filtered.filter((post) =>
                post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
            );
        }

        setFilteredPosts(filtered);
    }, [searchQuery, selectedTag, posts]);

    // Get all unique tags
    const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Discover insights, tutorials, and stories from our community.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        placeholder="Search posts..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search posts"
                    />
                </div>

                {allTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tags">
                        <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`rounded-full px-3 py-1 text-sm transition-colors ${selectedTag === null
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            All
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${selectedTag === tag
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Posts Grid */}
            {isLoading ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[350px] rounded-xl" />
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-lg text-muted-foreground">
                        {searchQuery || selectedTag
                            ? 'No posts found matching your criteria.'
                            : 'No posts yet. Check back soon!'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PostCard({ post }: { post: Post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:ring-1 hover:ring-primary/20">
                <CardHeader className="p-0">
                    <div className="relative aspect-[16/10] overflow-hidden">
                        {post.coverImage ? (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-muted">
                                <span className="text-4xl">📝</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                        {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                    </p>
                </CardContent>
                <CardFooter className="flex items-center gap-4 border-t border-border/40 p-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.readingTime} min
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
