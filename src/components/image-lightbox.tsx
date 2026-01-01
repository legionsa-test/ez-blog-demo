'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
    src: string;
    alt: string;
    onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const [scale, setScale] = useState(1);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.25, 3));
            if (e.key === '-') setScale((s) => Math.max(s - 0.25, 0.5));
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = alt || 'image';
        link.click();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
        >
            {/* Toolbar */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        setScale((s) => Math.max(s - 0.25, 0.5));
                    }}
                    aria-label="Zoom out"
                >
                    <ZoomOut className="h-5 w-5" aria-hidden="true" />
                </Button>
                <span className="text-sm text-white">{Math.round(scale * 100)}%</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        setScale((s) => Math.min(s + 0.25, 3));
                    }}
                    aria-label="Zoom in"
                >
                    <ZoomIn className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                    }}
                    aria-label="Download image"
                >
                    <Download className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={onClose}
                    aria-label="Close lightbox"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </Button>
            </div>

            {/* Image */}
            <img
                src={src}
                alt={alt}
                className={cn(
                    'max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200',
                    'cursor-zoom-out'
                )}
                style={{ transform: `scale(${scale})` }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            {alt && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-sm text-white">
                    {alt}
                </div>
            )}
        </div>
    );
}

// Hook to enable lightbox on prose images
export function useLightbox() {
    const [lightboxImage, setLightboxImage] = useState<{
        src: string;
        alt: string;
    } | null>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG' && target.closest('.prose')) {
                const img = target as HTMLImageElement;
                setLightboxImage({ src: img.src, alt: img.alt });
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return {
        lightboxImage,
        closeLightbox: () => setLightboxImage(null),
    };
}
