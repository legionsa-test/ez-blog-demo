'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useMemo } from 'react';
import { ExtendedRecordMap } from 'notion-types';

// react-notion-x core styles
import 'react-notion-x/src/styles.css';

// Dynamically import NotionRenderer to avoid SSR issues
const NotionRenderer = dynamic(
    () => import('react-notion-x').then((m) => m.NotionRenderer),
    {
        ssr: false,
        loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />
    }
);

// Collection/Database component (optional)
const Collection = dynamic(
    () => import('react-notion-x/build/third-party/collection').then((m) => m.Collection),
    { ssr: false }
);

// Modal for images (optional)
const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    { ssr: false }
);

interface NotionPageRendererProps {
    recordMap: ExtendedRecordMap;
    rootPageId?: string;
    fullPage?: boolean;
    darkMode?: boolean;
    previewImages?: boolean;
    showCollectionViewDropdown?: boolean;
    showTableOfContents?: boolean;
    minTableOfContentsItems?: number;
    className?: string;
}

// Extract text from Notion rich text array
const extractTextFromRichText = (richText: any): string => {
    if (!richText) return '';
    if (typeof richText === 'string') return richText;
    if (Array.isArray(richText)) {
        return richText.map((item: any) => {
            if (typeof item === 'string') return item;
            if (Array.isArray(item) && item[0]) return item[0];
            return '';
        }).join('');
    }
    return '';
};

// Custom Callout Component
const CustomCallout = ({ block, children }: { block: any; children: React.ReactNode }) => {
    const { format, properties } = block;
    const icon = format?.page_icon || '💡';

    // Extract text from block properties if children are empty
    const blockText = extractTextFromRichText(properties?.title);

    return (
        <aside
            className="callout my-4 rounded-lg border border-border p-4 bg-muted/30 flex items-start gap-3"
        >
            <span className="text-xl leading-6 select-none">{icon}</span>
            <div className="flex-1 min-w-0 text-foreground">
                {children || blockText || '(Empty callout)'}
            </div>
        </aside>
    );
};

// Custom Embed Component for Figma and other embeds
const CustomEmbed = ({ block }: { block: any }) => {
    const { format, properties } = block;

    // Get the embed URL from various possible locations
    let embedUrl =
        properties?.source?.[0]?.[0] ||
        format?.display_source ||
        format?.uri ||
        '';

    if (!embedUrl) {
        console.log('[NotionRenderer] Embed block has no URL:', block.type, JSON.stringify(format || {}).slice(0, 200));
        return null;
    }

    // Fix Figma URLs
    if (embedUrl.includes('figma.com') && !embedUrl.includes('embed_host')) {
        embedUrl = `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(embedUrl)}`;
    }

    return (
        <div className="my-4 w-full aspect-video">
            <iframe
                src={embedUrl}
                className="w-full h-full rounded-lg border border-border bg-muted"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
};

// Helper to fix specific embed URLs (specifically Figma)
const fixEmbedUrls = (recordMap: ExtendedRecordMap) => {
    if (!recordMap?.block) return recordMap;

    const newRecordMap = { ...recordMap };
    newRecordMap.block = { ...recordMap.block };

    Object.keys(newRecordMap.block).forEach((blockId) => {
        const blockWrapper = newRecordMap.block[blockId];
        if (!blockWrapper?.value) return;

        const block = blockWrapper.value;
        const blockType = block.type;

        // Handle various embed block types including external_object_instance (used by Figma)
        if (blockType === 'embed' || blockType === 'figma' || blockType === 'maps' ||
            blockType === 'external_object_instance' || blockType === 'video') {

            const props = block.properties;
            const format = block.format as any; // Use 'any' for flexible Notion format structure

            // Check multiple locations for the URL
            const source =
                props?.source?.[0]?.[0] ||
                format?.display_source ||
                format?.uri ||
                format?.original_url;

            if (source && source.includes('figma.com') && !source.includes('embed_host')) {
                // Construct fixed URL
                const fixedUrl = `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(source)}`;

                // Mutate the block copy
                (newRecordMap.block as any)[blockId] = {
                    ...blockWrapper,
                    value: {
                        ...block,
                        format: {
                            ...(block.format || {}),
                            display_source: fixedUrl,
                        },
                        properties: {
                            ...(block.properties || {}),
                            source: [[fixedUrl]],
                        }
                    }
                };
            }
        }
    });

    return newRecordMap;
};

export function NotionPageRenderer({
    recordMap,
    rootPageId,
    fullPage = false,
    darkMode = false,
    previewImages = true,
    showCollectionViewDropdown = true,
    showTableOfContents = false,
    minTableOfContentsItems = 3,
    className = '',
}: NotionPageRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Fix URLs once
    const fixedRecordMap = useMemo(() => fixEmbedUrls(recordMap), [recordMap]);

    // Apply code syntax highlighting after render
    useEffect(() => {
        if (!containerRef.current) return;

        // Dynamically import Prism and highlight code blocks
        const highlightCode = async () => {
            try {
                // Import Prism dynamically to avoid SSR issues
                const Prism = (await import('prismjs')).default;

                // Import common languages
                await import('prismjs/components/prism-javascript');
                await import('prismjs/components/prism-typescript');
                await import('prismjs/components/prism-jsx');
                await import('prismjs/components/prism-tsx');
                await import('prismjs/components/prism-css');
                await import('prismjs/components/prism-python');
                await import('prismjs/components/prism-bash');
                await import('prismjs/components/prism-json');
                await import('prismjs/components/prism-yaml');
                await import('prismjs/components/prism-markdown');
                await import('prismjs/components/prism-sql');

                // Find all code blocks and apply highlighting
                const codeBlocks = containerRef.current?.querySelectorAll('pre code, .notion-code code');
                if (codeBlocks && codeBlocks.length > 0) {
                    codeBlocks.forEach((block) => {
                        Prism.highlightElement(block as HTMLElement);
                    });
                }
            } catch (error) {
                console.error('Failed to load Prism for syntax highlighting:', error);
            }
        };

        // Delay to ensure react-notion-x has rendered
        const timer = setTimeout(highlightCode, 500);
        return () => clearTimeout(timer);
    }, [fixedRecordMap]);

    if (!fixedRecordMap) {
        return null;
    }

    return (
        <div ref={containerRef} className={`notion-renderer-wrapper ${className}`}>
            <NotionRenderer
                recordMap={fixedRecordMap}
                rootPageId={rootPageId}
                fullPage={fullPage}
                darkMode={darkMode}
                previewImages={previewImages}
                showCollectionViewDropdown={showCollectionViewDropdown}
                showTableOfContents={showTableOfContents}
                minTableOfContentsItems={minTableOfContentsItems}
                components={{
                    Collection,
                    Modal,
                    nextImage: Image,
                    nextLink: Link,
                    Callout: CustomCallout, // Pass custom Callout
                }}
                mapPageUrl={(pageId) => `/blog/${pageId}`}
            />
        </div>
    );
}

export default NotionPageRenderer;
