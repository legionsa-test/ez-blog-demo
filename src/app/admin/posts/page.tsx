'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getViewCounts } from '@/lib/analytics';
import { getSiteSettings } from '@/lib/site-settings';
import { getPrimaryAuthor } from '@/lib/authors';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [viewCounts, setViewCounts] = useState<{ [slug: string]: number }>({});
    const [notionUrl, setNotionUrl] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter((p) => p.status === statusFilter));
        }
    }, [statusFilter, posts]);

    const loadPosts = async () => {
        setIsLoading(true);

        const settings = getSiteSettings();
        setNotionUrl(settings.notionPageUrl || null);

        const counts = getViewCounts();
        setViewCounts(counts);

        if (settings.notionPageUrl) {
            try {
                const response = await fetch('/api/notion/content');
                const data = await response.json();

                if (data.posts && data.posts.length > 0) {
                    const author = getPrimaryAuthor();
                    const postsData: Post[] = data.posts.map((post: any) => ({
                        id: post.notionId,
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt || '',
                        content: post.content,
                        coverImage: post.coverImage || '',
                        tags: post.tags || [],
                        status: post.status,
                        publishedAt: post.publishedAt || new Date().toISOString(),
                        createdAt: post.publishedAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        author,
                        notionId: post.notionId,
                        source: 'notion' as const,
                        categoryId: '',
                        scheduledAt: null,
                        readingTime: Math.ceil((post.content?.length || 0) / 1000),
                    }));
                    setPosts(postsData);
                    setLastSync(data.source === 'cache'
                        ? `Cached ${data.cacheAge}s ago`
                        : 'Just synced');
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        }

        setIsLoading(false);
    };

    const publishedCount = posts.filter((p) => p.status === 'published').length;
    const draftCount = posts.filter((p) => p.status === 'draft').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
                    <p className="text-muted-foreground">
                        Content synced from Notion • {lastSync}
                    </p>
                </div>
                {notionUrl && (
                    <Button variant="outline" asChild>
                        <a href={notionUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Edit in Notion
                        </a>
                    </Button>
                )}
            </div>

            {/* Info Banner */}
            <Card className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">
                        📝 <strong>Read-only view</strong> — Create and edit posts in your Notion database.
                        Changes sync automatically every 5 minutes.
                    </p>
                </CardContent>
            </Card>

            {/* Stats & Filters */}
            <div className="flex items-center justify-between">
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <TabsList>
                        <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
                        <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
                        <TabsTrigger value="draft">Drafts ({draftCount})</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="sm" onClick={loadPosts}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Posts List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>
                        {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} from Notion
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!notionUrl ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">Notion not configured.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Set <code className="rounded bg-muted px-1">NOTION_PAGE_URL</code> in Vercel.
                            </p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No posts found.</p>
                            <Button variant="outline" className="mt-4" asChild>
                                <a href={notionUrl} target="_blank" rel="noopener noreferrer">
                                    Add posts in Notion
                                </a>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="font-medium text-foreground hover:text-primary line-clamp-1"
                                            >
                                                {post.title || 'Untitled'}
                                            </Link>
                                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                {post.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>
                                                {post.publishedAt
                                                    ? format(new Date(post.publishedAt), 'MMM d, yyyy')
                                                    : 'No date'}
                                            </span>
                                            {post.tags.length > 0 && (
                                                <span>• {post.tags.slice(0, 3).join(', ')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Eye className="h-4 w-4" />
                                            <span className="text-sm">{viewCounts[post.slug] || 0}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/blog/${post.slug}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
