'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User, Menu, X, Eye, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton'; // Keep generic skeleton for parts if needed
import { BlogPostSkeleton } from '@/components/blog-post-skeleton'; // Use new full page skeleton
import { Separator } from '@/components/ui/separator';
import { TableOfContents } from '@/components/table-of-contents';
import { ReadingProgress } from '@/components/reading-progress';
import { ShareButtons } from '@/components/share-buttons';
import { ImageLightbox, useLightbox } from '@/components/image-lightbox';
import { NotionPageRenderer } from '@/components/notion-renderer';
import { NotionTableOfContents } from '@/components/notion-table-of-contents';
import { getPostBySlug, getPublishedPosts } from '@/lib/storage';
import { incrementViewCount, updateReadingHistory } from '@/lib/analytics';
import { generatePostJsonLd, generateBreadcrumbJsonLd } from '@/lib/json-ld';
import { Post } from '@/lib/types';
import { format } from 'date-fns';
import type { ExtendedRecordMap } from 'notion-types';
import { getRelatedPosts } from '@/lib/related-posts';
import GiscusComments from '@/components/giscus';

// Add IDs to headings in HTML content
function addHeadingIds(html: string): string {
    let index = 0;
    return html.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
        const text = content.replace(/<[^>]*>/g, '');
        const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `heading-${index++}`;
        return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    });
}

interface BlogPostClientProps {
    initialPost?: Post | null;
    initialRecordMap?: ExtendedRecordMap | null;
    initialRelatedPosts?: Post[];
    slug: string;
}

