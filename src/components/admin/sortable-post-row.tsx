'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Pencil, Trash2, Eye, MoreHorizontal, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

interface SortablePostRowProps {
    post: Post;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onDelete: (post: Post) => void;
}

export function SortablePostRow({
    post,
    isSelected,
    onToggleSelect,
    onDelete,
}: SortablePostRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: post.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 py-4 first:pt-0 last:pb-0 transition-colors ${isSelected ? 'bg-muted/50 -mx-4 px-4 rounded' : ''
                } ${isDragging ? 'bg-muted shadow-lg rounded' : ''}`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* Checkbox */}
            <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(post.id)}
                aria-label={`Select ${post.title}`}
            />

            {/* Post Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-medium text-foreground hover:text-primary line-clamp-1"
                    >
                        {post.title || 'Untitled'}
                    </Link>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                    </Badge>
                    {post.source === 'notion' && (
                        <Badge variant="outline" className="text-xs">
                            Notion
                        </Badge>
                    )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Updated {format(new Date(post.updatedAt), 'MMM d, yyyy')}</span>
                    <span>{post.readingTime} min read</span>
                    {post.tags.length > 0 && (
                        <span>{post.tags.slice(0, 2).join(', ')}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Post actions">
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/posts/${post.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    {post.status === 'published' && (
                        <DropdownMenuItem asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                View
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(post)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
