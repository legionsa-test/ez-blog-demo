import { NextRequest, NextResponse } from 'next/server';
import { NotionAPI } from 'notion-client';
import { parsePageId } from 'notion-utils';
import sanitizeHtml from 'sanitize-html';
import { cookies } from 'next/headers';

const notion = new NotionAPI();

// Rate limiting map (simple in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Check rate limit
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
}

// Validate Notion URL domain
function isValidNotionUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.hostname === 'notion.so' ||
            parsed.hostname === 'www.notion.so' ||
            parsed.hostname.endsWith('.notion.site');
    } catch {
        return false;
    }
}

// Check admin authentication
async function isAdminAuthenticated(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('ezblog_auth');
        return authCookie?.value === 'true';
    } catch {
        return false;
    }
}

// Sanitization options
const sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'strong', 'em', 'u', 's',
        'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'aside', 'div', 'span'
    ],
    allowedAttributes: {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
        'a': (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                target: '_blank',
                rel: 'noopener noreferrer'
            }
        })
    }
};

// Helper to extract text from Notion rich text array
function extractText(richTextArray: any[]): string {
    if (!richTextArray || !Array.isArray(richTextArray)) return '';
    const text = richTextArray.map(item => {
        if (typeof item === 'string') return item;
        if (Array.isArray(item) && item[0]) return item[0];
        return '';
    }).join('');
    // Escape HTML entities for text content
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Convert Notion blocks to HTML (with sanitization)
function blocksToHtml(recordMap: any, blockId: string): string {
    const block = recordMap?.block?.[blockId]?.value;
    if (!block) return '';

    const children = block.content || [];
    let html = '';

    // Process children blocks
    for (const childId of children) {
        const childBlock = recordMap?.block?.[childId]?.value;
        if (!childBlock) continue;

        const type = childBlock.type;
        const properties = childBlock.properties || {};

        switch (type) {
            case 'text':
            case 'paragraph':
                const text = extractText(properties.title);
                if (text) html += `<p>${text}</p>`;
                break;
            case 'header':
            case 'heading_1':
                // Convert to h2 (h1 is reserved for page title, TOC uses h2/h3)
                html += `<h2>${extractText(properties.title)}</h2>`;
                break;
            case 'sub_header':
            case 'heading_2':
                html += `<h3>${extractText(properties.title)}</h3>`;
                break;
            case 'sub_sub_header':
            case 'heading_3':
                html += `<h4>${extractText(properties.title)}</h4>`;
                break;
            case 'bulleted_list':
                html += `<ul><li>${extractText(properties.title)}</li></ul>`;
                break;
            case 'numbered_list':
                html += `<ol><li>${extractText(properties.title)}</li></ol>`;
                break;
            case 'quote':
                html += `<blockquote>${extractText(properties.title)}</blockquote>`;
                break;
            case 'code':
                html += `<pre><code>${extractText(properties.title)}</code></pre>`;
                break;
            case 'image':
                const src = properties.source?.[0]?.[0] || childBlock.format?.display_source;
                if (src && (src.startsWith('https://') || src.startsWith('http://'))) {
                    // Validate image URL
                    html += `<img src="${src.replace(/"/g, '&quot;')}" alt="" />`;
                }
                break;
            case 'divider':
                html += '<hr />';
                break;
            case 'callout':
                html += `<aside>${extractText(properties.title)}</aside>`;
                break;
            default:
                // Try to extract text for unknown types
                const fallbackText = extractText(properties.title);
                if (fallbackText) html += `<p>${fallbackText}</p>`;
        }

        // Recursively process nested content
        if (childBlock.content && childBlock.content.length > 0) {
            html += blocksToHtml(recordMap, childId);
        }
    }

    // Sanitize the final HTML output
    return sanitizeHtml(html, sanitizeOptions);
}

// Extract database rows from collection view
function extractDatabaseRows(recordMap: any): any[] {
    const collection = recordMap?.collection;
    const collectionView = recordMap?.collection_view;

    if (!collection || !collectionView) return [];

    // Get the collection ID
    const collectionId = Object.keys(collection)[0];
    if (!collectionId) return [];

    const schema = collection[collectionId]?.value?.schema || {};

    // Get block IDs that are pages in this collection
    const blockIds = Object.keys(recordMap?.block || {});
    const rows: any[] = [];

    for (const blockId of blockIds) {
        const block = recordMap.block[blockId]?.value;
        if (!block || block.type !== 'page' || block.parent_id !== collectionId) continue;

        const properties = block.properties || {};
        const row: any = {
            id: blockId,
            properties: {}
        };

        // Map schema to property values
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
                    row.properties[propName] = extractText(value);
                    break;
                case 'multi_select':
                case 'select':
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

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Check admin authentication
        const isAuthenticated = await isAdminAuthenticated();
        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { pageUrl } = body;

        if (!pageUrl) {
            return NextResponse.json({ error: 'Page URL is required' }, { status: 400 });
        }

        // Validate Notion domain (SSRF protection)
        if (!isValidNotionUrl(pageUrl)) {
            return NextResponse.json(
                { error: 'Invalid URL. Only Notion URLs are allowed.' },
                { status: 400 }
            );
        }

        // Parse the page ID from URL
        const pageId = parsePageId(pageUrl);
        if (!pageId) {
            return NextResponse.json({ error: 'Invalid Notion page URL' }, { status: 400 });
        }

        // Fetch the page data
        const recordMap = await notion.getPage(pageId);

        // Check if this is a database (collection view)
        const hasCollection = recordMap?.collection && Object.keys(recordMap.collection).length > 0;

        if (hasCollection) {
            // It's a database - extract rows
            const rows = extractDatabaseRows(recordMap);

            // For each row, fetch its content
            const items = await Promise.all(
                rows.map(async (row) => {
                    try {
                        const pageRecordMap = await notion.getPage(row.id);
                        const content = blocksToHtml(pageRecordMap, row.id);

                        const props = row.properties;
                        const title = props.title || 'Untitled';
                        const slug = props.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                        // Detect content type from 'type' column (Post, Page, etc.)
                        // Accepts: 'post', 'page', 'Post', 'Page'
                        const typeValue = (props.type?.[0] || props.contenttype?.[0] || 'post').toLowerCase();
                        const contentType = typeValue === 'page' ? 'page' : 'post';

                        return {
                            notionId: row.id,
                            title,
                            slug,
                            excerpt: props.summary || props.excerpt || props.description || '',
                            content,
                            coverImage: props['hero image'] || props['heroimage'] || props['hero_image'] || props.cover || props.image || '',
                            coverImageSize: (() => {
                                const heroSizeValue = String(props['hero size'] || props['herosize'] || props['hero_size'] || '').toLowerCase();
                                return heroSizeValue === 'big' ? 'big' : heroSizeValue === 'small' ? 'small' : undefined;
                            })(),
                            tags: props.tags || [],
                            status: (props.status === 'Published' || props.published === true) ? 'published' : 'draft',
                            publishedAt: props.date || props.published_date || null,
                            contentType, // 'post' or 'page'
                        };
                    } catch (e) {
                        console.error('Error fetching page content:', row.id, e);
                        return null;
                    }
                })
            );

            // Separate posts and pages
            const validItems = items.filter(Boolean);
            const posts = validItems.filter((item: any) => item.contentType === 'post');
            const pages = validItems.filter((item: any) => item.contentType === 'page');

            return NextResponse.json({
                success: true,
                type: 'database',
                posts,
                pages,
            });
        } else {
            // It's a single page - convert to a single post
            const block = recordMap?.block?.[pageId]?.value;
            const title = extractText(block?.properties?.title) || 'Untitled';
            const content = blocksToHtml(recordMap, pageId);
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            return NextResponse.json({
                success: true,
                type: 'page',
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
                }],
            });
        }
    } catch (error: any) {
        console.error('Notion sync error:', error);
        // Return generic error message (avoid leaking internals)
        return NextResponse.json(
            { error: 'Failed to sync from Notion. Please check the URL and try again.' },
            { status: 500 }
        );
    }
}
