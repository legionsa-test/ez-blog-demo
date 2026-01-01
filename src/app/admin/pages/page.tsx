'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, FileText, Globe, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { getPages, deletePage } from '@/lib/pages';
import { Page } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PagesAdminPage() {
    const [pages, setPages] = useState<Page[]>([]);

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = () => {
        setPages(getPages());
    };

    const handleDelete = (id: string) => {
        deletePage(id);
        loadPages();
        toast.success('Page deleted');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">
                        Create and manage static pages for your site
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/pages/new">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        New Page
                    </Link>
                </Button>
            </div>

            {/* Pages List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Pages</CardTitle>
                    <CardDescription>
                        {pages.length} {pages.length === 1 ? 'page' : 'pages'} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 opacity-50" aria-hidden="true" />
                            <p className="mt-4">No pages yet</p>
                            <p className="text-sm">Create your first page like About or Contact.</p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/pages/new">
                                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Create Page
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{page.title}</p>
                                                <Badge variant={page.published ? 'default' : 'secondary'}>
                                                    {page.published ? (
                                                        <>
                                                            <Globe className="mr-1 h-3 w-3" aria-hidden="true" />
                                                            Published
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="mr-1 h-3 w-3" aria-hidden="true" />
                                                            Draft
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                /{page.slug} · Updated {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {page.published && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/${page.slug}`} target="_blank">
                                                    View
                                                </Link>
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                            <Link href={`/admin/pages/${page.id}/edit`}>
                                                <Edit2 className="h-4 w-4" aria-hidden="true" />
                                                <span className="sr-only">Edit {page.title}</span>
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    <span className="sr-only">Delete {page.title}</span>
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
                                                        onClick={() => handleDelete(page.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
