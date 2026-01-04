'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, Trash2, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { getPostById, savePost, deletePost } from '@/lib/storage';
import { Post } from '@/lib/types';
import { toast } from 'sonner';

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [coverImageSize, setCoverImageSize] = useState<'small' | 'big' | 'hidden'>('small');
    const [coverImageAlt, setCoverImageAlt] = useState('');

    useEffect(() => {
        const foundPost = getPostById(postId);
        if (foundPost) {
            setPost(foundPost);
            setTitle(foundPost.title);
            setExcerpt(foundPost.excerpt);
            setContent(foundPost.content);
            setCoverImage(foundPost.coverImage);
            setCoverImageAlt(foundPost.coverImageAlt || '');
            setCoverImageSize(foundPost.coverImageSize || 'small');
            setTags(foundPost.tags.join(', '));
            setIsPublished(foundPost.status === 'published');
        }
        setIsLoading(false);
    }, [postId]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setIsSaving(true);

        try {
            savePost({
                id: postId,
                slug: post?.slug,
                title: title.trim(),
                excerpt: excerpt.trim(),
                content,
                coverImage: coverImage.trim(),
                coverImageSize,
                coverImageAlt: coverImageAlt.trim(),
                tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                status: isPublished ? 'published' : 'draft',
            });

            toast.success(isPublished ? 'Post updated!' : 'Draft saved!');
        } catch (error) {
            toast.error('Failed to save post');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        deletePost(postId);
        toast.success('Post deleted');
        router.push('/admin/posts');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="py-20 text-center">
                <h1 className="text-2xl font-bold">Post Not Found</h1>
                <p className="mt-2 text-muted-foreground">The post you&apos;re looking for doesn&apos;t exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/admin/posts">Back to Posts</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/posts">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Back to posts</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
                        <p className="text-muted-foreground">Make changes to your post.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="publish-toggle" className="text-sm">
                            {isPublished ? 'Published' : 'Draft'}
                        </Label>
                        <Switch
                            id="publish-toggle"
                            checked={isPublished}
                            onCheckedChange={setIsPublished}
                        />
                    </div>
                    {isPublished && (
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">View post</span>
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Delete post</span>
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter post title..."
                            className="text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief description of the post..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <TiptapEditor content={content} onChange={setContent} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Input
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="cover-alt" className="text-xs text-muted-foreground">Alt Text</Label>
                                    <Input
                                        id="cover-alt"
                                        value={coverImageAlt}
                                        onChange={(e) => setCoverImageAlt(e.target.value)}
                                        placeholder="Describe the image for accessibility"
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Image Preview */}
                            {coverImage && (
                                <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                                    <img
                                        src={coverImage}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCoverImage('');
                                            setCoverImageAlt('');
                                        }}
                                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                        aria-label="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Display Options */}
                            {coverImage && (
                                <div className="space-y-2">
                                    <Label>Homepage Display</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCoverImageSize('big')}
                                            className={`rounded-md border px-2 py-2 text-xs transition-colors ${coverImageSize === 'big'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:bg-muted'
                                                }`}
                                        >
                                            Big
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCoverImageSize('small')}
                                            className={`rounded-md border px-2 py-2 text-xs transition-colors ${coverImageSize === 'small'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:bg-muted'
                                                }`}
                                        >
                                            Small
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCoverImageSize('hidden')}
                                            className={`rounded-md border px-2 py-2 text-xs transition-colors ${coverImageSize === 'hidden'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:bg-muted'
                                                }`}
                                        >
                                            Hide
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Controls how the image appears on the homepage
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="tag1, tag2, tag3"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Separate tags with commas
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
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
