'use client';

import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    url?: string;
    description?: string;
}

export function ShareButtons({ title, url, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined'
        ? url || window.location.href
        : url || '';

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || '');

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Share:</span>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
            >
                <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Twitter"
                >
                    <Twitter className="h-4 w-4" aria-hidden="true" />
                </a>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
            >
                <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                </a>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyToClipboard}
                aria-label={copied ? 'Link copied' : 'Copy link'}
            >
                {copied ? (
                    <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                ) : (
                    <LinkIcon className="h-4 w-4" aria-hidden="true" />
                )}
            </Button>
        </div>
    );
}
