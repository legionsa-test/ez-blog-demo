import { UnsplashPhoto, UnsplashSearchResult } from './types';
import { getUnsplashApiKey } from './site-settings';

const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Get the API key (from site settings or env variable)
function getApiKey(): string {
    // Try site settings first, then fall back to env variable
    if (typeof window !== 'undefined') {
        const settingsKey = getUnsplashApiKey();
        if (settingsKey) return settingsKey;
    }
    return process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';
}

export async function searchPhotos(
    query: string,
    page: number = 1,
    perPage: number = 12
): Promise<UnsplashSearchResult> {
    const apiKey = getApiKey();
    if (!apiKey) {
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
            Authorization: `Client-ID ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to search Unsplash photos');
    }

    return response.json();
}

export async function getPhoto(id: string): Promise<UnsplashPhoto> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('Unsplash API key not configured');
    }

    const response = await fetch(`${UNSPLASH_API_URL}/photos/${id}`, {
        headers: {
            Authorization: `Client-ID ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get Unsplash photo');
    }

    return response.json();
}

// Track download as per Unsplash guidelines
export async function trackDownload(downloadLocation: string): Promise<void> {
    const apiKey = getApiKey();
    if (!apiKey) return;

    try {
        await fetch(`${downloadLocation}?client_id=${apiKey}`);
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
    return Boolean(getApiKey());
}
