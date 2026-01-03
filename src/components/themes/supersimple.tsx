'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Post, SiteSettings, Page } from '@/lib/types';
import { getSiteSettings } from '@/lib/site-settings';
import { getPublishedPages } from '@/lib/pages';
import { ThemeToggle } from '@/components/theme-toggle';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SupersimpleLayoutProps {
    posts: Post[];
    isLoading: boolean;
}

export function SupersimpleLayout({ posts, isLoading }: SupersimpleLayoutProps) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [pages, setPages] = useState<Page[]>([]);

    useEffect(() => {
        const loadSettings = async () => {
            setSettings(getSiteSettings());

            // Get local pages first
            const localPages = getPublishedPages();

            // Try to fetch Notion pages (copied logic from Header)
            try {
                const response = await fetch('/api/notion/content');
                const data = await response.json();

                if (data.pages && data.pages.length > 0) {
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

        window.addEventListener('site-settings-updated', loadSettings);
        return () => window.removeEventListener('site-settings-updated', loadSettings);
    }, []);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl px-6 py-16">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-48 rounded bg-muted" />
                    <div className="h-32 rounded bg-muted" />
                    <div className="space-y-4">
                        <div className="h-6 w-full rounded bg-muted" />
                        <div className="h-6 w-3/4 rounded bg-muted" />
                    </div>
                </div>
            </div>
        );
    }

    const latestPost = posts[0];
    const archivePosts = posts.slice(1, 6);

    // Navigation items (Pages + RSS)
    const navItems = [
        ...pages.map((page) => ({ name: page.title, href: `/${page.slug}` })),
        ...(settings?.showRssFeed ? [{ name: 'RSS', href: '/feed.xml' }] : []),
    ];

    // Limit visible items to 3, rest go to overflow menu
    const MAX_VISIBLE_ITEMS = 3;
    const visibleNavItems = navItems.slice(0, MAX_VISIBLE_ITEMS);
    const overflowNavItems = navItems.slice(MAX_VISIBLE_ITEMS);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-8">
                <Link href="/" className="text-lg font-medium tracking-tight hover:opacity-70">
                    {settings?.title || 'ezBlog'}
                </Link>
                <nav className="flex items-center gap-6">
                    {visibleNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Overflow Dropdown */}
                    {overflowNavItems.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    More
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {overflowNavItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <ThemeToggle />
                </nav>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-2xl px-6 pb-24 min-h-[60vh]">
                {/* Welcome Section */}
                <section className="mb-16">
                    <h1
                        className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
                        style={{ fontFamily: 'var(--font-crimson-pro), serif' }}
                    >
                        {settings?.welcomeText || 'Welcome to'}
                    </h1>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        {settings?.description || 'A space for thoughts, ideas, and stories. Explore the latest posts below or browse the archive.'}
                    </p>
                </section>

                {/* Latest Post */}
                {latestPost && (
                    <section className="mb-16">
                        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Latest Post
                        </h2>
                        <Link
                            href={`/blog/${latestPost.slug}`}
                            className="group block overflow-hidden rounded-lg border border-border/60 transition-all hover:border-foreground/20 hover:bg-muted/30"
                        >
                            {latestPost.coverImage && (
                                <div className="relative aspect-[2/1] w-full overflow-hidden">
                                    <Image
                                        src={latestPost.coverImage}
                                        alt={latestPost.coverImageAlt || latestPost.title}
                                        fill
                                        priority
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary">
                                    {latestPost.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {format(new Date(latestPost.publishedAt || latestPost.createdAt), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Archive */}
                {archivePosts.length > 0 && (
                    <section className="mb-16">
                        <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Published Posts
                        </h2>
                        <div className="space-y-4">
                            {archivePosts.map((post) => (
                                post.coverImageSize === 'big' && post.coverImage ? (
                                    // Big image layout - card style
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group block overflow-hidden rounded-lg border border-border/60 transition-all hover:border-foreground/20"
                                    >
                                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.coverImageAlt || post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                ) : (
                                    // Small/hidden image layout - inline style
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group flex items-center gap-4 border-b border-border/40 py-4 transition-colors hover:text-primary"
                                    >
                                        {/* Show small image only if coverImageSize is 'small' or undefined (not 'hidden') */}
                                        {post.coverImage && post.coverImageSize !== 'hidden' && (
                                            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded">
                                                <Image
                                                    src={post.coverImage}
                                                    alt={post.coverImageAlt || post.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-1 items-baseline justify-between">
                                            <span className="font-medium">{post.title}</span>
                                            <span className="ml-4 shrink-0 text-sm text-muted-foreground">
                                                {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>
                        {posts.length > 6 && (
                            <Link
                                href="/blog"
                                className="mt-4 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
                            >
                                View all posts →
                            </Link>
                        )}
                    </section>
                )}

                {/* Empty State */}
                {posts.length === 0 && (
                    <section className="py-16 text-center">
                        <p className="text-lg text-muted-foreground">
                            No posts yet. Check back soon!
                        </p>
                    </section>
                )}
            </main>
        </div>
    );
}
