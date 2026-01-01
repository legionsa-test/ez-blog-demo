'use client';

import { useEffect, useState } from 'react';
import { getPublishedPosts, initializeSamplePosts } from '@/lib/storage';
import { getSiteSettings } from '@/lib/site-settings';
import { Post } from '@/lib/types';
import { EzBlog1Layout } from '@/components/themes/ezblog1';
import { AtavistLayout } from '@/components/themes/atavist';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'ezblog1' | 'atavist'>('ezblog1');

  useEffect(() => {
    initializeSamplePosts();
    const allPosts = getPublishedPosts();
    setPosts(allPosts);
    setFilteredPosts(allPosts);

    const settings = getSiteSettings();
    setTheme(settings.theme || 'ezblog1');

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

  // Render theme-specific layout
  if (theme === 'atavist') {
    return <AtavistLayout posts={filteredPosts} isLoading={isLoading} />;
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
