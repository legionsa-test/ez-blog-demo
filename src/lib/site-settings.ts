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

// Get settings from localStorage (for local development fallback)
function getLocalStorageSettings(): Partial<SiteSettings> {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return {};
    try {
        return JSON.parse(data);
    } catch {
        return {};
    }
}

// Get site settings with environment variable priority
// Priority: 1. Environment variables (production)
//          2. localStorage (local development)
//          3. Default values
export function getSiteSettings(): SiteSettings {
    const localSettings = getLocalStorageSettings();

    return {
        // Title: env var > localStorage > default
        title: process.env.NEXT_PUBLIC_SITE_TITLE || localSettings.title || defaultSettings.title,

        // Icon: env var > localStorage > default
        icon: process.env.NEXT_PUBLIC_SITE_ICON || localSettings.icon || defaultSettings.icon,

        // Description: env var > localStorage > default
        description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || localSettings.description || defaultSettings.description,

        // Theme: env var > localStorage > default
        theme: (process.env.NEXT_PUBLIC_THEME as SiteSettings['theme']) || localSettings.theme || defaultSettings.theme,

        // Welcome text: env var > localStorage > default
        welcomeText: process.env.NEXT_PUBLIC_WELCOME_TEXT || localSettings.welcomeText || defaultSettings.welcomeText,

        // Footer visibility: env var > localStorage > default
        showFooter: process.env.NEXT_PUBLIC_SHOW_FOOTER !== undefined
            ? process.env.NEXT_PUBLIC_SHOW_FOOTER === 'true'
            : localSettings.showFooter ?? defaultSettings.showFooter,

        // Footer text: env var > localStorage > default
        footerText: process.env.NEXT_PUBLIC_FOOTER_TEXT || localSettings.footerText || defaultSettings.footerText,

        // RSS Feed visibility: env var > localStorage > default
        showRssFeed: process.env.NEXT_PUBLIC_SHOW_RSS !== undefined
            ? process.env.NEXT_PUBLIC_SHOW_RSS === 'true'
            : localSettings.showRssFeed ?? defaultSettings.showRssFeed,

        // Unsplash API key: env var > localStorage
        unsplashApiKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || localSettings.unsplashApiKey || '',

        // Admin password handled separately
        adminPassword: localSettings.adminPassword || '',

        // Notion settings (localStorage only for now)
        notionPageUrl: localSettings.notionPageUrl,
        enableNotionSync: localSettings.enableNotionSync,
    };
}

// Save site settings (to localStorage - for local dev)
export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    const localSettings = getLocalStorageSettings();
    const updated = { ...localSettings, ...settings };
    if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
    return getSiteSettings();
}

// Check if Unsplash API is configured
export function hasUnsplashApiKey(): boolean {
    const settings = getSiteSettings();
    return !!settings.unsplashApiKey;
}

// Get Unsplash API key
export function getUnsplashApiKey(): string {
    return getSiteSettings().unsplashApiKey;
}

// Get admin password
// Priority: 1. Environment variable (secure, server-controlled)
//          2. localStorage (local development only)
//          3. Default fallback
export function getAdminPassword(): string {
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (envPassword) {
        return envPassword;
    }

    if (typeof window !== 'undefined') {
        const localSettings = getLocalStorageSettings();
        if (localSettings.adminPassword) {
            return localSettings.adminPassword;
        }
    }

    return 'admin123';
}

// Check if a setting is controlled by environment variable
export function isSettingFromEnv(setting: keyof SiteSettings): boolean {
    const envMap: Partial<Record<keyof SiteSettings, string | undefined>> = {
        title: process.env.NEXT_PUBLIC_SITE_TITLE,
        icon: process.env.NEXT_PUBLIC_SITE_ICON,
        description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
        theme: process.env.NEXT_PUBLIC_THEME,
        welcomeText: process.env.NEXT_PUBLIC_WELCOME_TEXT,
        showFooter: process.env.NEXT_PUBLIC_SHOW_FOOTER,
        footerText: process.env.NEXT_PUBLIC_FOOTER_TEXT,
        showRssFeed: process.env.NEXT_PUBLIC_SHOW_RSS,
        unsplashApiKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
        adminPassword: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    };
    return !!envMap[setting];
}

// Check if any settings are from environment variables
export function hasEnvSettings(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SITE_TITLE ||
        process.env.NEXT_PUBLIC_SITE_ICON ||
        process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
        process.env.NEXT_PUBLIC_THEME ||
        process.env.NEXT_PUBLIC_WELCOME_TEXT ||
        process.env.NEXT_PUBLIC_SHOW_FOOTER ||
        process.env.NEXT_PUBLIC_FOOTER_TEXT ||
        process.env.NEXT_PUBLIC_SHOW_RSS
    );
}

