import { NextResponse } from 'next/server';
import { NotionAPI } from 'notion-client';
import sanitizeHtml from 'sanitize-html';

// Create Notion client
const notion = new NotionAPI();

// Cache duration in seconds (5 minutes like Nobelium)
const REVALIDATE_SECONDS = 300;

// In-memory cache for server-side
let postsCache: any[] | null = null;
let pagesCache: any[] | null = null;
let lastFetchTime: number = 0;

// Sanitize HTML config (updated for embeds)
const sanitizeConfig = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'strong', 'em', 'b', 'i', 'u', 's', 'del',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        'iframe', 'video', 'source', 'object', 'embed'
    ],
    allowedAttributes: {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height'],
        'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'style', 'class'],
        'video': ['src', 'controls', 'width', 'height', 'poster', 'autoplay', 'loop', 'muted', 'playsinline'],
        'source': ['src', 'type'],
        'object': ['data', 'type', 'width', 'height'],
        'embed': ['src', 'type', 'width', 'height'],
        '*': ['class', 'id', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: true,
};

// Helper to extract text from Notion properties
function extractText(textArray: any): string {
    if (!textArray) return '';
    if (typeof textArray === 'string') return textArray;
    if (Array.isArray(textArray)) {
        return textArray.map((item: any) => {
            if (typeof item === 'string') return item;
            if (Array.isArray(item) && item[0]) return item[0];
            return '';
        }).join('');
    }
    return '';
}

// Convert Notion blocks to HTML
function blocksToHtml(recordMap: any, pageId: string): string {
    if (!recordMap?.block) return '';

    const blocks = recordMap.block;
    let html = '';

    const processBlock = (blockId: string): string => {
        const block = blocks[blockId]?.value;
        if (!block) return '';

        const { type, properties, format } = block;

        switch (type) {
            case 'header':
            case 'heading_1':
                return `<h2>${extractText(properties?.title)}</h2>`;
            case 'sub_header':
            case 'heading_2':
                return `<h3>${extractText(properties?.title)}</h3>`;
            case 'sub_sub_header':
            case 'heading_3':
                return `<h4>${extractText(properties?.title)}</h4>`;
            case 'text':
            case 'paragraph':
                const text = extractText(properties?.title);
                return text ? `<p>${text}</p>` : '';
            case 'bulleted_list':
                return `<li>${extractText(properties?.title)}</li>`;
            case 'numbered_list':
                return `<li>${extractText(properties?.title)}</li>`;
            case 'quote':
                return `<blockquote>${extractText(properties?.title)}</blockquote>`;
            case 'code':
                return `<pre><code>${extractText(properties?.title)}</code></pre>`;
            case 'image':
                const imgSrc = format?.display_source || properties?.source?.[0]?.[0];
                const imgCaption = extractText(properties?.caption);
                return imgSrc ?
                    `<figure><img src="${imgSrc}" alt="${imgCaption || 'Image'}" /><figcaption>${imgCaption}</figcaption></figure>`
                    : '';
            case 'divider':
                return '<hr />';

            // --- Embed Support ---

            case 'video': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';

                // YouTube/Vimeo (Standard Notion Embeds often come as "video" type)
                if (source.includes('youtube.com') || source.includes('youtu.be') || source.includes('vimeo.com')) {
                    // Convert standard Watch URLs to Embed URLs if needed
                    let embedUrl = source;
                    if (source.includes('youtube.com/watch?v=')) {
                        const videoId = source.split('v=')[1]?.split('&')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (source.includes('youtu.be/')) {
                        const videoId = source.split('youtu.be/')[1];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (source.includes('vimeo.com/')) {
                        const videoId = source.split('vimeo.com/')[1];
                        embedUrl = `https://player.vimeo.com/video/${videoId}`;
                    }

                    return `<div class="aspect-video w-full my-4"><iframe src="${embedUrl}" class="w-full h-full rounded-lg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                }

                // Direct video file
                return `<video src="${source}" controls class="w-full rounded-lg my-4"></video>`;
            }

            case 'tweet': {
                const source = properties?.source?.[0]?.[0];
                if (!source) return '';
                // Simple link fallback or iframe if Notion format provides it (often standard embed iframe is safer)
                // For a robust implementation, a client-side tweet renderer is best, but for static HTML:
                return `<div class="my-4 flex justify-center"><blockquote class="twitter-tweet"><a href="${source}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></div>`;
            }

            case 'bookmark': {
                const link = properties?.link?.[0]?.[0];
                const title = extractText(properties?.title) || link;
                const description = extractText(properties?.description);
                const cover = format?.bookmark_cover;

                return `
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class="not-prose block my-4 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-muted/50 no-underline">
                        <div class="flex h-full">
                            <div class="flex-1 p-4">
                                <div class="font-medium text-foreground line-clamp-1">${title}</div>
                                ${description ? `<div class="mt-1 text-sm text-muted-foreground line-clamp-2">${description}</div>` : ''}
                                <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span class="truncate">${link}</span>
                                </div>
                            </div>
                            ${cover ? `<div class="relative w-1/3 min-w-[120px] bg-muted"><img src="${cover}" alt="${title}" class="absolute inset-0 h-full w-full object-cover" /></div>` : ''}
                        </div>
                    </a>
                `;
            }

            case 'embed':
            case 'maps':
            case 'figma':
            case 'typeform':
            case 'codepen':
            case 'gist': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';

                let embedSrc = source;
                // Handle Figma specifically
                if (source.includes('figma.com/file') || source.includes('figma.com/proto') || source.includes('figma.com/design')) {
                    if (!source.includes('embed_host')) {
                        embedSrc = `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(source)}`;
                    }
                }

                // Generic iframe embed handling
                return `<div class="aspect-video w-full my-4"><iframe src="${embedSrc}" class="w-full h-full rounded-lg bg-muted" frameborder="0" allowfullscreen></iframe></div>`;
            }

            case 'drive':
            case 'google_drive': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';
                return `<div class="w-full my-4"><iframe src="${source}" class="w-full h-[500px] rounded-lg border border-border" frameborder="0" allowfullscreen></iframe></div>`;
            }

            case 'pdf': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';

                // Use Google Docs viewer/standard object embed
                return `<div class="w-full h-[600px] my-4"><object data="${source}" type="application/pdf" class="w-full h-full rounded-lg border border-border"><p>Unable to display PDF file. <a href="${source}">Download</a> instead.</p></object></div>`;
            }

            case 'file': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                const caption = extractText(properties?.caption) || source?.split('/').pop() || 'Download File';
                if (!source) return '';

                return `<a href="${source}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 my-4"><span class="font-medium">${caption}</span></a>`;
            }

            // --- End Embed Support ---

            default:
                return '';
        }
    };

    // Get page block and its content
    const pageBlock = blocks[pageId]?.value;
    if (pageBlock?.content) {
        for (const childId of pageBlock.content) {
            html += processBlock(childId);
        }
    }

    // Sanitize HTML to prevent XSS (but allow new embed tags)
    // Note: We deliberately allow specific iframe sources via trusted extraction logic above
    return sanitizeHtml(html, sanitizeConfig);
}

