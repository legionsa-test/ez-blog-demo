import { Post } from './types';

// Generate JSON-LD structured data for a blog post
export function generatePostJsonLd(post: Post, siteUrl: string = 'https://yourdomain.com') {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage || undefined,
        author: {
            '@type': 'Person',
            name: post.author.name,
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/blog/${post.slug}`,
        },
        publisher: {
            '@type': 'Organization',
            name: 'ezBlog',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.png`,
            },
        },
        wordCount: post.content.split(/\s+/).length,
        timeRequired: `PT${post.readingTime}M`,
        keywords: post.tags.join(', '),
    };
}

// Generate JSON-LD for blog listing page
export function generateBlogJsonLd(siteUrl: string = 'https://yourdomain.com') {
    return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'ezBlog',
        description: 'Insights, tutorials, and stories about web development, design, and technology.',
        url: siteUrl,
        publisher: {
            '@type': 'Organization',
            name: 'ezBlog',
        },
    };
}

// Generate breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(
    items: { name: string; url: string }[],
    siteUrl: string = 'https://yourdomain.com'
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
        })),
    };
}
