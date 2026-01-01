'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './toolbar';
import { useState } from 'react';
import { UnsplashPicker } from './unsplash-picker';
import { ImageUrlDialog } from './image-url-dialog';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showImageUrl, setShowImageUrl] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full',
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
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-input bg-background">
            <EditorToolbar
                editor={editor}
                onUnsplashClick={() => setShowUnsplash(true)}
                onImageUrlClick={() => setShowImageUrl(true)}
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
        </div>
    );
}
