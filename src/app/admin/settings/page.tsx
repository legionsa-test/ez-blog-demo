'use client';

import { useEffect, useState } from 'react';
import { Save, Download, Upload, Trash2, Eye, EyeOff, RefreshCw, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { EmojiPicker } from '@/components/emoji-picker';
import { exportPosts, importPosts, getPosts, savePost, saveAuthor as saveAuthorToStorage } from '@/lib/storage';
import { getSiteSettings, saveSiteSettings } from '@/lib/site-settings';
import { getPrimaryAuthor, saveAuthor } from '@/lib/authors';
import { Author, SiteSettings } from '@/lib/types';
import { THEMES } from '@/lib/themes';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [author, setAuthor] = useState<Author>({ id: 'primary', name: '', avatar: '', bio: '' });
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({
        title: 'ezBlog',
        icon: '✍️',
        description: '',
        unsplashApiKey: '',
        adminPassword: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingSite, setIsSavingSite] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSyncingNotion, setIsSyncingNotion] = useState(false);
    const [notionSyncResult, setNotionSyncResult] = useState<{ count: number; type: string } | null>(null);

    useEffect(() => {
        const currentAuthor = getPrimaryAuthor();
        setAuthor(currentAuthor);

        const currentSettings = getSiteSettings();
        setSiteSettings(currentSettings);
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

    const handleSaveSiteSettings = () => {
        setIsSavingSite(true);
        try {
            saveSiteSettings(siteSettings);
            toast.success('Site settings saved!');
            // Trigger a page reload to update header
            window.dispatchEvent(new Event('site-settings-updated'));
        } catch (error) {
            toast.error('Failed to save site settings');
            console.error(error);
        } finally {
            setIsSavingSite(false);
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
            const content = event.target?.result as string;
            if (importPosts(content)) {
                toast.success('Posts imported successfully!');
                e.target.value = '';
            } else {
                toast.error('Failed to import posts. Invalid file format.');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        localStorage.clear();
        toast.success('All data cleared!');
        setClearDialogOpen(false);
        window.location.reload();
    };

    const handleNotionSync = async () => {
        if (!siteSettings.notionPageUrl) {
            toast.error('Please enter a Notion page URL first');
            return;
        }

        setIsSyncingNotion(true);
        setNotionSyncResult(null);

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
                // Check if post already exists (by notionId)
                const existingPosts = getPosts();
                const existing = existingPosts.find(p => p.notionId === post.notionId);

                if (existing) {
                    // Update existing post
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
                    // Create new post
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

            setNotionSyncResult({ count: data.posts.length, type: data.type });
            toast.success(`Synced ${data.posts.length} post(s) from Notion!`);
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

            {/* Site Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Site Settings</CardTitle>
                    <CardDescription>
                        Customize your blog&apos;s appearance and branding.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-6">
                        <div className="space-y-2">
                            <Label>Site Icon</Label>
                            <EmojiPicker
                                value={siteSettings.icon}
                                onChange={(icon) => setSiteSettings({ ...siteSettings, icon })}
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="site-title">Site Title</Label>
                                <Input
                                    id="site-title"
                                    value={siteSettings.title}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, title: e.target.value })}
                                    placeholder="My Blog"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="site-description">Site Description</Label>
                                <Textarea
                                    id="site-description"
                                    value={siteSettings.description}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, description: e.target.value })}
                                    placeholder="A brief description of your blog"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unsplash-key">Unsplash API Key</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="unsplash-key"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={siteSettings.unsplashApiKey}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, unsplashApiKey: e.target.value })}
                                    placeholder="Enter your Unsplash API key"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowApiKey(!showApiKey)}
                                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                            >
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Get your API key from{' '}
                            <a
                                href="https://unsplash.com/developers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                unsplash.com/developers
                            </a>
                            . This enables cover image search.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="welcomeText">Welcome Text (Supersimple Theme)</Label>
                        <Input
                            id="welcomeText"
                            value={siteSettings.welcomeText || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, welcomeText: e.target.value })}
                            placeholder="Welcome to"
                        />
                        <p className="text-xs text-muted-foreground">
                            The headline text shown on the Supersimple theme homepage.
                        </p>
                    </div>
                    <Button onClick={handleSaveSiteSettings} disabled={isSavingSite}>
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                        {isSavingSite ? 'Saving...' : 'Save Site Settings'}
                    </Button>
                </CardContent>
            </Card>

            {/* Theme Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>
                        Choose how your homepage looks to visitors.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    setSiteSettings({ ...siteSettings, theme: theme.id });
                                    const updated = saveSiteSettings({ theme: theme.id });
                                    toast.success(`Theme changed to "${theme.name}"`);
                                }}
                                className={`relative rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 ${siteSettings.theme === theme.id || (!siteSettings.theme && theme.id === 'ezblog1')
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{theme.name}</h3>
                                    {(siteSettings.theme === theme.id || (!siteSettings.theme && theme.id === 'ezblog1')) && (
                                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {theme.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* RSS Feed Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>RSS Feed</CardTitle>
                    <CardDescription>
                        Configure your blog&apos;s RSS feed visibility.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-rss">Show RSS Feed Link</Label>
                            <div className="text-[0.8rem] text-muted-foreground">
                                Display RSS feed link in the navigation menu
                            </div>
                        </div>
                        <Switch
                            id="show-rss"
                            checked={siteSettings.showRssFeed === true}
                            onCheckedChange={(checked) => {
                                setSiteSettings({ ...siteSettings, showRssFeed: checked });
                                saveSiteSettings({ showRssFeed: checked });
                                toast.success(checked ? 'RSS feed link enabled' : 'RSS feed link hidden');
                            }}
                        />
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
                        Import posts from a public Notion database. Similar to Nobelium.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enable-notion">Enable Notion Sync</Label>
                        <Switch
                            id="enable-notion"
                            checked={siteSettings.enableNotionSync === true}
                            onCheckedChange={(checked) => {
                                setSiteSettings({ ...siteSettings, enableNotionSync: checked });
                                saveSiteSettings({ enableNotionSync: checked });
                                if (!checked) {
                                    handleRemoveNotionPosts();
                                }
                            }}
                        />
                    </div>
                    {siteSettings.enableNotionSync && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="notion-url">Notion Page URL</Label>
                                <Input
                                    id="notion-url"
                                    value={siteSettings.notionPageUrl || ''}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, notionPageUrl: e.target.value })}
                                    placeholder="https://www.notion.so/your-page-id"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Paste the URL of your public Notion page or database.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleNotionSync}
                                    disabled={isSyncingNotion || !siteSettings.notionPageUrl}
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingNotion ? 'animate-spin' : ''}`} />
                                    {isSyncingNotion ? 'Syncing...' : 'Sync Now'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        saveSiteSettings({ notionPageUrl: siteSettings.notionPageUrl });
                                        toast.success('Notion URL saved!');
                                    }}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save URL
                                </Button>
                            </div>
                            {notionSyncResult && (
                                <p className="text-sm text-muted-foreground">
                                    Last sync: {notionSyncResult.count} post(s) from {notionSyncResult.type}
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Footer Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Footer Settings</CardTitle>
                    <CardDescription>
                        Customize your site footer content and visibility.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-footer">Show Footer</Label>
                        <Switch
                            id="show-footer"
                            checked={siteSettings.showFooter !== false}
                            onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, showFooter: checked })}
                        />
                    </div>
                    {siteSettings.showFooter !== false && (
                        <div className="space-y-2">
                            <Label htmlFor="footer-text">Footer Text</Label>
                            <Input
                                id="footer-text"
                                value={siteSettings.footerText || ''}
                                onChange={(e) => setSiteSettings({ ...siteSettings, footerText: e.target.value })}
                                placeholder="© {year} ezBlog. Built with Next.js."
                            />
                            <p className="text-xs text-muted-foreground">
                                Use {'{year}'} to insert the current year.
                            </p>
                        </div>
                    )}
                    <Button onClick={handleSaveSiteSettings} disabled={isSavingSite}>
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                        {isSavingSite ? 'Saving...' : 'Save Footer Settings'}
                    </Button>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                        Manage your admin password and authentication settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? (
                        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                            <p className="font-medium text-green-700 dark:text-green-400">
                                ✓ Password secured via environment variable
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your admin password is set in your deployment environment (Vercel/Netlify).
                                To change it, update the <code className="rounded bg-muted px-1">NEXT_PUBLIC_ADMIN_PASSWORD</code> environment variable.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                                    ⚠ Local password mode
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Password is stored in this browser only. For production deployments, set
                                    the <code className="rounded bg-muted px-1">NEXT_PUBLIC_ADMIN_PASSWORD</code> environment variable.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            {siteSettings.adminPassword && (
                                <p className="text-xs text-muted-foreground">
                                    A custom password is currently set.
                                </p>
                            )}
                            {!siteSettings.adminPassword && (
                                <p className="text-xs text-muted-foreground">
                                    Using default password. Set a custom password for better security.
                                </p>
                            )}
                            <Button
                                onClick={() => {
                                    if (!newPassword) {
                                        toast.error('Please enter a new password');
                                        return;
                                    }
                                    if (newPassword !== confirmPassword) {
                                        toast.error('Passwords do not match');
                                        return;
                                    }
                                    if (newPassword.length < 6) {
                                        toast.error('Password must be at least 6 characters');
                                        return;
                                    }
                                    setIsSavingPassword(true);
                                    try {
                                        saveSiteSettings({ adminPassword: newPassword });
                                        setSiteSettings({ ...siteSettings, adminPassword: newPassword });
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        toast.success('Password updated! You may need to log in again.');
                                    } catch (error) {
                                        toast.error('Failed to update password');
                                        console.error(error);
                                    } finally {
                                        setIsSavingPassword(false);
                                    }
                                }}
                                disabled={isSavingPassword || !newPassword}
                            >
                                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                                {isSavingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Author Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Author Profile</CardTitle>
                    <CardDescription>
                        This information will be displayed on your blog posts.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="author-name">Name</Label>
                        <Input
                            id="author-name"
                            value={author.name}
                            onChange={(e) => setAuthor({ ...author, name: e.target.value })}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="author-avatar">Avatar URL</Label>
                        <Input
                            id="author-avatar"
                            value={author.avatar}
                            onChange={(e) => setAuthor({ ...author, avatar: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="author-bio">Bio</Label>
                        <Textarea
                            id="author-bio"
                            value={author.bio}
                            onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
                            placeholder="A short bio about yourself"
                            rows={3}
                        />
                    </div>
                    <Button onClick={handleSaveAuthor} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                        {isSaving ? 'Saving...' : 'Save Author Profile'}
                    </Button>
                </CardContent>
            </Card >

            {/* Data Management */}
            < Card >
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Export, import, or clear your blog data. You have {postsCount} post{postsCount !== 1 ? 's' : ''}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                            Export Posts
                        </Button>
                        <div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                                id="import-file"
                            />
                            <Button variant="outline" asChild>
                                <label htmlFor="import-file" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Import Posts
                                </label>
                            </Button>
                        </div>
                        <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Clear All Data
                        </Button>
                    </div>
                </CardContent>
            </Card >

            {/* Clear Data Dialog */}
            < Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Data</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to clear all data? This will delete all posts, pages, and settings.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearData}>
                            Clear All Data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
}
