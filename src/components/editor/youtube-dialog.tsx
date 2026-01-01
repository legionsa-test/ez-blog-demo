'use client';

import { useState } from 'react';
import { Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface YouTubeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (url: string) => void;
}

export function YouTubeDialog({ open, onOpenChange, onInsert }: YouTubeDialogProps) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const validateYouTubeUrl = (url: string): boolean => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        ];
        return patterns.some((pattern) => pattern.test(url));
    };

    const handleInsert = () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        if (!validateYouTubeUrl(url)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        onInsert(url);
        setUrl('');
        setError('');
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setUrl('');
            setError('');
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" aria-hidden="true" />
                        Embed YouTube Video
                    </DialogTitle>
                    <DialogDescription>
                        Paste a YouTube video URL to embed it in your post.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="youtube-url">YouTube URL</Label>
                        <Input
                            id="youtube-url"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setError('');
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleInsert();
                                }
                            }}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Supported formats: youtube.com/watch, youtu.be, youtube.com/shorts
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleInsert}>
                        Embed Video
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
