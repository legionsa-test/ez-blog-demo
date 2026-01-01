'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { savePost } from '@/lib/storage';
import { toast } from 'sonner';

export default function NewPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setIsSaving(true);

        try {
            const post = savePost({
                title: title.trim(),
                excerpt: excerpt.trim(),
                content,
                coverImage: coverImage.trim(),
                tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                status: isPublished ? 'published' : 'draft',
            });

            toast.success(isPublished ? 'Post published!' : 'Draft saved!');
            router.push(`/admin/posts/${post.id}/edit`);
        } catch (error) {
            toast.error('Failed to save post');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

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
                        <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
                        <p className="text-muted-foreground">Create a new blog post.</p>
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
                            <Input
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            {coverImage && (
                                <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                                    <img
                                        src={coverImage}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover"
                                    />
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
        </div>
    );
}
