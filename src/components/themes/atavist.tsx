'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

interface AtavistLayoutProps {
    posts: Post[];
    isLoading: boolean;
}

export function AtavistLayout({ posts, isLoading }: AtavistLayoutProps) {
    const heroPost = posts[0];
    const secondaryPosts = posts.slice(1, 3);
    const remainingPosts = posts.slice(3);

    if (isLoading) {
        return (
            <div className="min-h-screen animate-pulse">
                <div className="h-[70vh] bg-muted" />
                <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
                    <div className="h-48 rounded bg-muted" />
                    <div className="h-48 rounded bg-muted" />
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-xl text-muted-foreground">No stories yet.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Story */}
            {heroPost && (
                <Link href={`/blog/${heroPost.slug}`} className="group block">
                    <article className="relative h-[70vh] min-h-[500px] overflow-hidden">
                        {heroPost.coverImage ? (
                            <Image
                                src={heroPost.coverImage}
                                alt={heroPost.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 lg:p-16">
                            <div className="mx-auto w-full max-w-4xl">
                                <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                                    {heroPost.title}
                                </h1>
                                <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
                                    {heroPost.excerpt}
                                </p>
                                <p className="mt-6 text-sm text-white/60">
                                    By {heroPost.author.name}
                                </p>
                            </div>
                        </div>
                    </article>
                </Link>
            )}

            {/* Secondary Stories */}
            {secondaryPosts.length > 0 && (
                <section className="border-b border-border/40">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2">
                            {secondaryPosts.map((post, index) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className={`group block border-border/40 ${index === 0 ? 'md:border-r' : ''}`}
                                >
                                    <article className="relative aspect-[4/3] overflow-hidden">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                                            <h2 className="font-serif text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                                                {post.title}
                                            </h2>
                                            <p className="mt-3 text-sm text-white/70">
                                                By {post.author.name}
                                            </p>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Remaining Stories List */}
            {remainingPosts.length > 0 && (
                <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="divide-y divide-border/40">
                        {remainingPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group block py-8 first:pt-0 last:pb-0"
                            >
                                <article className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                                    {post.coverImage && (
                                        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded sm:aspect-square sm:w-32">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                                            {post.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-muted-foreground">
                                            {post.excerpt}
                                        </p>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            By {post.author.name} · {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
