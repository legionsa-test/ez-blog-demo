'use client';

import { Page } from './types';

const PAGES_KEY = 'ezblog_pages';

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Get all pages (sorted by order)
export function getPages(): Page[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PAGES_KEY);
    const pages: Page[] = data ? JSON.parse(data) : [];
    // Sort by order (ascending), then by createdAt (descending) for unordered pages
    return pages.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

// Get published pages only (sorted by order)
export function getPublishedPages(): Page[] {
    return getPages().filter((page) => page.published);
}

// Update pages order
export function updatePagesOrder(orderedIds: string[]): void {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(PAGES_KEY);
    const pages: Page[] = data ? JSON.parse(data) : [];

    // Assign order based on position in orderedIds array
    const updatedPages = pages.map((page) => {
        const orderIndex = orderedIds.indexOf(page.id);
        return {
            ...page,
            order: orderIndex !== -1 ? orderIndex : pages.length + 1000
        };
    });

    localStorage.setItem(PAGES_KEY, JSON.stringify(updatedPages));
}

// Get page by slug
export function getPageBySlug(slug: string): Page | null {
    const pages = getPages();
    return pages.find((page) => page.slug === slug) || null;
}

// Get page by ID
export function getPageById(id: string): Page | null {
    const pages = getPages();
    return pages.find((page) => page.id === id) || null;
}

// Save page (create or update)
export function savePage(page: Partial<Page> & { title: string; content: string }): Page {
    const pages = getPages();
    const now = new Date().toISOString();

    if (page.id) {
        // Update existing page
        const index = pages.findIndex((p) => p.id === page.id);
        if (index !== -1) {
            const updatedPage: Page = {
                ...pages[index],
                ...page,
                slug: page.slug || generateSlug(page.title),
                updatedAt: now,
            };
            pages[index] = updatedPage;
            localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
            return updatedPage;
        }
    }

    // Create new page
    const newPage: Page = {
        id: generateId(),
        slug: page.slug || generateSlug(page.title),
        title: page.title,
        content: page.content,
        published: page.published ?? false,
        createdAt: now,
        updatedAt: now,
    };

    pages.unshift(newPage);
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
    return newPage;
}

// Delete page
export function deletePage(id: string): boolean {
    const pages = getPages();
    const filteredPages = pages.filter((page) => page.id !== id);
    if (filteredPages.length !== pages.length) {
        localStorage.setItem(PAGES_KEY, JSON.stringify(filteredPages));
        return true;
    }
    return false;
}

// Reserved slugs that cannot be used for pages
const RESERVED_SLUGS = ['blog', 'admin', 'login', 'api', 'feed.xml'];

// Check if a slug is available
export function isSlugAvailable(slug: string, excludeId?: string): boolean {
    if (RESERVED_SLUGS.includes(slug)) return false;
    const pages = getPages();
    return !pages.some((page) => page.slug === slug && page.id !== excludeId);
}
