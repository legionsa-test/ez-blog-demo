import { MetadataRoute } from 'next';
import { getNotionPosts } from '@/lib/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

    // Static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];

    // Fetch dynamic routes from Notion
    try {
        const posts = await getNotionPosts();

        const blogRoutes = posts
            .filter((post: any) => post.status === 'published')
            .map((post: any) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: new Date(post.publishedAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));

        return [...routes, ...blogRoutes];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return routes;
    }
}
