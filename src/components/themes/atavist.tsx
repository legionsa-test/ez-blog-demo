'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ChevronDown, Filter, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Post, SiteSettings, Page } from '@/lib/types';
import { getSiteSettings } from '@/lib/site-settings';
import { getPublishedPages } from '@/lib/pages';
import { format } from 'date-fns';

interface AtavistLayoutProps {
    posts: Post[];
    isLoading: boolean;
}

export function AtavistLayout({ posts, isLoading }: AtavistLayoutProps) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);

    useEffect(() => {
        setSettings(getSiteSettings());
        setPages(getPublishedPages());
    }, []);

    // Get all unique tags from posts
    const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

    // Filter posts based on search and tag
    const filteredPosts = posts.filter((post) => {
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || post.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen">
                <aside className="hidden w-64 animate-pulse bg-muted md:block" />
                <main className="flex-1">
                    <div className="h-screen animate-pulse bg-muted/50" />
                </main>
            </div>
        );
    }

    const navigation = [
        { name: 'Home', href: '/' },
        ...pages.map((page) => ({ name: page.title, href: `/${page.slug}` })),
    ];

    const handleTagSelect = (tag: string | null) => {
        setSelectedTag(tag);
        setTagsOpen(false);
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Sidebar - Desktop */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/40 bg-background md:flex">
                <div className="flex h-full flex-col items-center px-6 py-8 text-center">
                    {/* Logo & Title - Centered */}
                    <Link href="/" className="mb-8">
                        <span className="block text-4xl">{settings?.icon || '✍️'}</span>
                        <h1 className="mt-3 font-serif text-xl font-bold tracking-tight">
                            {settings?.title || 'ezBlog'}
                        </h1>
                    </Link>

                    {/* Navigation - Centered */}
                    <nav className="mb-6 w-full space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Bottom Accordions */}
                    <div className="w-full space-y-2">
                        {/* Search Accordion */}
                        <div className="rounded-lg border border-border/40">
                            <button
                                onClick={() => { setSearchOpen(!searchOpen); setTagsOpen(false); setOptionsOpen(false); }}
                                className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <span className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Search
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${searchOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {searchOpen && (
                                <div className="border-t border-border/40 p-3">
                                    <Input
                                        type="search"
                                        placeholder="Search stories..."
                                        className="text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tags Accordion */}
                        {allTags.length > 0 && (
                            <div className="rounded-lg border border-border/40">
                                <button
                                    onClick={() => { setTagsOpen(!tagsOpen); setSearchOpen(false); setOptionsOpen(false); }}
                                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <span className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Topics {selectedTag && `(${selectedTag})`}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${tagsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {tagsOpen && (
                                    <div className="border-t border-border/40 p-3">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                onClick={() => handleTagSelect(null)}
                                                className={`rounded-full px-3 py-1 text-xs transition-colors ${!selectedTag
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    }`}
                                            >
                                                All
                                            </button>
                                            {allTags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleTagSelect(tag === selectedTag ? null : tag)}
                                                    className={`rounded-full px-3 py-1 text-xs transition-colors ${selectedTag === tag
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Options Accordion (Theme) */}
                        <div className="rounded-lg border border-border/40">
                            <button
                                onClick={() => { setOptionsOpen(!optionsOpen); setSearchOpen(false); setTagsOpen(false); }}
                                className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <span className="flex items-center gap-2">
                                    <Settings2 className="h-4 w-4" />
                                    Options
                                </span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${optionsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {optionsOpen && (
                                <div className="border-t border-border/40 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Theme</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer description */}
                    <p className="mt-6 text-xs text-muted-foreground">
                        {settings?.description || 'Stories worth reading.'}
                    </p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur md:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">{settings?.icon || '✍️'}</span>
                    <span className="font-serif font-bold">{settings?.title || 'ezBlog'}</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-background p-6 pt-20 shadow-xl">
                        {/* Mobile Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="pl-9 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="mb-4 space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Tags */}
                        {allTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => { setSelectedTag(null); setSidebarOpen(false); }}
                                    className={`rounded-full px-3 py-1 text-xs transition-colors ${!selectedTag
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    All
                                </button>
                                {allTags.slice(0, 6).map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => { setSelectedTag(tag === selectedTag ? null : tag); setSidebarOpen(false); }}
                                        className={`rounded-full px-3 py-1 text-xs transition-colors ${selectedTag === tag
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            )}

            {/* Main Content - Timeline */}
            <main className="flex-1 pt-16 md:ml-64 md:pt-0">
                {filteredPosts.length === 0 ? (
                    <div className="flex h-[50vh] items-center justify-center">
                        <p className="font-serif text-xl text-muted-foreground">
                            {searchQuery || selectedTag ? 'No matching stories found.' : 'No stories yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {filteredPosts.map((post, index) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group block"
                            >
                                <article
                                    className={`relative overflow-hidden ${post.coverImageSize === 'big'
                                        ? 'h-[80vh] min-h-[500px]'
                                        : post.coverImageSize === 'small'
                                            ? 'h-[50vh] min-h-[350px]'
                                            : index === 0
                                                ? 'h-[80vh] min-h-[500px]'
                                                : 'h-[50vh] min-h-[350px]'
                                        }`}
                                >
                                    {/* Background Image */}
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.coverImageAlt || post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority={index === 0}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 lg:p-16">
                                        <div className="max-w-3xl">
                                            {/* Date as timeline marker */}
                                            <time className="text-sm font-medium uppercase tracking-wider text-white/60">
                                                {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
                                            </time>

                                            {/* Title */}
                                            <h2
                                                className={`mt-3 font-serif font-bold leading-tight text-white ${post.coverImageSize === 'big'
                                                    ? 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl'
                                                    : post.coverImageSize === 'small'
                                                        ? 'text-2xl sm:text-3xl lg:text-4xl'
                                                        : index === 0
                                                            ? 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl'
                                                            : 'text-2xl sm:text-3xl lg:text-4xl'
                                                    }`}
                                            >
                                                {post.title}
                                            </h2>

                                            {/* Excerpt */}
                                            <p className="mt-4 line-clamp-2 text-lg text-white/80 sm:text-xl">
                                                {post.excerpt}
                                            </p>

                                            {/* Author */}
                                            <p className="mt-6 text-sm text-white/60">
                                                By {post.author.name}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
