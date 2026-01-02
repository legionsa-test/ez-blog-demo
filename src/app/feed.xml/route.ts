import { fetchNotionContent } from '@/lib/notion';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'ezBlog';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Insights, stories, and ideas.';

  // Fetch Notion posts (server-safe)
  let posts: any[] = [];
  try {
    const notionData = await fetchNotionContent();
    if (notionData.posts) {
      posts = notionData.posts.filter((p: any) => p.status === 'published');
    }
  } catch (error) {
    console.error('Failed to fetch Notion posts for RSS:', error);
  }

  // Sort by date
  posts.sort((a, b) =>
    new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime()
  );

  // Escape XML special characters
  const escapeXml = (str: string) => {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const rssItems = posts.map(post => {
    const link = `${siteUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.publishedAt || post.createdAt || Date.now()).toUTCString();
    const description = escapeXml(post.excerpt || '');

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
