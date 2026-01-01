'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
    className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    // Extract headings from HTML content
    useEffect(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const elements = doc.querySelectorAll('h2, h3');

        const items: TocItem[] = Array.from(elements).map((el, index) => {
            const text = el.textContent || '';
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `heading-${index}`;

            return {
                id,
                text,
                level: el.tagName === 'H2' ? 2 : 3,
            };
        });

        setHeadings(items);
    }, [content]);

    // Track active heading on scroll
    useEffect(() => {
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
