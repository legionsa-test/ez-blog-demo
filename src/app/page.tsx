'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, Search, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublishedPosts, initializeSamplePosts } from '@/lib/storage';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSamplePosts();
    const allPosts = getPublishedPosts();
    setPosts(allPosts);
    setFilteredPosts(allPosts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let filtered = posts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedTag, posts]);

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));
  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              The ezBlog
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Insights, tutorials, and stories about web development, design, and technology.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search articles"
              />
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedTag === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedTag === tag
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="col-span-2 h-[400px] rounded-xl" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              {searchQuery || selectedTag
                ? 'No articles found matching your criteria.'
                : 'No articles yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="group block">
                <article className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50 transition-all hover:shadow-lg hover:ring-primary/20">
                  <div className="grid gap-0 lg:grid-cols-2">
                    <div className="relative aspect-[16/10] lg:aspect-auto">
                      {featuredPost.coverImage ? (
                        <Image
                          src={featuredPost.coverImage}
                          alt={featuredPost.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          priority
                        />
                      ) : (
                        <div className="flex h-full min-h-[300px] items-center justify-center bg-muted">
                          <span className="text-6xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8 lg:p-12">
                      <div className="flex flex-wrap gap-2">
                        {featuredPost.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl lg:text-4xl">
                        {featuredPost.title}
                      </h2>
                      <p className="mt-4 line-clamp-3 text-muted-foreground">
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
                      <div className="mt-6">
                        <span className="inline-flex items-center text-sm font-medium text-primary">
                          Read article
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Post Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
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
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <span className="text-4xl">📝</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
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
        <CardFooter className="flex items-center gap-4 border-t border-border/40 px-5 py-4 text-xs text-muted-foreground">
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
