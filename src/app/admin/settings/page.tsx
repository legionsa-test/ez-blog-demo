'use client';

import { useEffect, useState } from 'react';
import { Save, Download, Upload, Trash2 } from 'lucide-react';
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
import { getAuthor, saveAuthor, exportPosts, importPosts, getPosts } from '@/lib/storage';
import { Author } from '@/lib/types';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [author, setAuthor] = useState<Author>({ name: '', avatar: '', bio: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    useEffect(() => {
        const currentAuthor = getAuthor();
        setAuthor(currentAuthor);
    }, []);

    const handleSaveAuthor = () => {
        setIsSaving(true);
        try {
            saveAuthor(author);
            toast.success('Settings saved!');
        } catch (error) {
            toast.error('Failed to save settings');
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
            const content = event.target?.result as string;
            if (importPosts(content)) {
                toast.success('Posts imported successfully!');
                // Reset the input
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
        // Reload the page to reset state
        window.location.reload();
    };

    const postsCount = getPosts().length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your blog settings and data.</p>
            </div>

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
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
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
            </Card>

            {/* Environment Variables Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Environment Variables</CardTitle>
                    <CardDescription>
                        Configure these environment variables for full functionality.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4">
                            <h4 className="font-mono text-sm font-semibold">NEXT_PUBLIC_ADMIN_PASSWORD</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Set the admin login password. Default: admin123
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                            <h4 className="font-mono text-sm font-semibold">NEXT_PUBLIC_UNSPLASH_ACCESS_KEY</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your Unsplash API access key for image search.
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                            <h4 className="font-mono text-sm font-semibold">NEXT_PUBLIC_SITE_URL</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your site&apos;s public URL for sitemap generation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clear Data Dialog */}
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Data</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to clear all data? This will delete all posts and settings.
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
            </Dialog>
        </div>
    );
}
