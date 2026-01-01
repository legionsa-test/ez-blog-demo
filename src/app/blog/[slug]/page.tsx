'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getPostBySlug, getPublishedPosts } from '@/lib/storage';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const foundPost = getPostBySlug(slug);
        if (foundPost && foundPost.status === 'published') {
            setPost(foundPost);

            // Find related posts based on tags
            const allPosts = getPublishedPosts();
            const related = allPosts
                .filter((p) => p.id !== foundPost.id)
                .filter((p) => p.tags.some((tag) => foundPost.tags.includes(tag)))
                .slice(0, 3);
            setRelatedPosts(related);
        } else {
            setNotFound(true);
        }
        setIsLoading(false);
    }, [slug]);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <Skeleton className="mb-8 h-8 w-32" />
                <Skeleton className="mb-4 h-12 w-3/4" />
                <Skeleton className="mb-8 h-6 w-1/2" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-foreground">Post Not Found</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    The post you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button asChild className="mt-8">
                    <Link href="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Back to Blog
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Button asChild variant="ghost" className="mb-8">
                <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Back to Blog
                </Link>
            </Button>

            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            <Tag className="mr-1 h-3 w-3" aria-hidden="true" />
                            {tag}
                        </Badge>
                    ))}
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
                )}

                {/* Meta */}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>
                                <User className="h-4 w-4" aria-hidden="true" />
                            </AvatarFallback>
                        </Avatar>
                        <span>{post.author.name}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        {post.readingTime} min read
                    </span>
                </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
                <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-xl">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Content */}
            <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="mt-16 border-t border-border pt-8" aria-labelledby="related-heading">
                    <h2 id="related-heading" className="text-2xl font-bold tracking-tight text-foreground">
                        Related Posts
                    </h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((relatedPost) => (
                            <Link
                                key={relatedPost.id}
                                href={`/blog/${relatedPost.slug}`}
                                className="group block rounded-lg border border-border p-4 transition-colors hover:border-primary/20 hover:bg-muted/50"
                            >
                                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                                    {relatedPost.title}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                    {relatedPost.excerpt}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}
