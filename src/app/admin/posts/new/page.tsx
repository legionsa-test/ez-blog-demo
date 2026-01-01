'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CloudOff, Cloud, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { savePost } from '@/lib/storage';
import { getCategories, Category } from '@/lib/categories';
import { toast } from 'sonner';

const AUTOSAVE_KEY = 'ezblog_autosave_new';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

interface AutosaveData {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    tags: string;
    categoryId: string;
    scheduledAt: string;
    isPublished: boolean;
    savedAt: string;
}

export default function NewPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load categories
    useEffect(() => {
        setCategories(getCategories());
    }, []);

    // Load autosaved data on mount
    useEffect(() => {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
            try {
                const data: AutosaveData = JSON.parse(saved);
                setTitle(data.title || '');
                setExcerpt(data.excerpt || '');
                setContent(data.content || '');
                setCoverImage(data.coverImage || '');
                setTags(data.tags || '');
                setCategoryId(data.categoryId || '');
                setScheduledAt(data.scheduledAt || '');
                setIsPublished(data.isPublished || false);
                setLastSaved(new Date(data.savedAt));
                toast.info('Restored autosaved draft');
            } catch (e) {
                console.error('Failed to restore autosave:', e);
            }
        }
    }, []);

    // Autosave function
    const autoSave = useCallback(() => {
        if (!title.trim() && !content.trim()) return;

        const data: AutosaveData = {
            title,
            excerpt,
            content,
            coverImage,
            tags,
            categoryId,
            scheduledAt,
            isPublished,
            savedAt: new Date().toISOString(),
        };

        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
    }, [title, excerpt, content, coverImage, tags, categoryId, scheduledAt, isPublished]);

    // Autosave interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasUnsavedChanges) {
                autoSave();
            }
        }, AUTOSAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [hasUnsavedChanges, autoSave]);

    // Track unsaved changes
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [title, excerpt, content, coverImage, tags, isPublished]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && (title.trim() || content.trim())) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, title, content]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setIsSaving(true);

        try {
            // Determine status based on scheduling
            let status: 'draft' | 'published' | 'scheduled' = 'draft';
            if (scheduledAt && new Date(scheduledAt) > new Date()) {
                status = 'scheduled';
            } else if (isPublished) {
                status = 'published';
            }

            const post = savePost({
                title: title.trim(),
                excerpt: excerpt.trim(),
                content,
                coverImage: coverImage.trim(),
                tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                categoryId: categoryId || null,
                scheduledAt: scheduledAt || null,
                status,
            });

            // Clear autosave after successful save
            localStorage.removeItem(AUTOSAVE_KEY);
            setHasUnsavedChanges(false);

            const successMsg = status === 'scheduled'
                ? 'Post scheduled!'
                : status === 'published'
                    ? 'Post published!'
                    : 'Draft saved!';
            toast.success(successMsg);
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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {hasUnsavedChanges ? (
                                <>
                                    <CloudOff className="h-3 w-3" aria-hidden="true" />
                                    <span>Unsaved changes</span>
                                </>
                            ) : lastSaved ? (
                                <>
                                    <Cloud className="h-3 w-3" aria-hidden="true" />
                                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                                </>
                            ) : (
                                <span>Create a new blog post.</span>
                            )}
                        </div>
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
                    <Button variant="outline" onClick={autoSave} disabled={!hasUnsavedChanges}>
                        <Cloud className="mr-2 h-4 w-4" aria-hidden="true" />
                        Save Draft
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={categoryId || 'none'}
                                onValueChange={(val) => setCategoryId(val === 'none' ? '' : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Category</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Schedule</CardTitle>
                            <CardDescription>
                                Set a future date to automatically publish
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            {scheduledAt && (
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Will publish on {new Date(scheduledAt).toLocaleString()}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setScheduledAt('')}
                                        className="h-6 px-2 text-xs"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
