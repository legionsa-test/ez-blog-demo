
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './blog-post-client';
import { getNotionPosts, getNotionPage } from '@/lib/notion';
import { getRelatedPosts } from '@/lib/related-posts';
import { getPrimaryAuthor } from '@/lib/authors';
import { Post } from '@/lib/types';

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Generate static params for all Notion posts
export async function generateStaticParams() {
    const posts = await getNotionPosts();
    return posts.map((post: any) => ({
        slug: post.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params; // Await the params Promise (Next.js 15+)
    const posts = await getNotionPosts();
    const post = posts.find((p: any) => p.slug === slug && p.status === 'published');

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    const { NEXT_PUBLIC_SITE_TITLE, NEXT_PUBLIC_SITE_URL } = process.env;
    const siteTitle = NEXT_PUBLIC_SITE_TITLE || 'ezBlog';
    const siteUrl = NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

    // Generate Dynamic OG Image URL
    const ogUrl = new URL(`${siteUrl}/api/og`);
    ogUrl.searchParams.set('title', post.title);
    if (post.publishedAt) ogUrl.searchParams.set('date', post.publishedAt);
    ogUrl.searchParams.set('author', getPrimaryAuthor().name);
    if (post.coverImage) ogUrl.searchParams.set('image', post.coverImage);

    return {
        title: `${siteTitle} - ${post.title}`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [ogUrl.toString()],
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [getPrimaryAuthor().name],
            tags: post.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [ogUrl.toString()],
        },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params; // Await the params Promise (Next.js 15+)
    const allNotionPosts = await getNotionPosts();
    const notionPost = allNotionPosts.find((p: any) => p.slug === slug && p.status === 'published');

    // Server-side fetching successful
    if (notionPost && notionPost.notionId) {
        // Fetch recordMap for the content
        let recordMap = null;
        try {
            recordMap = await getNotionPage(notionPost.notionId);
        } catch (error) {
            console.error('Error fetching recordMap on server:', error);
        }

        const author = getPrimaryAuthor();

        // Construct the Post object
        const post: Post = {
            id: notionPost.notionId,
            title: notionPost.title,
            slug: notionPost.slug,
            excerpt: notionPost.excerpt || '',
            content: notionPost.content, // This might be empty or raw text, usually recordMap is used
            coverImage: notionPost.coverImage || '',
            tags: notionPost.tags || [],
            status: 'published',
            publishedAt: notionPost.publishedAt || new Date().toISOString(),
            createdAt: notionPost.publishedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author, // Use primary author for now
            notionId: notionPost.notionId,
            source: 'notion',
            readingTime: Math.ceil((notionPost.content?.length || 0) / 1000),
            categoryId: '',
            scheduledAt: null,
            // Pass coverImageAlt if it exists in notionPost logic
            ...((notionPost as any).coverImageAlt ? { coverImageAlt: (notionPost as any).coverImageAlt } : {})
        };

        // Calculate related posts on server
        // Convert allNotionPosts to Post objects partially for the helper
        const allPostsForHelper: Post[] = allNotionPosts.map((p: any) => ({
            id: p.notionId,
            title: p.title,
            slug: p.slug,
            tags: p.tags || [],
            status: 'published',
            publishedAt: p.publishedAt,
            categoryId: '',
            // minimal fields for related posts logic
        } as any));

        const relatedPosts = getRelatedPosts(post, allPostsForHelper);

        return (
            <BlogPostClient
                slug={slug}
                initialPost={post}
                initialRecordMap={recordMap}
                initialRelatedPosts={relatedPosts}
            />
        );
    }

    // If not found in Notion on server (e.g. might be a localStorage post, or new post not in ISR cache yet),
    // render Client component which will fallback to localStorage or 404.
    // We pass nulls so it triggers the client-side fetch.
    return (
        <BlogPostClient slug={slug} />
    );
}
