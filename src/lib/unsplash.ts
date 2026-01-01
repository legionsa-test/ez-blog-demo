import { UnsplashPhoto, UnsplashSearchResult } from './types';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export async function searchPhotos(
    query: string,
    page: number = 1,
    perPage: number = 12
): Promise<UnsplashSearchResult> {
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn('Unsplash API key not configured');
        return { total: 0, total_pages: 0, results: [] };
    }

    const params = new URLSearchParams({
        query,
        page: page.toString(),
        per_page: perPage.toString(),
        orientation: 'landscape',
    });

    const response = await fetch(`${UNSPLASH_API_URL}/search/photos?${params}`, {
        headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to search Unsplash photos');
    }

    return response.json();
}

export async function getPhoto(id: string): Promise<UnsplashPhoto> {
    if (!UNSPLASH_ACCESS_KEY) {
        throw new Error('Unsplash API key not configured');
    }

    const response = await fetch(`${UNSPLASH_API_URL}/photos/${id}`, {
        headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get Unsplash photo');
    }

    return response.json();
}

// Track download as per Unsplash guidelines
export async function trackDownload(downloadLocation: string): Promise<void> {
    if (!UNSPLASH_ACCESS_KEY) return;

    try {
        await fetch(`${downloadLocation}?client_id=${UNSPLASH_ACCESS_KEY}`);
    } catch (error) {
        console.error('Failed to track Unsplash download:', error);
    }
}

// Get attribution HTML for a photo
export function getAttribution(photo: UnsplashPhoto): string {
    return `Photo by <a href="${photo.user.links.html}?utm_source=ezblog&utm_medium=referral" target="_blank" rel="noopener noreferrer">${photo.user.name}</a> on <a href="https://unsplash.com?utm_source=ezblog&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
}

// Check if Unsplash is configured
export function isUnsplashConfigured(): boolean {
    return Boolean(UNSPLASH_ACCESS_KEY);
}
