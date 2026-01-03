'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface NotionTableOfContentsProps {
    className?: string;
    containerSelector?: string; // CSS selector for the content container
}

/**
 * Table of Contents component that extracts headings from the DOM.
 * Works with react-notion-x or any DOM-rendered content.
 */
export function NotionTableOfContents({
    className,
    containerSelector = '.notion-renderer-wrapper'
}: NotionTableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    // Extract headings from rendered DOM
    const extractHeadings = useCallback(() => {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Look for Notion heading classes or standard h2/h3 elements
        const elements = container.querySelectorAll('.notion-h1, .notion-h2, .notion-h3, h1, h2, h3');

        const items: TocItem[] = Array.from(elements).map((el, index) => {
            const text = el.textContent?.trim() || '';

            // Generate ID if not present
            let id = el.id;
            if (!id) {
                id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '') || `heading-${index}`;
                el.id = id;
            }

            // Determine heading level
            let level = 2;
            if (el.classList.contains('notion-h1') || el.tagName === 'H1') level = 1;
            else if (el.classList.contains('notion-h2') || el.tagName === 'H2') level = 2;
            else if (el.classList.contains('notion-h3') || el.tagName === 'H3') level = 3;

            return { id, text, level };
        }).filter(item => item.text.length > 0);

        setHeadings(items);
    }, [containerSelector]);

    // Extract headings after DOM is ready
    useEffect(() => {
        // Wait for react-notion-x to render
        const timer = setTimeout(extractHeadings, 500);

        // Also observe for dynamic content changes
        const observer = new MutationObserver(() => {
            extractHeadings();
        });

        const container = document.querySelector(containerSelector);
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [extractHeadings, containerSelector]);

    // Track active heading on scroll
    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-80px 0px -80% 0px',
                threshold: 0,
            }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav
            className={cn('space-y-1', className)}
            aria-label="Table of contents"
        >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Table of Contents
            </h2>
            <ul className="space-y-2 text-sm">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={cn(
                            heading.level === 3 && 'ml-4'
                        )}
                    >
                        <button
                            onClick={() => handleClick(heading.id)}
                            className={cn(
                                'block w-full text-left transition-colors hover:text-primary',
                                activeId === heading.id
                                    ? 'font-medium text-primary'
                                    : 'text-muted-foreground'
                            )}
                        >
                            {heading.text}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default NotionTableOfContents;
