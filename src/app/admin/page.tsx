'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, Clock, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPosts } from '@/lib/storage';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const allPosts = getPosts();
        setPosts(allPosts);
        setIsLoading(false);
    }, []);

    const publishedCount = posts.filter((p) => p.status === 'published').length;
    const draftCount = posts.filter((p) => p.status === 'draft').length;
    const totalReadingTime = posts.reduce((acc, p) => acc + p.readingTime, 0);

    const recentPosts = posts.slice(0, 5);

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here&apos;s your content overview.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/posts/new">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{posts.length}</div>
                        <p className="text-xs text-muted-foreground">Across all statuses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedCount}</div>
                        <p className="text-xs text-muted-foreground">Visible to readers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{draftCount}</div>
                        <p className="text-xs text-muted-foreground">Work in progress</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Read Time</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReadingTime} min</div>
                        <p className="text-xs text-muted-foreground">Combined content</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Posts */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
                    <CardDescription>Your latest content at a glance.</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentPosts.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No posts yet.</p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/posts/new">Create your first post</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/admin/posts/${post.id}/edit`}
                                            className="font-medium text-foreground hover:text-primary line-clamp-1"
                                        >
                                            {post.title || 'Untitled'}
                                        </Link>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {format(new Date(post.updatedAt), 'MMM d, yyyy')} · {post.readingTime} min read
                                        </p>
                                    </div>
                                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                        {post.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
