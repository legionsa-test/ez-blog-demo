
import HomeClient from './home-client';
import { getNotionPosts } from '@/lib/notion';
import { getPrimaryAuthor } from '@/lib/authors';
import { Post } from '@/lib/types';

// ISR Revalidation (1 hour)
export const revalidate = 3600;

export default async function HomePage() {
  let notionPosts: Post[] = [];

  try {
    // Server-side fetch for ISR
    const rawPosts = await getNotionPosts();

    if (rawPosts && rawPosts.length > 0) {
      const author = getPrimaryAuthor();

      notionPosts = rawPosts
        .filter((p: any) => p.status === 'published')
        .map((p: any) => ({
          id: p.notionId,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || '',
          content: p.content,
          coverImage: p.coverImage || '',
          coverImageSize: p.coverImageSize,
          tags: p.tags || [],
          status: 'published' as const,
          publishedAt: p.publishedAt || new Date().toISOString(),
          createdAt: p.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author,
          notionId: p.notionId,
          source: 'notion' as const,
          categoryId: '',
          scheduledAt: null,
          readingTime: Math.ceil((p.content?.length || 0) / 1000), // Estimate
        }));
    }
  } catch (error) {
    console.error('Error fetching Notion posts on server:', error);
  }

  // Pass initial posts to client component
  return <HomeClient initialPosts={notionPosts} />;
}
