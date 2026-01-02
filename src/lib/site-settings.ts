'use client';

import { SiteSettings } from './types';

const SETTINGS_KEY = 'ezblog_site_settings';

// Default site settings
const defaultSettings: SiteSettings = {
    title: 'ezBlog',
    icon: '✍️',
    description: 'A modern, headless blog CMS',
    unsplashApiKey: '',
    adminPassword: '',
    showFooter: true,
    footerText: '© {year} ezBlog. Built with Next.js and shadcn/ui.',
    theme: 'ezblog1',
    welcomeText: 'Welcome to',
    showRssFeed: false,
};

// Get site settings
export function getSiteSettings(): SiteSettings {
    if (typeof window === 'undefined') return defaultSettings;
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return defaultSettings;

    try {
        return { ...defaultSettings, ...JSON.parse(data) };
    } catch {
        return defaultSettings;
    }
}

// Save site settings
export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = getSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
}

// Check if Unsplash API is configured
export function hasUnsplashApiKey(): boolean {
    const settings = getSiteSettings();
    return !!settings.unsplashApiKey;
}

// Get Unsplash API key
export function getUnsplashApiKey(): string {
    const settings = getSiteSettings();
    return settings.unsplashApiKey || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';
}

// Get admin password (from settings or falls back to env variable)
export function getAdminPassword(): string {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    }
    const settings = getSiteSettings();
    return settings.adminPassword || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
}
