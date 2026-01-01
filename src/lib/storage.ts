'use client';

import { Post, Author } from './types';

import { getPrimaryAuthor, saveAuthor as saveAuthorToStorage } from './authors';

const STORAGE_KEY = 'ezblog_posts';

// Default author (deprecated, use authors.ts)
const defaultAuthor: Author = {
    id: 'default',
    name: 'Admin',
    avatar: '/avatar.svg',
    bio: 'Blog administrator',
};

// Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

// Get all posts from localStorage
export function getPosts(): Post[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Get published posts only
export function getPublishedPosts(): Post[] {
    return getPosts().filter((post) => post.status === 'published');
}

// Get a single post by slug
export function getPostBySlug(slug: string): Post | null {
    const posts = getPosts();
    return posts.find((post) => post.slug === slug) || null;
}

// Get a single post by ID
export function getPostById(id: string): Post | null {
    const posts = getPosts();
    return posts.find((post) => post.id === id) || null;
}

// Save a post (create or update)
export function savePost(post: Partial<Post> & { title: string; content: string }): Post {
    const posts = getPosts();
    // Use the primary author for new posts if not specified
    const author = post.author || getPrimaryAuthor();
    const now = new Date().toISOString();

    if (post.id) {
        // Update existing post
        const index = posts.findIndex((p) => p.id === post.id);
        if (index !== -1) {
            const updatedPost: Post = {
                ...posts[index],
                ...post,
                slug: post.slug || generateSlug(post.title),
                updatedAt: now,
                readingTime: calculateReadingTime(post.content),
                publishedAt: post.status === 'published' && !posts[index].publishedAt ? now : posts[index].publishedAt,
            };
            posts[index] = updatedPost;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
            return updatedPost;
        }
    }

    // Create new post
    const newPost: Post = {
        id: generateId(),
        slug: post.slug || generateSlug(post.title),
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        coverImage: post.coverImage || '',
        author,
        tags: post.tags || [],
        categoryId: post.categoryId || null,
        status: post.status || 'draft',
        scheduledAt: post.scheduledAt || null,
        createdAt: now,
        updatedAt: now,
        publishedAt: post.status === 'published' ? now : null,
        readingTime: calculateReadingTime(post.content),
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return newPost;
}

// Delete a post
export function deletePost(id: string): boolean {
    const posts = getPosts();
    const filteredPosts = posts.filter((post) => post.id !== id);
    if (filteredPosts.length !== posts.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));
        return true;
    }
    return false;
}

// Get author info (Deprecated: use authors.ts)
export function getAuthor(): Author {
    return getPrimaryAuthor();
}

// Save author info (Deprecated: use authors.ts)
export function saveAuthor(author: Author): void {
    saveAuthorToStorage(author);
}

// Export posts as JSON
export function exportPosts(): string {
    const posts = getPosts();
    return JSON.stringify(posts, null, 2);
}

// Import posts from JSON
export function importPosts(json: string): boolean {
    try {
        const posts = JSON.parse(json) as Post[];
        if (Array.isArray(posts)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// Initialize with sample post if empty
export function initializeSamplePosts(): void {
    const posts = getPosts();
    if (posts.length === 0) {
        const samplePost = {
            title: 'Welcome to ezBlog',
            excerpt: 'This is your first blog post. Edit or delete it, then start writing!',
            content: `
        <h2>Welcome to ezBlog!</h2>
        <p>This is a sample blog post to help you get started. ezBlog is a modern, headless CMS that stores your content locally in your browser.</p>
        <h3>Features</h3>
        <ul>
          <li>Beautiful, responsive design with dark/light mode</li>
          <li>Rich text editing with Tiptap</li>
          <li>Import images from Unsplash</li>
          <li>SEO-friendly with proper meta tags</li>
          <li>No database required - content stored locally</li>
        </ul>
        <p>Start creating amazing content today!</p>
      `,
            coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200',
            tags: ['welcome', 'tutorial'],
            categoryId: null,
            status: 'published' as const,
            scheduledAt: null,
        };
        savePost(samplePost);
    }
}