export default function BlogPostClient({
    initialPost = null,
    initialRecordMap = null,
    initialRelatedPosts = [],
    slug
}: BlogPostClientProps) {
    const [post, setPost] = useState<Post | null>(initialPost);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>(initialRelatedPosts || []);
    const [isLoading, setIsLoading] = useState(!initialPost);
    const [notFound, setNotFound] = useState(false);
    const [showMobileToc, setShowMobileToc] = useState(false);
    const [viewCount, setViewCount] = useState(0);
    const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(initialRecordMap);
    const [notionId, setNotionId] = useState<string | null>(initialPost?.notionId || null);
    const { lightboxImage, closeLightbox } = useLightbox();

    // Load data if not provided (fallback to localStorage or purely client-side fetch)
    useEffect(() => {
        const loadPost = async () => {
            // If we already have the post from server, just update view count and history
            if (initialPost) {
                const count = incrementViewCount(slug);
                setViewCount(count);
                setIsLoading(false);
                return;
            }

            // Fallback: Check localStorage
            let foundPost = getPostBySlug(slug);

            if (foundPost && foundPost.status === 'published') {
                setPost(foundPost);

                // Track views
                const count = incrementViewCount(slug);
                setViewCount(count);

                // Find related posts (client-side calculation for localStorage posts)
                const allPosts = getPublishedPosts();
                const related = getRelatedPosts(foundPost, allPosts);
                setRelatedPosts(related);
            } else {
                setNotFound(true);
            }
            setIsLoading(false);
        };

        loadPost();
    }, [slug, initialPost]);

    // Update document title
    useEffect(() => {
        if (post) {
            const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'ezBlog';
            document.title = `${siteTitle} - ${post.title}`;
        }
    }, [post]);

    // Track reading progress
    useEffect(() => {
        if (!post) return;

        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            updateReadingHistory(post.slug, post.title, post.coverImage, progress);
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateProgress);
    }, [post]);

    if (isLoading) {
        return <BlogPostSkeleton />;
    }

    if (notFound || !post) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-foreground">Post Not Found</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    The post you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button asChild className="mt-8">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Back to Blog
                    </Link>
                </Button>
            </div>
        );
    }

    const contentWithIds = !recordMap ? addHeadingIds(post.content) : '';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
    const postJsonLd = generatePostJsonLd(post, siteUrl);
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
        { name: 'Blog', url: '/' },
        { name: post.title, url: `/blog/${post.slug}` },
    ], siteUrl);

    // Dynamic blur URL (generic)
    const genericBlur = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRktHh8P/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==";

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Reading Progress Bar */}
            <ReadingProgress />

            <article>
                {/* Hero Header Section */}
                <header className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        {/* Back Button */}
                        <Button asChild variant="ghost" size="sm" className="mb-6">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                                Back to Blog
                            </Link>
                        </Button>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-sm">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback>
                                        <User className="h-5 w-5" aria-hidden="true" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{post.author.name}</p>
                                    <p className="text-xs">{post.author.bio}</p>
                                </div>
                            </div>
                            <Separator orientation="vertical" className="h-8 hidden sm:block" />
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" aria-hidden="true" />
                                    {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                    {post.readingTime} min read
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                    {viewCount} views
                                </span>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="mt-6">
                            <ShareButtons title={post.title} description={post.excerpt} />
                        </div>
                    </div>

                    {/* Cover Image - Full Width */}
                    {post.coverImage && (
                        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
                            <div className="relative aspect-[2/1] overflow-hidden rounded-xl shadow-lg">
                                <Image
                                    src={post.coverImage}
                                    alt={(post as any).coverImageAlt || post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    placeholder="blur"
                                    blurDataURL={genericBlur}
                                />
                            </div>
                        </div>
                    )}
                </header>

                {/* Content Area with TOC Sidebar */}
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                        {/* Mobile TOC Toggle */}
                        <div className="mb-6 lg:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMobileToc(!showMobileToc)}
                                className="w-full justify-between"
                            >
                                <span>Table of Contents</span>
                                {showMobileToc ? (
                                    <X className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Menu className="h-4 w-4" aria-hidden="true" />
                                )}
                            </Button>
                            {showMobileToc && (
                                <div className="mt-4 rounded-lg border border-border bg-card p-4">
                                    {recordMap ? <NotionTableOfContents /> : <TableOfContents content={post.content} />}
                                </div>
                            )}
                        </div>

                        {/* Desktop TOC Sidebar - Left */}
                        <aside className="hidden lg:col-span-3 lg:block">
                            <div className="sticky top-24">
                                {recordMap ? <NotionTableOfContents /> : <TableOfContents content={post.content} />}

                                {/* Share buttons in sidebar */}
                                <div className="mt-8 pt-8 border-t border-border">
                                    <ShareButtons title={post.title} description={post.excerpt} />
                                </div>
                            </div>
                        </aside>

                        {/* Main Content - Right */}
                        <div className="lg:col-span-9">
                            {/* Use NotionPageRenderer for Notion content when recordMap is available */}
                            {recordMap ? (
                                <NotionPageRenderer
                                    recordMap={recordMap}
                                    rootPageId={notionId || undefined}
                                    fullPage={false}
                                    darkMode={false}
                                    previewImages={true}
                                    className="notion-content"
                                />
                            ) : (
                                <div
                                    className="prose prose-lg max-w-none dark:prose-invert 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-img:rounded-xl prose-img:shadow-md
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border"
                                    dangerouslySetInnerHTML={{ __html: contentWithIds }}
                                />
                            )}

                            {/* Bottom Navigation - Aligned with content */}
                            <div className="mt-8 border-b border-border/40 pb-6">
                                <div className="flex items-center justify-between">
                                    <Button asChild variant="ghost" size="sm" className="-ml-3 h-8">
                                        <Link href="/">
                                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                                            Back
                                        </Link>
                                    </Button>
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Top
                                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            {/* Comments */}
                            <GiscusComments />
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="border-t border-border/40 bg-muted/30 py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                You might also like
                            </h2>
                            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {relatedPosts.map((relatedPost) => (
                                    <Link
                                        key={relatedPost.id}
                                        href={`/blog/${relatedPost.slug}`}
                                        className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/20"
                                    >
                                        {relatedPost.coverImage && (
                                            <div className="relative aspect-[16/9] overflow-hidden">
                                                <Image
                                                    src={relatedPost.coverImage}
                                                    alt={relatedPost.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                {relatedPost.excerpt}
                                            </p>
                                            <p className="mt-3 text-xs text-muted-foreground">
                                                {format(new Date(relatedPost.publishedAt || relatedPost.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>

            {/* Image Lightbox */}
            {lightboxImage && (
                <ImageLightbox
                    src={lightboxImage.src}
                    alt={lightboxImage.alt}
                    onClose={closeLightbox}
                />
            )}
        </>
    );
}
