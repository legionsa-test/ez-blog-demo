'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Globe, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { savePage, isSlugAvailable } from '@/lib/pages';
import { toast } from 'sonner';

export default function NewPagePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const generateSlug = (value: string) => {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (value: string) => {
        setTitle(value);
        // Auto-generate slug if not manually edited
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(value));
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        const pageSlug = slug.trim() || generateSlug(title);

        if (!isSlugAvailable(pageSlug)) {
            toast.error('This slug is already in use or reserved');
            return;
        }

        setIsSaving(true);

        try {
            const page = savePage({
                title: title.trim(),
                slug: pageSlug,
                content,
                published: isPublished,
            });

            toast.success(isPublished ? 'Page published!' : 'Page saved as draft!');
            router.push(`/admin/pages/${page.id}/edit`);
        } catch (error) {
            toast.error('Failed to save page');
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
                        <Link href="/admin/pages">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Back to pages</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Page</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new static page for your site.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="publish-toggle" className="text-sm flex items-center gap-1">
                            {isPublished ? (
                                <>
                                    <Globe className="h-3 w-3" aria-hidden="true" />
                                    Published
                                </>
                            ) : (
                                <>
                                    <EyeOff className="h-3 w-3" aria-hidden="true" />
                                    Draft
                                </>
                            )}
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
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Page title"
                            className="text-lg"
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
                            <CardTitle className="text-base">Page Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground">/</span>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(generateSlug(e.target.value))}
                                        placeholder="page-slug"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This will be the URL path for your page
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
