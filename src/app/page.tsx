'use client';

import { useEffect, useState } from 'react';
import { getPublishedPosts, initializeSamplePosts, savePost } from '@/lib/storage';
import { getSiteSettings } from '@/lib/site-settings';
import { getPrimaryAuthor } from '@/lib/authors';
import { Post } from '@/lib/types';
import { EzBlog1Layout } from '@/components/themes/ezblog1';
import { AtavistLayout } from '@/components/themes/atavist';
import { SupersimpleLayout } from '@/components/themes/supersimple';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'ezblog1' | 'atavist' | 'supersimple'>('ezblog1');

  useEffect(() => {
    const loadContent = async () => {
      initializeSamplePosts();
      const settings = getSiteSettings();
      setTheme(settings.theme || 'ezblog1');

      // If Notion URL is configured, fetch from server API
      if (settings.notionPageUrl) {
        try {
          const response = await fetch('/api/notion/content');
          const data = await response.json();

          if (data.posts && data.posts.length > 0) {
            const author = getPrimaryAuthor();

            // Merge Notion posts with local posts
            const notionPosts: Post[] = data.posts
              .filter((p: any) => p.status === 'published')
              .map((post: any) => ({
                id: post.notionId,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || '',
                content: post.content,
                coverImage: post.coverImage || '',
                tags: post.tags || [],
                status: 'published' as const,
                publishedAt: post.publishedAt || new Date().toISOString(),
                createdAt: post.publishedAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author,
                notionId: post.notionId,
                source: 'notion' as const,
              }));

            // Get local posts (non-Notion)
            const localPosts = getPublishedPosts().filter(p => p.source !== 'notion');

            // Combine: Notion posts + local posts
            const allPosts = [...notionPosts, ...localPosts];
            setPosts(allPosts);
            setFilteredPosts(allPosts);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching Notion content:', error);
        }
      }

      // Fallback to local posts
      const allPosts = getPublishedPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts);
      setIsLoading(false);
    };

    loadContent();
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

  // Render theme-specific layout
  if (theme === 'atavist') {
    return <AtavistLayout posts={filteredPosts} isLoading={isLoading} />;
  }

  if (theme === 'supersimple') {
    return <SupersimpleLayout posts={filteredPosts} isLoading={isLoading} />;
  }

  // Default: ezBlog1 layout
  return (
    <EzBlog1Layout
      posts={posts}
      filteredPosts={filteredPosts}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
      isLoading={isLoading}
    />
  );
}
