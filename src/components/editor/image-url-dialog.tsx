'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type ImageSize = 'default' | 'container' | 'full';

interface ImageUrlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (url: string, alt: string, size: ImageSize) => void;
}

export function ImageUrlDialog({ open, onOpenChange, onInsert }: ImageUrlDialogProps) {
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const [size, setSize] = useState<ImageSize>('default');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('Please enter an image URL');
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        onInsert(url.trim(), alt.trim(), size);
        setUrl('');
        setAlt('');
        setSize('default');
    };

    const handleClose = () => {
        setUrl('');
        setAlt('');
        setSize('default');
        setError('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insert Image from URL</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                type="url"
                                autoFocus
                            />
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-alt">Alt Text</Label>
                            <Input
                                id="image-alt"
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                placeholder="Describe the image for accessibility"
                            />
                            <p className="text-xs text-muted-foreground">
                                Describe the image for screen readers and SEO
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Display Size</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSize('default')}
                                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${size === 'default'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:bg-muted'
                                        }`}
                                >
                                    Default
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSize('container')}
                                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${size === 'container'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:bg-muted'
                                        }`}
                                >
                                    Container
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSize('full')}
                                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${size === 'full'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:bg-muted'
                                        }`}
                                >
                                    Full Width
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Full width extends beyond the text container
                            </p>
                        </div>
                        {url && (
                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                                    <img
                                        src={url}
                                        alt={alt || 'Preview'}
                                        className="h-full w-full object-contain"
                                        onError={() => setError('Failed to load image')}
                                        onLoad={() => setError('')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Insert Image</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

