// Media library utilities

export interface MediaItem {
    id: string;
    url: string;
    alt: string;
    type: 'image' | 'video';
    source: 'unsplash' | 'url' | 'upload';
    width?: number;
    height?: number;
    createdAt: string;
}

const MEDIA_KEY = 'ezblog_media';

// Generate unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Get all media items
export function getMediaItems(): MediaItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(MEDIA_KEY);
    return data ? JSON.parse(data) : [];
}

// Get media item by ID
export function getMediaById(id: string): MediaItem | null {
    const items = getMediaItems();
    return items.find((m) => m.id === id) || null;
}

// Add media item
export function addMediaItem(
    item: Omit<MediaItem, 'id' | 'createdAt'>
): MediaItem {
    const items = getMediaItems();

    // Check if URL already exists
    const existing = items.find((m) => m.url === item.url);
    if (existing) return existing;

    const newItem: MediaItem = {
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    localStorage.setItem(MEDIA_KEY, JSON.stringify(items));
    return newItem;
}

// Delete media item
export function deleteMediaItem(id: string): void {
    const items = getMediaItems().filter((m) => m.id !== id);
    localStorage.setItem(MEDIA_KEY, JSON.stringify(items));
}

// Search media items
export function searchMedia(query: string): MediaItem[] {
    const items = getMediaItems();
    const q = query.toLowerCase();
    return items.filter(
        (m) =>
            m.alt.toLowerCase().includes(q) ||
            m.url.toLowerCase().includes(q)
    );
}

// Get recent media items
export function getRecentMedia(limit: number = 20): MediaItem[] {
    return getMediaItems().slice(0, limit);
}

// Track media usage when inserting into editor
export function trackMediaUsage(url: string, alt: string = ''): void {
    const items = getMediaItems();
    const existing = items.find((m) => m.url === url);

    if (!existing) {
        addMediaItem({
            url,
            alt,
            type: 'image',
            source: url.includes('unsplash.com') ? 'unsplash' : 'url',
        });
    }
}
