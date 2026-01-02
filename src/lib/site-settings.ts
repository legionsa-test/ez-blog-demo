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

// Get admin password
// Priority: 1. Environment variable (secure, server-controlled)
//          2. localStorage (local development only)
//          3. Default fallback
export function getAdminPassword(): string {
    // Environment variable takes priority (secure for production)
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (envPassword) {
        return envPassword;
    }

    // Fall back to localStorage (for local development)
    if (typeof window !== 'undefined') {
        const settings = getSiteSettings();
        if (settings.adminPassword) {
            return settings.adminPassword;
        }
    }

    // Default password (only if nothing else is set)
    return 'admin123';
}

// Check if password is set via environment variable
export function isPasswordFromEnv(): boolean {
    return !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}
