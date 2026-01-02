'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Globe, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSiteSettings } from '@/lib/site-settings';
import { format } from 'date-fns';

interface NotionPage {
    notionId: string;
    title: string;
    slug: string;
    content: string;
    status: string;
}

export default function PagesAdminPage() {
    const [pages, setPages] = useState<NotionPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notionUrl, setNotionUrl] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        setIsLoading(true);

        const settings = getSiteSettings();
        setNotionUrl(settings.notionPageUrl || null);

        if (settings.notionPageUrl) {
            try {
                const response = await fetch('/api/notion/content');
                const data = await response.json();

                if (data.pages) {
                    setPages(data.pages);
                    setLastSync(data.source === 'cache'
                        ? `Cached ${data.cacheAge}s ago`
                        : 'Just synced');
                }
            } catch (error) {
                console.error('Error fetching pages:', error);
            }
        }

        setIsLoading(false);
    };

    const publishedCount = pages.filter((p) => p.status === 'published').length;

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
                    <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">
                        Static pages synced from Notion • {lastSync}
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
                        📄 <strong>Read-only view</strong> — Create pages in Notion with <code className="rounded bg-muted px-1">Type: Page</code>.
                        They appear at <code className="rounded bg-muted px-1">/slug</code>.
                    </p>
                </CardContent>
            </Card>

            {/* Pages List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">All Pages</CardTitle>
                        <CardDescription>
                            {pages.length} page{pages.length !== 1 ? 's' : ''} from Notion
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadPages}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {!notionUrl ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 opacity-50" />
                            <p className="mt-4">Notion not configured</p>
                            <p className="text-sm">
                                Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_NOTION_PAGE_URL</code> in Vercel.
                            </p>
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 opacity-50" />
                            <p className="mt-4">No pages found</p>
                            <p className="text-sm">
                                Create a page in Notion with <code className="rounded bg-muted px-1">Type: Page</code>.
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                                <a href={notionUrl} target="_blank" rel="noopener noreferrer">
                                    Add pages in Notion
                                </a>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pages.map((page) => (
                                <div
                                    key={page.notionId}
                                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 group transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{page.title}</p>
                                                <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                                                    {page.status === 'published' ? (
                                                        <>
                                                            <Globe className="mr-1 h-3 w-3" />
                                                            Published
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="mr-1 h-3 w-3" />
                                                            Draft
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                /{page.slug}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/${page.slug}`}>
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
