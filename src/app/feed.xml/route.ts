
import { getPublishedPosts } from '@/lib/storage';
import { getSiteSettings } from '@/lib/site-settings';
import { fetchNotionContent } from '@/lib/notion';
import { Post } from '@/lib/types';
import { format } from 'date-fns';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  // Fetch settings
  const settings = getSiteSettings();
  const siteTitle = settings?.title || 'ezBlog';
  const siteDescription = settings?.description || 'Insights, stories, and ideas.';

  // Fetch Local posts
  const localPosts = getPublishedPosts();

  // Fetch Notion posts
  let notionPosts: Post[] = [];
  try {
    const notionData = await fetchNotionContent();
    if (notionData.posts) {
      notionPosts = notionData.posts.filter((p: any) => p.status === 'published');
    }
  } catch (error) {
    console.error('Failed to fetch Notion posts for RSS:', error);
  }

  // Merge posts (Notion wins on conflict)
  const notionSlugs = new Set(notionPosts.map(p => p.slug));
  const uniqueLocalPosts = localPosts.filter(p => !notionSlugs.has(p.slug));

  const allPosts = [...notionPosts, ...uniqueLocalPosts].sort((a, b) =>
    new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );

  // Escape XML special characters
  const escapeXml = (str: string) => str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });

  const rssItems = allPosts.map(post => {
    const link = `${siteUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();
    const description = escapeXml(post.excerpt || '');

    // CData for HTML content if needed, but standard description is usually text
    // We'll use content:encoded for full HTML content if supported, otherwise just description
    // For simplicity and compatibility, we stick to standard fields

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
