'use client';

import { useState, useEffect } from 'react';
import { getSiteSettings } from '@/lib/site-settings';
import { SiteSettings } from '@/lib/types';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const loadSettings = () => {
            const s = getSiteSettings();
            setSettings(s);
            setIsHidden(s?.showFooter === false);
        };
        loadSettings();
        window.addEventListener('site-settings-updated', loadSettings);
        return () => window.removeEventListener('site-settings-updated', loadSettings);
    }, []);

    const defaultFooterText = `© ${currentYear} ezBlog. Built with Next.js and shadcn/ui.`;
    const footerText = settings?.footerText
        ? settings.footerText.replace('{year}', currentYear.toString())
        : defaultFooterText;

    return (
        <footer
            className={`border-t border-border/40 bg-muted/30 min-h-[60px] ${isHidden ? 'invisible' : ''}`}
            aria-hidden={isHidden}
        >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-muted-foreground">
                    {footerText}
                </p>
            </div>
        </footer>
    );
}
