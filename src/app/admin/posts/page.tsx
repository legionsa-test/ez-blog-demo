'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPosts, deletePost } from '@/lib/storage';
import { Post } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const loadPosts = () => {
        const allPosts = getPosts();
        setPosts(allPosts);
        setIsLoading(false);
    };

    const handleDelete = () => {
        if (postToDelete) {
            deletePost(postToDelete.id);
            toast.success('Post deleted successfully');
            loadPosts();
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    const confirmDelete = (post: Post) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

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
                    <p className="text-muted-foreground">Manage your blog content.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/posts/new">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <TabsList>
                    <TabsTrigger value="all">
                        All ({posts.length})
                    </TabsTrigger>
                    <TabsTrigger value="published">
                        Published ({posts.filter((p) => p.status === 'published').length})
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                        Drafts ({posts.filter((p) => p.status === 'draft').length})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Posts List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>
                        {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredPosts.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                                {statusFilter === 'all' ? 'No posts yet.' : `No ${statusFilter} posts.`}
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/posts/new">Create a post</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/admin/posts/${post.id}/edit`}
                                                className="font-medium text-foreground hover:text-primary line-clamp-1"
                                            >
                                                {post.title || 'Untitled'}
                                            </Link>
                                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                {post.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>Updated {format(new Date(post.updatedAt), 'MMM d, yyyy')}</span>
                                            <span>{post.readingTime} min read</span>
                                            {post.tags.length > 0 && (
                                                <span>{post.tags.slice(0, 2).join(', ')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" aria-label="Post actions">
                                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/posts/${post.id}/edit`}>
                                                    <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            {post.status === 'published' && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/blog/${post.slug}`} target="_blank">
                                                        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => confirmDelete(post)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{postToDelete?.title || 'Untitled'}&quot;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
