'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { EditorToolbar } from './toolbar';
import { useState } from 'react';
import { UnsplashPicker } from './unsplash-picker';
import { ImageUrlDialog } from './image-url-dialog';
import { YouTubeDialog } from './youtube-dialog';
import { trackMediaUsage } from '@/lib/media';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showImageUrl, setShowImageUrl] = useState(false);
    const [showYouTube, setShowYouTube] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                codeBlock: false, // Disable default, use CodeBlockLowlight
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full cursor-pointer',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder: 'Start writing your amazing content...',
            }),
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: 'rounded-lg overflow-hidden',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2 bg-muted font-semibold',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto',
                },
            }),
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    'prose prose-lg dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const handleInsertImage = (url: string, alt?: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
            trackMediaUsage(url, alt);
        }
    };

    const handleInsertYouTube = (url: string) => {
        if (editor) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const insertTable = () => {
        if (editor) {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }
    };

    const insertCodeBlock = () => {
        if (editor) {
            editor.chain().focus().toggleCodeBlock().run();
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-input bg-background">
            <EditorToolbar
                editor={editor}
                onUnsplashClick={() => setShowUnsplash(true)}
                onImageUrlClick={() => setShowImageUrl(true)}
                onYouTubeClick={() => setShowYouTube(true)}
                onTableClick={insertTable}
                onCodeBlockClick={insertCodeBlock}
            />
            <EditorContent editor={editor} />

            {/* Unsplash Picker Modal */}
            <UnsplashPicker
                open={showUnsplash}
                onOpenChange={setShowUnsplash}
                onSelect={(photo) => {
                    handleInsertImage(photo.urls.regular, photo.alt_description || '');
                    setShowUnsplash(false);
                }}
            />

            {/* Image URL Dialog */}
            <ImageUrlDialog
                open={showImageUrl}
                onOpenChange={setShowImageUrl}
                onInsert={(url, alt) => {
                    handleInsertImage(url, alt);
                    setShowImageUrl(false);
                }}
            />

            {/* YouTube Dialog */}
            <YouTubeDialog
                open={showYouTube}
                onOpenChange={setShowYouTube}
                onInsert={(url: string) => {
                    handleInsertYouTube(url);
                    setShowYouTube(false);
                }}
            />
        </div>
    );
}
