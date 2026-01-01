'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublishedPosts, initializeSamplePosts } from '@/lib/storage';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSamplePosts();
    const allPosts = getPublishedPosts();
    setPosts(allPosts);
    setIsLoading(false);
  }, []);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 blur-3xl">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-30" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
            >
              Share Your Stories with{' '}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                ezBlog
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              A modern, beautiful blog platform that lets you focus on what matters most - your
              content. No databases, no complex setup, just pure creativity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button asChild size="lg">
                <Link href="/blog">
                  Explore Blog
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Start Writing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {isLoading ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </section>
      ) : featuredPost ? (
        <section
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="featured-heading"
        >
          <h2 id="featured-heading" className="sr-only">
            Featured Post
          </h2>
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <article className="relative overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border/50 transition-all hover:shadow-xl hover:ring-primary/20">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="relative aspect-[16/10] md:aspect-auto">
                  {featuredPost.coverImage ? (
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                  <div className="absolute left-4 top-4">
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8">
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                    {featuredPost.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-muted-foreground">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {format(new Date(featuredPost.publishedAt || featuredPost.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {featuredPost.readingTime} min read
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </section>
      ) : null}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section
          className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
          aria-labelledby="recent-heading"
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 id="recent-heading" className="text-2xl font-bold tracking-tight text-foreground">
              Recent Posts
            </h2>
            <Button asChild variant="ghost">
              <Link href="/blog">
                View all
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section
        className="border-t border-border/40 bg-muted/30 py-16"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              Ready to start writing?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of writers who use ezBlog to share their stories with the world.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:ring-1 hover:ring-primary/20">
        <CardHeader className="p-0">
          <div className="relative aspect-[16/10] overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <span className="text-4xl">📝</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        </CardContent>
        <CardFooter className="flex items-center gap-4 border-t border-border/40 p-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {post.readingTime} min
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
