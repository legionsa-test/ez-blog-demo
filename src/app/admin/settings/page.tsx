'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, Trash2, RefreshCw, Link2, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { exportPosts, importPosts, getPosts, savePost } from '@/lib/storage';
import { getPages, savePage } from '@/lib/pages';
import { getSiteSettings, saveSiteSettings } from '@/lib/site-settings';
import { getPrimaryAuthor, saveAuthor } from '@/lib/authors';
import { Author, SiteSettings } from '@/lib/types';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [author, setAuthor] = useState<Author>({ id: 'primary', name: '', avatar: '', bio: '' });
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({
        title: 'ezBlog',
        icon: '✍️',
        description: '',
        adminPassword: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [isSyncingNotion, setIsSyncingNotion] = useState(false);
    const [notionSyncResult, setNotionSyncResult] = useState<{ count: number; type: string } | null>(null);
    const [serverEnvStatus, setServerEnvStatus] = useState<{
        NOTION_PAGE_URL: boolean;
        ADMIN_PASSWORD: boolean;
        GISCUS_REPO: boolean;
        GISCUS_REPO_ID: boolean;
        GISCUS_CATEGORY: boolean;
        GISCUS_CATEGORY_ID: boolean;
    } | null>(null);

    useEffect(() => {
        const currentAuthor = getPrimaryAuthor();
        setAuthor(currentAuthor);

        const currentSettings = getSiteSettings();
        setSiteSettings(currentSettings);

        // Fetch server-side environment variable status
        fetch('/api/env/status')
            .then(res => res.json())
            .then(data => setServerEnvStatus(data))
            .catch(() => setServerEnvStatus({
                NOTION_PAGE_URL: false,
                ADMIN_PASSWORD: false,
                GISCUS_REPO: false,
                GISCUS_REPO_ID: false,
                GISCUS_CATEGORY: false,
                GISCUS_CATEGORY_ID: false
            }));
    }, []);

    const handleSaveAuthor = () => {
        setIsSaving(true);
        try {
            saveAuthor(author);
            toast.success('Author profile saved!');
        } catch (error) {
            toast.error('Failed to save author profile');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        const data = exportPosts();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ezblog-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Posts exported successfully!');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result as string;
                const count = importPosts(data);
                toast.success(`Imported ${count} posts!`);
            } catch (error) {
                toast.error('Failed to import posts');
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        localStorage.clear();
        setClearDialogOpen(false);
        toast.success('All data cleared. Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleNotionSync = async () => {
        if (!siteSettings.notionPageUrl) {
            toast.error('Please enter a Notion page URL');
            return;
        }

        setIsSyncingNotion(true);
        try {
            const response = await fetch('/api/notion/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageUrl: siteSettings.notionPageUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Sync failed');
            }

            const author = getPrimaryAuthor();
            let importedCount = 0;

            for (const post of data.posts) {
                const existingPosts = getPosts();
                const existing = existingPosts.find(p => p.notionId === post.notionId);

                if (existing) {
                    savePost({
                        ...existing,
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        coverImage: post.coverImage || existing.coverImage,
                        tags: post.tags,
                        status: post.status,
                        publishedAt: post.publishedAt || existing.publishedAt,
                        source: 'notion' as const,
                    });
                } else {
                    savePost({
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        coverImage: post.coverImage || '',
                        tags: post.tags,
                        status: post.status,
                        publishedAt: post.publishedAt,
                        author,
                        notionId: post.notionId,
                        source: 'notion' as const,
                    });
                    importedCount++;
                }
            }

            // Process pages from Notion
            if (data.pages && data.pages.length > 0) {
                for (const page of data.pages) {
                    const existingPages = getPages();
                    const existing = existingPages.find(p => p.notionId === page.notionId);

                    if (existing) {
                        savePage({
                            ...existing,
                            title: page.title,
                            slug: page.slug,
                            content: page.content,
                            status: page.status,
                        });
                    } else {
                        savePage({
                            title: page.title,
                            slug: page.slug,
                            content: page.content,
                            status: page.status,
                            notionId: page.notionId,
                        });
                    }
                }
            }

            const postCount = data.posts?.length || 0;
            const pageCount = data.pages?.length || 0;
            setNotionSyncResult({ count: postCount + pageCount, type: data.type });
            toast.success(`Synced ${postCount} post(s) and ${pageCount} page(s) from Notion!`);
        } catch (error: any) {
            console.error('Notion sync error:', error);
            toast.error(error.message || 'Failed to sync from Notion');
        } finally {
            setIsSyncingNotion(false);
        }
    };

    const handleRemoveNotionPosts = () => {
        const posts = getPosts();
        const localPosts = posts.filter(p => p.source !== 'notion');
        localStorage.setItem('ezblog_posts', JSON.stringify(localPosts));
        toast.success('Removed all Notion posts');
        setNotionSyncResult(null);
    };

    const postsCount = getPosts().length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your blog settings and data.</p>
            </div>

            {/* Environment Variables - Configuration Reference */}
            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Site Configuration</CardTitle>
                    <CardDescription>
                        Site settings are controlled via environment variables for security and consistency across all visitors.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                            How to Configure Your Blog
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                            Add these environment variables in your <strong>Vercel Dashboard → Settings → Environment Variables</strong>, then <strong>Redeploy</strong>:
                        </p>
                    </div>

                    {/* Current Configuration Display */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Current Configuration:</p>
                        <div className="grid gap-2 font-mono text-xs">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <div>
                                    <span className="text-muted-foreground">ADMIN_PASSWORD</span>
                                    <span className="text-red-500 ml-2">*required (server-side)</span>
                                </div>
                                <span className={`font-semibold text-xs ${serverEnvStatus?.ADMIN_PASSWORD ? 'text-green-600' : 'text-amber-500'}`}>
                                    {serverEnvStatus?.ADMIN_PASSWORD ? '✓ Configured (Secure)' : '✗ Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <div>
                                    <span className="text-muted-foreground">NEXT_PUBLIC_SITE_URL</span>
                                    <span className="text-red-500 ml-2">*required for RSS</span>
                                </div>
                                <span className={`font-semibold ${process.env.NEXT_PUBLIC_SITE_URL ? 'text-green-600' : 'text-amber-500'}`}>
                                    {process.env.NEXT_PUBLIC_SITE_URL || '⚠ Not set (using placeholder)'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_SITE_TITLE</span>
                                <span className="text-primary font-semibold">{siteSettings.title}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_SITE_ICON</span>
                                <span className="text-primary font-semibold">{siteSettings.icon}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_THEME</span>
                                <span className="text-primary font-semibold">{siteSettings.theme || 'ezblog1'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_SHOW_RSS</span>
                                <span className="text-primary font-semibold">{siteSettings.showRssFeed ? 'true' : 'false'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_SHOW_FOOTER</span>
                                <span className="text-primary font-semibold">{siteSettings.showFooter ? 'true' : 'false'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_FOOTER_TEXT</span>
                                <span className="text-primary font-semibold truncate max-w-[250px]">{siteSettings.footerText || '(default)'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <span className="text-muted-foreground">NEXT_PUBLIC_WELCOME_TEXT</span>
                                <span className="text-primary font-semibold">{siteSettings.welcomeText || 'Welcome to'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                <div>
                                    <span className="text-muted-foreground">NOTION_PAGE_URL</span>
                                    <span className="text-red-500 ml-2">*server-side</span>
                                </div>
                                <span className={`font-semibold ${serverEnvStatus?.NOTION_PAGE_URL ? 'text-green-600' : 'text-amber-500'}`}>
                                    {serverEnvStatus?.NOTION_PAGE_URL ? '✓ Configured' : '✗ Not set'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-1">Theme Options:</p>
                        <p><code>ezblog1</code> - Modern minimal | <code>atavist</code> - Magazine style | <code>supersimple</code> - Ultra clean</p>
                    </div>
                </CardContent>
            </Card>

            {/* Notion Integration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Notion Integration
                    </CardTitle>
                    <CardDescription>
                        Sync content from a Notion database to your blog.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="notion-url">Notion Page URL</Label>
                        <Input
                            id="notion-url"
                            value={siteSettings.notionPageUrl || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, notionPageUrl: e.target.value })}
                            placeholder="https://hikalvin.notion.site/2db27bd11ca0814eae88d120ff46fbf5?v=2db27bd11ca08102b9f5000cf7f5bf97"
                        />
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <p>
                                <strong>Step 1:</strong> Duplicate our{' '}
                                <a
                                    href="https://hikalvin.notion.site/2db27bd11ca0814eae88d120ff46fbf5?v=2db27bd11ca08102b9f5000cf7f5bf97&pvs=74"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline inline-flex items-center gap-1"
                                >
                                    Notion template <ExternalLink className="h-3 w-3" />
                                </a>{' '}
                                to your Notion workspace
                            </p>
                            <p>
                                <strong>Step 2:</strong> Share your duplicated page <strong>publicly</strong> and copy the URL
                            </p>
                            <p>
                                <strong>Step 3:</strong> Set <code className="bg-muted px-1 rounded">NOTION_PAGE_URL</code> in <strong>Vercel → Settings → Environment Variables</strong>, then <strong>redeploy</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleNotionSync}
                            disabled={isSyncingNotion || !siteSettings.notionPageUrl}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingNotion ? 'animate-spin' : ''}`} />
                            {isSyncingNotion ? 'Syncing...' : 'Sync from Notion'}
                        </Button>
                        {notionSyncResult && (
                            <Button variant="outline" onClick={handleRemoveNotionPosts}>
                                Remove Notion Posts
                            </Button>
                        )}
                    </div>

                    {notionSyncResult && (
                        <p className="text-sm text-muted-foreground">
                            Last sync: {notionSyncResult.count} items ({notionSyncResult.type})
                        </p>
                    )}

                    <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-1">Notion Database Columns:</p>
                        <p><strong>Title</strong> (required), <strong>Slug</strong>, <strong>Status</strong> (Published/Draft), <strong>Type</strong> (Post/Page), <strong>Tags</strong>, <strong>Hero Image</strong>, <strong>Hero Size</strong> (Big/Small), <strong>Date</strong></p>
                    </div>
                </CardContent>
            </Card>

            {/* Giscus Comments Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments (Giscus)
                    </CardTitle>
                    <CardDescription>
                        Enable comments on your blog posts using GitHub Discussions via Giscus.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                            Configuration via Environment Variables
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Giscus is now configured via environment variables for security and consistency.
                            Add these in <strong>Vercel Dashboard → Settings → Environment Variables</strong>:
                        </p>
                    </div>

                    <div className="grid gap-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <div>
                                <span className="text-muted-foreground">GISCUS_REPO</span>
                                <span className="text-red-500 ml-2">*server-side</span>
                            </div>
                            <span className={`font-semibold text-xs ${serverEnvStatus?.GISCUS_REPO ? 'text-green-600' : 'text-amber-500'}`}>
                                {serverEnvStatus?.GISCUS_REPO ? '✓ Configured' : '✗ Not set'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <div>
                                <span className="text-muted-foreground">GISCUS_REPO_ID</span>
                                <span className="text-red-500 ml-2">*server-side</span>
                            </div>
                            <span className={`font-semibold text-xs ${serverEnvStatus?.GISCUS_REPO_ID ? 'text-green-600' : 'text-amber-500'}`}>
                                {serverEnvStatus?.GISCUS_REPO_ID ? '✓ Configured' : '✗ Not set'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <div>
                                <span className="text-muted-foreground">GISCUS_CATEGORY</span>
                                <span className="text-red-500 ml-2">*server-side</span>
                            </div>
                            <span className={`font-semibold text-xs ${serverEnvStatus?.GISCUS_CATEGORY ? 'text-green-600' : 'text-amber-500'}`}>
                                {serverEnvStatus?.GISCUS_CATEGORY ? '✓ Configured' : '✗ Not set'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <div>
                                <span className="text-muted-foreground">GISCUS_CATEGORY_ID</span>
                                <span className="text-red-500 ml-2">*server-side</span>
                            </div>
                            <span className={`font-semibold text-xs ${serverEnvStatus?.GISCUS_CATEGORY_ID ? 'text-green-600' : 'text-amber-500'}`}>
                                {serverEnvStatus?.GISCUS_CATEGORY_ID ? '✓ Configured' : '✗ Not set'}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-1">How to get these values:</p>
                        <p>1. Go to <a href="https://giscus.app" target="_blank" className="underline text-primary">giscus.app</a> configuration page.</p>
                        <p>2. Enter your repository and enable Discussions.</p>
                        <p>3. Copy the <code>data-repo</code>, <code>data-repo-id</code>, <code>data-category</code>, and <code>data-category-id</code> values.</p>
                        <p>4. Add them as environment variables in Vercel and redeploy.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Author Profile Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Author Profile (Default)</CardTitle>
                    <CardDescription>
                        Default author information used when Notion "Created by" is missing. Set via environment variables:
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                            Fallback Configuration
                        </p>
                        <p className="text-sm text-muted-foreground">
                            These values are used as fallbacks. The primary author info is now automatically extracted from the <strong>Created by</strong> column in your Notion database.
                        </p>
                    </div>

                    <div className="grid gap-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <span className="text-muted-foreground">NEXT_PUBLIC_AUTHOR_NAME</span>
                            <span className={`font-semibold ${process.env.NEXT_PUBLIC_AUTHOR_NAME ? 'text-green-600' : 'text-amber-500'}`}>
                                {process.env.NEXT_PUBLIC_AUTHOR_NAME || 'Admin'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <span className="text-muted-foreground">NEXT_PUBLIC_AUTHOR_AVATAR</span>
                            <span className={`font-semibold ${process.env.NEXT_PUBLIC_AUTHOR_AVATAR ? 'text-green-600' : 'text-amber-500'}`}>
                                {process.env.NEXT_PUBLIC_AUTHOR_AVATAR || '/avatar.svg'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                            <span className="text-muted-foreground">NEXT_PUBLIC_AUTHOR_BIO</span>
                            <span className={`font-semibold ${process.env.NEXT_PUBLIC_AUTHOR_BIO ? 'text-green-600' : 'text-amber-500'}`}>
                                {process.env.NEXT_PUBLIC_AUTHOR_BIO || 'Blog administrator'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Export, import, or clear your blog data. You have {postsCount} post(s).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Posts
                        </Button>
                        <Button variant="outline" asChild>
                            <label className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Import Posts
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImport}
                                />
                            </label>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setClearDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Clear Data Dialog */}
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Data?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all posts, settings, and author data.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearData}>
                            Yes, Clear Everything
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