// Extract database rows from Notion record map
function extractDatabaseRows(recordMap: any): any[] {
    const rows: any[] = [];

    if (!recordMap?.collection || !recordMap?.block) {
        return rows;
    }

    const collectionId = Object.keys(recordMap.collection)[0];
    const collection = recordMap.collection[collectionId]?.value;
    const schema = collection?.schema || {};

    for (const [blockId, blockData] of Object.entries(recordMap.block)) {
        const block = (blockData as any)?.value;
        if (!block || block.type !== 'page' || block.parent_table !== 'collection') {
            continue;
        }

        const properties = block.properties || {};
        const row: any = {
            id: blockId,
            properties: {}
        };

        for (const [propId, propDef] of Object.entries(schema)) {
            const def = propDef as any;
            const value = properties[propId];
            const propName = def.name?.toLowerCase();

            if (!propName) continue;

            switch (def.type) {
                case 'title':
                    row.properties.title = extractText(value);
                    break;
                case 'text':
                case 'rich_text':
                    row.properties[propName] = extractText(value);
                    break;
                case 'select':
                    // Select returns single value as string
                    if (value && value[0]) {
                        row.properties[propName] = value[0][0] || '';
                    }
                    break;
                case 'multi_select':
                    // Multi-select returns array
                    if (value && value[0]) {
                        row.properties[propName] = value[0][0]?.split(',').map((t: string) => t.trim()) || [];
                    }
                    break;
                case 'date':
                    if (value && value[0] && value[0][1]) {
                        const dateData = value[0][1][0];
                        row.properties[propName] = dateData?.[1]?.start_date || null;
                    }
                    break;
                case 'checkbox':
                    row.properties[propName] = value?.[0]?.[0] === 'Yes';
                    break;
                case 'url':
                    row.properties[propName] = value?.[0]?.[0] || '';
                    break;
                case 'file':
                    if (value?.[0]?.[1]?.[0]?.[1]) {
                        row.properties[propName] = value[0][1][0][1];
                    }
                    break;
            }
        }

        if (row.properties.title) {
            rows.push(row);
        }
    }

    return rows;
}

