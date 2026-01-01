'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Globe, EyeOff, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { getPageById, savePage, deletePage, isSlugAvailable } from '@/lib/pages';
import { Page } from '@/lib/types';
import { toast } from 'sonner';

export default function EditPagePage() {
    const router = useRouter();
    const params = useParams();
    const pageId = params.id as string;

    const [page, setPage] = useState<Page | null>(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const foundPage = getPageById(pageId);
        if (foundPage) {
            setPage(foundPage);
            setTitle(foundPage.title);
            setSlug(foundPage.slug);
            setContent(foundPage.content);
            setIsPublished(foundPage.published);
        }
        setIsLoading(false);
    }, [pageId]);

    const generateSlug = (value: string) => {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        const pageSlug = slug.trim() || generateSlug(title);

        if (!isSlugAvailable(pageSlug, pageId)) {
            toast.error('This slug is already in use or reserved');
            return;
        }

        setIsSaving(true);

        try {
            savePage({
                id: pageId,
                title: title.trim(),
                slug: pageSlug,
                content,
                published: isPublished,
            });

            toast.success('Page saved!');
            // Trigger header update
            window.dispatchEvent(new Event('site-settings-updated'));
        } catch (error) {
            toast.error('Failed to save page');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        deletePage(pageId);
        toast.success('Page deleted');
        router.push('/admin/pages');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Page Not Found</h1>
                <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/admin/pages">Back to Pages</Link>
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
                        <Link href="/admin/pages">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Back to pages</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Page</h1>
                        <p className="text-sm text-muted-foreground">
                            Editing: {page.title}
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
                            onChange={(e) => setTitle(e.target.value)}
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
                                {isPublished && (
                                    <p className="text-xs text-muted-foreground">
                                        <Link href={`/${slug}`} target="_blank" className="text-primary underline">
                                            View page →
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Delete Page
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete &quot;{page.title}&quot;? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
