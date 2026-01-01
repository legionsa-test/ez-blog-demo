'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Trash2, Check, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMediaItems, deleteMediaItem, MediaItem } from '@/lib/media';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MediaLibraryProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: MediaItem) => void;
}

export function MediaLibrary({ open, onOpenChange, onSelect }: MediaLibraryProps) {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadItems();
        }
    }, [open]);

    const loadItems = () => {
        setItems(getMediaItems());
    };

    const filteredItems = searchQuery
        ? items.filter(
            (item) =>
                item.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.url.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : items;

    const handleDelete = (id: string) => {
        deleteMediaItem(id);
        loadItems();
        setDeleteConfirm(null);
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const handleSelect = () => {
        const item = items.find((i) => i.id === selectedId);
        if (item) {
            onSelect(item);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" aria-hidden="true" />
                        Media Library
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search media..."
                        className="pl-9"
                    />
                </div>

                {/* Media Grid */}
                <ScrollArea className="h-[400px]">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                            <p className="mt-4 text-muted-foreground">
                                {searchQuery ? 'No media found' : 'No media yet. Images you use will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 p-1 sm:grid-cols-4">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                                        selectedId === item.id
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-transparent hover:border-muted-foreground/20'
                                    )}
                                    onClick={() => setSelectedId(item.id)}
                                >
                                    <Image
                                        src={item.url}
                                        alt={item.alt || 'Media item'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 33vw, 25vw"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                    {/* Selected checkmark */}
                                    {selectedId === item.id && (
                                        <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                                            <Check className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    {deleteConfirm === item.id ? (
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                            >
                                                <Check className="h-3 w-3" aria-hidden="true" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(null);
                                                }}
                                            >
                                                <X className="h-3 w-3" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute bottom-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm(item.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                                        </Button>
                                    )}

                                    {/* Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="truncate text-xs text-white">{item.alt || 'No alt text'}</p>
                                        <p className="text-xs text-white/70">
                                            {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        {filteredItems.length} item{filteredItems.length !== 1 && 's'}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSelect} disabled={!selectedId}>
                            Insert Selected
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
