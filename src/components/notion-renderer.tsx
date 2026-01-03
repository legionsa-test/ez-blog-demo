'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
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
    if (!recordMap) {
        return null;
    }

    return (
        <div className={`notion-renderer-wrapper ${className}`}>
            <NotionRenderer
                recordMap={recordMap}
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
                }}
                mapPageUrl={(pageId) => `/blog/${pageId}`}
            />
        </div>
    );
}

export default NotionPageRenderer;
