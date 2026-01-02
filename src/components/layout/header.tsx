'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getSiteSettings } from '@/lib/site-settings';
import { getPublishedPages } from '@/lib/pages';
import { useI18n } from '@/lib/i18n';
import { SiteSettings, Page } from '@/lib/types';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const { t } = useI18n();

    useEffect(() => {
        const loadSettings = async () => {
            setSettings(getSiteSettings());

            // Get local pages first
            const localPages = getPublishedPages();

            // Try to fetch Notion pages
            try {
                const response = await fetch('/api/notion/content');
                const data = await response.json();

                if (data.pages && data.pages.length > 0) {
                    // Convert Notion pages to Page format
                    const notionPages: Page[] = data.pages
                        .filter((p: any) => p.status === 'published')
                        .map((page: any) => ({
                            id: page.notionId,
                            slug: page.slug,
                            title: page.title,
                            content: page.content || '',
                            published: true,
                            status: 'published',
                            createdAt: page.publishedAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            notionId: page.notionId,
                        }));

                    // Merge: Notion pages + local pages (exclude duplicates by slug)
                    const notionSlugs = new Set(notionPages.map(p => p.slug));
                    const uniqueLocalPages = localPages.filter(p => !notionSlugs.has(p.slug));
                    setPages([...notionPages, ...uniqueLocalPages]);
                } else {
                    setPages(localPages);
                }
            } catch (error) {
                console.error('Error fetching Notion pages:', error);
                setPages(localPages);
            }
        };
        loadSettings();

        // Listen for settings updates
        window.addEventListener('site-settings-updated', loadSettings);
        return () => window.removeEventListener('site-settings-updated', loadSettings);
    }, []);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Static navigation items (always shown)
    const staticNavigation = [
        { name: t('nav.home'), href: '/' },
        ...(settings?.showRssFeed ? [{ name: 'RSS', href: '/feed.xml' }] : []),
    ];

    // Combine static and dynamic page links
    const navigation = [
        ...staticNavigation,
        ...pages.map((page) => ({ name: page.title, href: `/${page.slug}` })),
    ];

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
                ? 'border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
                : 'bg-transparent'
                }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-primary"
                >
                    <span className="text-2xl">{settings?.icon || '✍️'}</span>
                    <span className="hidden sm:inline">{settings?.title || 'ezBlog'}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-2 md:flex">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-2 md:hidden">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? (
                            <X className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="border-t border-border/40 bg-background md:hidden">
                    <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6 lg:px-8" aria-label="Mobile navigation">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
