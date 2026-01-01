// View tracking utilities using localStorage

const VIEWS_KEY = 'ezblog_views';
const READING_HISTORY_KEY = 'ezblog_reading_history';

interface ViewData {
    [slug: string]: number;
}

interface ReadingHistoryItem {
    slug: string;
    title: string;
    coverImage: string;
    progress: number; // 0-100
    lastRead: string;
}

// Get all view counts
export function getViewCounts(): ViewData {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(VIEWS_KEY);
    return data ? JSON.parse(data) : {};
}

// Increment view count for a post
export function incrementViewCount(slug: string): number {
    if (typeof window === 'undefined') return 0;
    const views = getViewCounts();
    views[slug] = (views[slug] || 0) + 1;
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
    return views[slug];
}

// Get view count for a specific post
export function getViewCount(slug: string): number {
    const views = getViewCounts();
    return views[slug] || 0;
}

// Reading history functions
export function getReadingHistory(): ReadingHistoryItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(READING_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

export function updateReadingHistory(
    slug: string,
    title: string,
    coverImage: string,
    progress: number
): void {
    if (typeof window === 'undefined') return;

    const history = getReadingHistory();
    const existingIndex = history.findIndex((item) => item.slug === slug);

    const newItem: ReadingHistoryItem = {
        slug,
        title,
        coverImage,
        progress: Math.round(progress),
        lastRead: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
        history[existingIndex] = newItem;
    } else {
        history.unshift(newItem);
    }

    // Keep only last 10 items
    const trimmed = history.slice(0, 10);
    localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(trimmed));
}

export function getRecentlyRead(): ReadingHistoryItem[] {
    const history = getReadingHistory();
    // Return items that are not fully read (progress < 100)
    return history.filter((item) => item.progress < 100).slice(0, 5);
}

export function clearReadingHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(READING_HISTORY_KEY);
}
