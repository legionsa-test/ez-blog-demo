'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkipLink } from '@/components/layout/skip-link';
import { getSiteSettings } from '@/lib/site-settings';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    const [theme, setTheme] = useState<string>('ezblog1');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const settings = getSiteSettings();
        setTheme(settings.theme || 'ezblog1');
        setMounted(true);

        // Listen for theme changes
        const handleSettingsUpdate = () => {
            const updated = getSiteSettings();
            setTheme(updated.theme || 'ezblog1');
        };
        window.addEventListener('site-settings-updated', handleSettingsUpdate);
        return () => window.removeEventListener('site-settings-updated', handleSettingsUpdate);
    }, []);

    // Magazine theme has its own layout, no header/footer
    const isMagazineTheme = theme === 'atavist';

    // Show minimal layout during hydration to prevent flash
    if (!mounted) {
        return (
            <div className="relative flex min-h-screen flex-col">
                <main id="main-content" className="flex-1" role="main">
                    {children}
                </main>
            </div>
        );
    }

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
