'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSiteSettings } from '@/lib/site-settings';
import { getPublishedPages } from '@/lib/pages';
import { useI18n } from '@/lib/i18n';

export function Header() {
    const pathname = usePathname();
    const { t } = useI18n();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [siteSettings, setSiteSettings] = useState({ title: 'ezBlog', icon: '✍️' });
    const [pageLinks, setPageLinks] = useState<{ name: string; href: string }[]>([]);

    // Load site settings and pages
    useEffect(() => {
        const loadSettings = () => {
            const settings = getSiteSettings();
            setSiteSettings({ title: settings.title, icon: settings.icon });

            // Get published pages for navigation
            const pages = getPublishedPages();
            const links = pages.map((page) => ({
                name: page.title,
                href: `/${page.slug}`,
            }));
            setPageLinks(links);
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
    ];

    // Combine static and dynamic page links
    const navigation = [...staticNavigation, ...pageLinks];

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
                isScrolled ? 'py-2' : 'py-0'
            )}
        >
            <nav
                className={cn(
                    'mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8 transition-all duration-300',
                    isScrolled ? 'justify-center gap-8' : 'justify-between py-4'
                )}
                aria-label="Main navigation"
            >
                {/* Logo */}
                <Link
                    href="/"
                    className={cn(
                        'flex items-center gap-2 font-bold transition-all duration-300 hover:text-primary',
                        isScrolled ? 'text-lg' : 'text-xl'
                    )}
                >
                    <span className={cn('transition-all duration-300', isScrolled ? 'text-xl' : 'text-2xl')}>
                        {siteSettings.icon}
                    </span>
                    <span>{siteSettings.title}</span>
                </Link>

                {/* Desktop Navigation - Links and Theme Toggle */}
                <div className="hidden items-center gap-1 md:flex" role="navigation">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                pathname === item.href
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="ml-2 flex items-center gap-1">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-2 md:hidden">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        )}
                    </Button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div
                    id="mobile-menu"
                    className="border-t border-border/40 bg-background md:hidden"
                    role="navigation"
                    aria-label="Mobile navigation"
                >
                    <div className="space-y-1 px-4 py-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                                    pathname === item.href
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
