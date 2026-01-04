'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, TrendingUp, BarChart3, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getViewCounts } from '@/lib/analytics';
import { getSiteSettings } from '@/lib/site-settings';
import { getPrimaryAuthor } from '@/lib/authors';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

interface NotionContent {
    posts: any[];
    pages: any[];
    source: string;
    cacheAge?: number;
    revalidateIn?: number;
}

export default function AdminDashboard() {
    const [notionContent, setNotionContent] = useState<NotionContent | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewCounts, setViewCounts] = useState<{ [slug: string]: number }>({});
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            // Get settings
            const siteSettings = getSiteSettings();
            setSettings(siteSettings);

            // Get view counts
            const counts = getViewCounts();
            setViewCounts(counts);

            // Fetch Notion content from server API
            if (siteSettings.notionPageUrl) {
                try {
                    const response = await fetch('/api/notion/content');
                    const data = await response.json();
                    setNotionContent(data);

                    // Convert to posts for display
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
                    }
                } catch (error) {
                    console.error('Error fetching Notion content:', error);
                }
            }

            setIsLoading(false);
        };

        loadData();
    }, []);

    const publishedCount = posts.filter((p) => p.status === 'published').length;
    const draftCount = posts.filter((p) => p.status === 'draft').length;
    const totalViews = Object.values(viewCounts).reduce((sum, count) => sum + count, 0);

    // Get popular posts sorted by views
    const popularPosts = posts
        .map((post) => ({
            ...post,
            views: viewCounts[post.slug] || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Content synced from Notion. View performance at a glance.
                </p>
            </div>

            {/* Notion Sync Status */}
            {settings?.notionPageUrl ? (
                <Card className="border-green-500/50 bg-green-500/5">
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                            <div>
                                <p className="font-medium text-green-700 dark:text-green-400">
                                    Notion Sync Active
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {notionContent?.source === 'cache'
                                        ? `Cached (${notionContent.cacheAge}s ago, refreshes in ${notionContent.revalidateIn}s)`
                                        : notionContent?.source === 'notion'
                                            ? 'Just synced'
                                            : 'Fetching...'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href={settings.notionPageUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Notion
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="py-4">
                        <p className="font-medium text-yellow-700 dark:text-yellow-400">
                            ⚠ Notion not configured
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Set <code className="rounded bg-muted px-1">NOTION_PAGE_URL</code> in Vercel to sync content.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews}</div>
                        <p className="text-xs text-muted-foreground">All-time page views</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedCount}</div>
                        <p className="text-xs text-muted-foreground">From Notion</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{draftCount}</div>
                        <p className="text-xs text-muted-foreground">Not published yet</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pages</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notionContent?.pages?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Static pages</p>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Posts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Popular Posts
                    </CardTitle>
                    <CardDescription>Posts ranked by view count.</CardDescription>
                </CardHeader>
                <CardContent>
                    {popularPosts.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No posts synced from Notion yet.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Configure <code className="rounded bg-muted px-1">NOTION_PAGE_URL</code> to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {popularPosts.map((post, index) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-4"
                                >
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <span className="text-2xl font-bold text-muted-foreground w-8">
                                            #{index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="font-medium text-foreground hover:text-primary line-clamp-1"
                                            >
                                                {post.title || 'Untitled'}
                                            </Link>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'No date'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-lg font-bold">{post.views}</p>
                                            <p className="text-xs text-muted-foreground">views</p>
                                        </div>
                                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                            {post.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="py-4">
                    <p className="font-medium text-blue-700 dark:text-blue-400">
                        📝 Manage Content in Notion
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create, edit, and publish posts directly in your Notion database. Changes appear here automatically within 5 minutes.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
