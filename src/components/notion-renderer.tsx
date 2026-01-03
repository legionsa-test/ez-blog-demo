'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';

// Dynamically import NotionRenderer to avoid SSR issues
const NotionRenderer = dynamic(
    () => import('react-notion-x').then((m) => m.NotionRenderer),
    { ssr: false }
);

// Code highlighting with Prism
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

// Code block component
const Code = dynamic(() =>
    import('react-notion-x/build/third-party/code').then((m) => m.Code)
);

// Collection/Database component
const Collection = dynamic(() =>
    import('react-notion-x/build/third-party/collection').then((m) => m.Collection)
);

// Equation/Math component
const Equation = dynamic(() =>
    import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
);

// PDF viewer component
const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
    { ssr: false }
);

// Modal for images and pages
const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    { ssr: false }
);

// react-notion-x styles
import 'react-notion-x/src/styles.css';
// KaTeX styles for equations
import 'katex/dist/katex.min.css';

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
                    Code,
                    Collection,
                    Equation,
                    Pdf,
                    Modal,
                    // Custom Next.js Image component for optimization
                    nextImage: Image,
                    // Custom Next.js Link component
                    nextLink: Link,
                }}
                // Map links to internal blog posts
                mapPageUrl={(pageId) => {
                    return `/blog/${pageId}`;
                }}
            />
        </div>
    );
}

export default NotionPageRenderer;