// Fetch and parse Notion content
async function fetchNotionContent(pageUrl: string) {
    // Extract page ID from URL
    const urlParts = pageUrl.split('/').pop()?.split('-') || [];
    let pageId = urlParts[urlParts.length - 1] || '';

    if (pageId.length === 32) {
        pageId = `${pageId.slice(0, 8)}-${pageId.slice(8, 12)}-${pageId.slice(12, 16)}-${pageId.slice(16, 20)}-${pageId.slice(20)}`;
    }

    const recordMap = await notion.getPage(pageId);
    const hasCollection = recordMap?.collection && Object.keys(recordMap.collection).length > 0;

    if (!hasCollection) {
        // Single page
        const block = recordMap?.block?.[pageId]?.value;
        const title = extractText(block?.properties?.title) || 'Untitled';
        const content = blocksToHtml(recordMap, pageId);
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        return {
            posts: [{
                notionId: pageId,
                title,
                slug,
                excerpt: '',
                content,
                coverImage: block?.format?.page_cover || '',
                tags: [],
                status: 'published',
                publishedAt: new Date().toISOString(),
                contentType: 'post',
            }],
            pages: [],
        };
    }

    // Database
    const rows = extractDatabaseRows(recordMap);
    const items = await Promise.all(
        rows.map(async (row) => {
            try {
                const pageRecordMap = await notion.getPage(row.id);
                const content = blocksToHtml(pageRecordMap, row.id);

                const props = row.properties;

                // Title: already extracted as 'title' from title type
                const title = props.title || 'Untitled';

                // Slug: check multiple possible column names
                const slug = props.slug || props.url || props.permalink ||
                    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                // Type: check for 'type' or 'contenttype' property
                const typeValue = String(props.type || props.contenttype || props['content type'] || 'post').toLowerCase();
                const contentType = typeValue === 'page' ? 'page' : 'post';

                // Status: check for 'published' in status field (case-insensitive)
                const statusValue = String(props.status || '').toLowerCase();
                const isPublished = statusValue === 'published' || props.published === true;

                // Excerpt/Summary: check multiple possible column names
                const excerpt = props.summary || props.excerpt || props.description ||
                    props.subtitle || props.intro || '';

                // Tags: ensure it's an array
                let tags = props.tags || props.categories || props.labels || [];
                if (typeof tags === 'string') {
                    tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
                }

                // Date: check multiple possible column names
                const publishedAt = props.date || props.published_date || props.publishedat ||
                    props['publish date'] || props.created || null;

                // Cover Image: check multiple possible column names
                const coverImage = props['hero image'] || props['heroimage'] || props['hero_image'] ||
                    props.cover || props.image || props.thumbnail || props.banner || '';

                // Hero Size: check multiple possible column names (Big or Small)
                const heroSizeValue = String(
                    props['hero size'] ||
                    props['Hero Size'] ||
                    props['herosize'] ||
                    props['hero_size'] ||
                    props['HeroSize'] ||
                    ''
                ).toLowerCase();
                const coverImageSize = heroSizeValue === 'big' ? 'big' : heroSizeValue === 'small' ? 'small' : undefined;

                return {
                    notionId: row.id,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage,
                    coverImageSize,
                    tags,
                    status: isPublished ? 'published' : 'draft',
                    publishedAt,
                    contentType,
                };
            } catch (e) {
                console.error('Error fetching page content:', row.id, e);
                return null;
            }
        })
    );

    const validItems = items.filter(Boolean);
    return {
        posts: validItems.filter((item: any) => item.contentType === 'post'),
        pages: validItems.filter((item: any) => item.contentType === 'page'),
    };
}

// GET handler - returns cached or fresh Notion content
export async function GET() {
    const notionUrl = process.env.NEXT_PUBLIC_NOTION_PAGE_URL;

    if (!notionUrl) {
        return NextResponse.json(
            { posts: [], pages: [], source: 'none', message: 'No Notion URL configured' },
            { status: 200 }
        );
    }

    const now = Date.now();
    const cacheAge = (now - lastFetchTime) / 1000;

    // Return cache if still valid
    if (postsCache && pagesCache && cacheAge < REVALIDATE_SECONDS) {
        return NextResponse.json({
            posts: postsCache,
            pages: pagesCache,
            source: 'cache',
            cacheAge: Math.round(cacheAge),
            revalidateIn: Math.round(REVALIDATE_SECONDS - cacheAge),
        });
    }

    try {
        // Fetch fresh content from Notion
        const { posts, pages } = await fetchNotionContent(notionUrl);

        // Update cache
        postsCache = posts;
        pagesCache = pages;
        lastFetchTime = now;

        return NextResponse.json({
            posts,
            pages,
            source: 'notion',
            cacheAge: 0,
            revalidateIn: REVALIDATE_SECONDS,
        });
    } catch (error: any) {
        console.error('Notion fetch error:', error);

        // Return stale cache if available
        if (postsCache && pagesCache) {
            return NextResponse.json({
                posts: postsCache,
                pages: pagesCache,
                source: 'stale-cache',
                error: error.message,
            });
        }

        return NextResponse.json(
            { posts: [], pages: [], source: 'error', error: error.message },
            { status: 500 }
        );
    }
}
