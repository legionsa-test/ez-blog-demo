'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkipLink } from '@/components/layout/skip-link';
import { getSiteSettings } from '@/lib/site-settings';

export interface LayoutWrapperProps {
    children: React.ReactNode;
    initialTheme?: string;
}

export function LayoutWrapper({ children, initialTheme = 'ezblog1' }: LayoutWrapperProps) {
    const [theme, setTheme] = useState<string>(initialTheme);

    useEffect(() => {
        // Check for client-side override (localStorage)
        const settings = getSiteSettings();
        if (settings.theme && settings.theme !== theme) {
            setTheme(settings.theme);
        }

        // Listen for theme changes
        const handleSettingsUpdate = () => {
            const updated = getSiteSettings();
            setTheme(updated.theme || 'ezblog1');
        };
        window.addEventListener('site-settings-updated', handleSettingsUpdate);
        return () => window.removeEventListener('site-settings-updated', handleSettingsUpdate);
    }, [theme]);

    // Magazine and Supersimple themes have their own layout
    const isMagazineTheme = theme === 'atavist';
    const isSupersimpleTheme = theme === 'supersimple';

    // Supersimple has its own complete layout
    if (isSupersimpleTheme) {
        return (
            <div className="relative min-h-screen flex flex-col">
                <div className="flex-1">
                    <main id="main-content" role="main">
                        {children}
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    // Magazine theme with sidebar offset footer
    if (isMagazineTheme) {
        return (
            <div className="relative flex min-h-screen flex-col">
                <main id="main-content" className="flex-1" role="main">
                    {children}
                </main>
                <div className="md:ml-64">
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <SkipLink />
            <Header />
            <main id="main-content" className="flex-1" role="main">
                {children}
            </main>
            <Footer />
        </div>
    );
}
