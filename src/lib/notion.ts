
import { NotionAPI } from 'notion-client';
import sanitizeHtml from 'sanitize-html';

// Create Notion client
const notion = new NotionAPI();

// Cache duration in seconds (5 minutes)
const REVALIDATE_SECONDS = 300;

// In-memory cache
let postsCache: any[] | null = null;
let pagesCache: any[] | null = null;
let lastFetchTime: number = 0;

// Sanitize HTML config
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
        'iframe', 'video', 'source', 'object', 'embed',
        'audio', 'aside', 'nav', 'details', 'summary',
        'figure', 'figcaption'
    ],
    allowedAttributes: {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height', 'loading'],
        'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'style', 'class', 'scrolling', 'loading'],
        'video': ['src', 'controls', 'width', 'height', 'poster', 'autoplay', 'loop', 'muted', 'playsinline'],
        'audio': ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],
        'source': ['src', 'type'],
        'object': ['data', 'type', 'width', 'height'],
        'embed': ['src', 'type', 'width', 'height'],
        'details': ['open'],
        '*': ['class', 'id', 'style', 'aria-hidden'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: true,
    // Allow iframes from trusted sources
    allowedIframeHostnames: [
        // Design & Prototyping
        'www.figma.com', 'figma.com',
        'www.canva.com', 'canva.com',
        'excalidraw.com',
        // Video
        'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com',
        'player.vimeo.com', 'vimeo.com',
        'www.loom.com', 'loom.com',
        // Audio
        'open.spotify.com', 'w.soundcloud.com',
        // Collaboration
        'miro.com', 'www.miro.com',
        'whimsical.com', 'www.whimsical.com',
        'www.lucidchart.com', 'lucidchart.com',
        // Google
        'www.google.com', 'maps.google.com', 'docs.google.com', 'drive.google.com',
        // Code
        'codepen.io', 'gist.github.com', 'codesandbox.io',
        // Social
        'twitter.com', 'platform.twitter.com', 'publish.twitter.com',
        // Forms & Surveys
        'typeform.com', 'www.typeform.com',
        'tally.so', 'airtable.com',
        // Project Management
        'trello.com', 'www.trello.com',
        'asana.com', 'app.asana.com',
        'app.clickup.com', 'clickup.com',
        'notion.so', 'www.notion.so',
        // Documents
        'onedrive.live.com', 'www.dropbox.com',
        // Misc
        'calendly.com', 'www.calendly.com',
    ],
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
            case 'to_do': {
                const todoText = extractText(properties?.title);
                const checked = properties?.checked?.[0]?.[0] === 'Yes';
                return `<div class="flex items-start gap-2 my-1">
                    <input type="checkbox" ${checked ? 'checked' : ''} disabled class="mt-1 rounded" />
                    <span class="${checked ? 'line-through text-muted-foreground' : ''}">${todoText}</span>
                </div>`;
            }
            case 'quote':
                return `<blockquote>${extractText(properties?.title)}</blockquote>`;
            case 'code':
                return `<pre><code>${extractText(properties?.title)}</code></pre>`;
            case 'image': {
                const imgSrc = format?.display_source || properties?.source?.[0]?.[0] || block?.source?.[0]?.[0];
                // Try multiple places for caption/alt text
                const imgCaption = extractText(properties?.caption) ||
                    extractText(format?.caption) ||
                    format?.block_caption ||
                    extractText(block?.caption) ||
                    '';
                return imgSrc ?
                    `<figure><img src="${imgSrc}" alt="${imgCaption}" />${imgCaption ? `<figcaption>${imgCaption}</figcaption>` : ''}</figure>`
                    : '';
            }
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
            case 'gist':
            case 'abstract':
            case 'invision':
            case 'framer':
            case 'whimsical':
            case 'mural':
            case 'loom': {
                // Try multiple possible locations for the embed URL
                // IMPORTANT: format.uri is used by Figma embeds!
                const source =
                    properties?.source?.[0]?.[0] ||
                    format?.display_source ||
                    format?.source ||
                    format?.uri ||
                    block?.source?.[0]?.[0] ||
                    properties?.link?.[0]?.[0];

                if (!source) {
                    console.log('[Notion] Embed block has no source:', type, JSON.stringify(format || {}).slice(0, 300));
                    return '';
                }

                let embedSrc = source;
                // Handle Figma specifically (including FigJam, Slides, etc.)
                if (source.includes('figma.com')) {
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
                return `<div class="w-full h-[600px] my-4"><object data="${source}" type="application/pdf" class="w-full h-full rounded-lg border border-border"><p>Unable to display PDF file. <a href="${source}">Download</a> instead.</p></object></div>`;
            }

            case 'file': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                const caption = extractText(properties?.caption) || source?.split('/').pop() || 'Download File';
                if (!source) return '';

                return `<a href="${source}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 my-4"><span class="font-medium">${caption}</span></a>`;
            }

            // --- Audio Embeds ---
            case 'audio': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';

                // Spotify
                if (source.includes('spotify.com')) {
                    // Convert open.spotify.com/track/xxx to embed URL
                    let embedUrl = source;
                    if (source.includes('open.spotify.com')) {
                        embedUrl = source.replace('open.spotify.com', 'open.spotify.com/embed');
                    }
                    return `<div class="my-4"><iframe src="${embedUrl}" width="100%" height="352" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" class="rounded-lg"></iframe></div>`;
                }

                // SoundCloud
                if (source.includes('soundcloud.com')) {
                    return `<div class="my-4"><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(source)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true" class="rounded-lg"></iframe></div>`;
                }

                // Direct audio file
                return `<audio src="${source}" controls class="w-full my-4"></audio>`;
            }

            // --- Miro Boards ---
            case 'miro': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';
                // Convert miro.com/app/board/xxx to embed URL
                let embedUrl = source;
                if (source.includes('miro.com/app/board/')) {
                    const boardId = source.split('board/')[1]?.split('?')[0];
                    embedUrl = `https://miro.com/app/embed/${boardId}`;
                }
                return `<div class="w-full my-4"><iframe src="${embedUrl}" width="100%" height="500" frameborder="0" scrolling="no" allow="fullscreen; clipboard-read; clipboard-write" allowfullscreen class="rounded-lg border border-border"></iframe></div>`;
            }

            // --- Excalidraw ---
            case 'excalidraw': {
                const source = properties?.source?.[0]?.[0] || format?.display_source;
                if (!source) return '';
                return `<div class="w-full my-4"><iframe src="${source}" width="100%" height="500" frameborder="0" class="rounded-lg border border-border bg-white"></iframe></div>`;
            }

            // --- Table of Contents ---
            case 'table_of_contents': {
                // TOC is generated dynamically; for static HTML, we output a placeholder or skip
                return `<nav class="my-6 p-4 rounded-lg border border-border bg-muted/30"><p class="text-sm font-medium text-muted-foreground">Table of Contents</p><p class="text-xs text-muted-foreground mt-1">(Auto-generated in Notion)</p></nav>`;
            }

            // --- Simple Tables ---
            case 'table': {
                // Check if this is a simple table (has table_row children) or a collection view
                const collectionId = format?.collection_id;
                if (collectionId) {
                    // Collection view - render placeholder
                    return `<div class="my-4 p-4 rounded-lg border border-border bg-muted/30 text-center"><p class="text-sm text-muted-foreground">📊 This content contains an embedded database.</p><p class="text-xs text-muted-foreground mt-1">View in Notion for the full interactive experience.</p></div>`;
                }

                // Simple table - render as HTML table
                const tableContent = block.content || [];
                if (tableContent.length === 0) return '';

                let tableHtml = '<div class="my-4 overflow-x-auto"><table class="w-full border-collapse border border-border rounded-lg overflow-hidden">';
                const hasColumnHeader = format?.table_block_column_header;
                const hasRowHeader = format?.table_block_row_header;

                tableContent.forEach((rowId: string, rowIndex: number) => {
                    const rowBlock = blocks[rowId]?.value;
                    if (!rowBlock || rowBlock.type !== 'table_row') return;

                    const cells = rowBlock.properties?.cells || [];
                    const isHeaderRow = hasColumnHeader && rowIndex === 0;

                    tableHtml += '<tr class="border-b border-border">';
                    cells.forEach((cell: any, cellIndex: number) => {
                        const cellText = extractText(cell) || '';
                        const isHeaderCell = isHeaderRow || (hasRowHeader && cellIndex === 0);
                        const cellTag = isHeaderCell ? 'th' : 'td';
                        const cellClass = isHeaderCell
                            ? 'bg-muted/50 p-3 text-left font-medium text-sm'
                            : 'p-3 text-sm';
                        tableHtml += `<${cellTag} class="${cellClass} border-r border-border last:border-r-0">${cellText}</${cellTag}>`;
                    });
                    tableHtml += '</tr>';
                });

                tableHtml += '</table></div>';
                return tableHtml;
            }

            // --- Collection Views (Databases) ---
            case 'collection_view':
            case 'collection_view_page': {
                // Notion databases are complex; we render a placeholder
                return `<div class="my-4 p-4 rounded-lg border border-border bg-muted/30 text-center"><p class="text-sm text-muted-foreground">📊 This content contains an embedded database.</p><p class="text-xs text-muted-foreground mt-1">View in Notion for the full interactive experience.</p></div>`;
            }

            // --- Callout (enhanced) ---
            case 'callout': {
                const text = extractText(properties?.title);
                const icon = format?.page_icon || '💡';
                const color = format?.block_color || 'gray_background';
                return `<aside class="my-4 flex items-start gap-3 rounded-lg border border-border p-4 bg-muted/30"><span class="text-xl">${icon}</span><div class="flex-1 text-sm">${text}</div></aside>`;
            }

            // --- Block Equation ---
            case 'equation': {
                const expression = properties?.title?.[0]?.[0] || '';
                return `<div class="my-4 p-4 bg-muted/50 rounded-lg text-center font-mono overflow-x-auto">${expression}</div>`;
            }

            // --- Link to Page / Page Mention ---
            case 'link_to_page':
            case 'alias': {
                const linkedPageId = format?.alias_pointer?.id || block.page_id || '';
                const linkedPage = blocks[linkedPageId]?.value;
                const pageTitle = extractText(linkedPage?.properties?.title) || 'Linked Page';
                const pageIcon = linkedPage?.format?.page_icon || '📄';
                // Create a styled link that will open in new tab with external link styling
                return `<a href="https://notion.so/${linkedPageId.replace(/-/g, '')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 my-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm">
                    <span>${pageIcon}</span>
                    <span>${pageTitle}</span>
                    <span class="text-muted-foreground">↗</span>
                </a>`;
            }

            // --- Synced Block (transclusion) ---
            case 'transclusion_container':
            case 'transclusion_reference': {
                // Process synced block children
                let syncedContent = '';
                if (block.content) {
                    block.content.forEach((childId: string) => {
                        syncedContent += processBlock(childId);
                    });
                }
                return syncedContent;
            }

            // --- Breadcrumb (skip - not meaningful in blog) ---
            case 'breadcrumb': {
                return '';
            }

            // --- Toggle (collapsible with children) ---
            case 'toggle': {
                const title = extractText(properties?.title);
                let childrenHtml = '';
                if (block.content && block.content.length > 0) {
                    block.content.forEach((childId: string) => {
                        childrenHtml += processBlock(childId);
                    });
                }
                return `<details class="my-4 rounded-lg border border-border p-4 bg-card">
                    <summary class="font-medium cursor-pointer">${title}</summary>
                    <div class="mt-2 pl-4">${childrenHtml || '<p class="text-muted-foreground text-sm">Empty toggle</p>'}</div>
                </details>`;
            }

            // --- Multi-Column Layouts ---
            case 'column_list': {
                const columns = block.content || [];
                if (columns.length === 0) return '';

                let columnsHtml = '';
                columns.forEach((colId: string) => {
                    const colBlock = blocks[colId]?.value;
                    let colContent = '';
                    if (colBlock?.content) {
                        colBlock.content.forEach((childId: string) => {
                            colContent += processBlock(childId);
                        });
                    }
                    columnsHtml += `<div class="flex-1 min-w-0">${colContent}</div>`;
                });
                return `<div class="flex flex-col md:flex-row gap-4 my-4">${columnsHtml}</div>`;
            }
            case 'column': {
                // Handled by column_list parent
                return '';
            }

            default: {
                // Log unknown block types for debugging
                if (type && type !== 'page') {
                    console.log('[Notion] Unknown block type:', type, 'Properties:', JSON.stringify(properties || {}).slice(0, 200), 'Format:', JSON.stringify(format || {}).slice(0, 200));
                }

                // Try to extract an embed source from unknown types
                // IMPORTANT: Check format.uri too - this is where Figma URLs are stored!
                const source = properties?.source?.[0]?.[0] || format?.display_source || format?.uri;
                if (source && (source.startsWith('http://') || source.startsWith('https://'))) {
                    // Check if it's a Figma URL
                    if (source.includes('figma.com')) {
                        const embedSrc = source.includes('embed_host')
                            ? source
                            : `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(source)}`;
                        return `<div class="aspect-video w-full my-4"><iframe src="${embedSrc}" class="w-full h-full rounded-lg bg-muted" frameborder="0" allowfullscreen></iframe></div>`;
                    }

                    // Google Maps
                    if (source.includes('google.com/maps') || source.includes('maps.google.com')) {
                        // Convert regular Google Maps URL to embed format
                        let embedUrl = source;
                        if (!source.includes('/embed')) {
                            // Try to extract place or coordinates
                            embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!5e0!3m2!1sen!2s!4v${Date.now()}`;
                            // If original URL has place info, use iframe with src parameter
                            if (source.includes('@') || source.includes('place')) {
                                embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(source)}&output=embed`;
                            }
                        }
                        return `<div class="w-full my-4"><iframe src="${embedUrl}" width="100%" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="rounded-lg"></iframe></div>`;
                    }

                    // Twitter/X embed
                    if (source.includes('twitter.com') || source.includes('x.com')) {
                        // For tweets, we need to use Twitter's embed script
                        return `<div class="my-4"><blockquote class="twitter-tweet"><a href="${source}">View Tweet</a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script></div>`;
                    }

                    // Loom video
                    if (source.includes('loom.com')) {
                        const embedUrl = source.replace('share', 'embed');
                        return `<div class="aspect-video w-full my-4"><iframe src="${embedUrl}" class="w-full h-full rounded-lg" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`;
                    }

                    // Generic fallback for other embeds
                    return `<div class="aspect-video w-full my-4"><iframe src="${source}" class="w-full h-full rounded-lg bg-muted" frameborder="0" allowfullscreen></iframe></div>`;
                }
                return '';
            }
        }
    };

    // Get page block and its content
    const pageBlock = blocks[pageId]?.value;
    console.log('[blocksToHtml] Processing page:', pageId, '| Content blocks:', pageBlock?.content?.length || 0);

    if (pageBlock?.content) {
        for (const childId of pageBlock.content) {
            const blockInfo = blocks[childId]?.value;
            console.log('[blocksToHtml] Block:', childId.slice(0, 8), '| Type:', blockInfo?.type, '| Has format.uri:', !!blockInfo?.format?.uri);
            html += processBlock(childId);
        }
    }

    console.log('[blocksToHtml] Final HTML length:', html.length, '| Contains figma:', html.includes('figma'));
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
                    if (value && value[0]) {
                        row.properties[propName] = value[0][0] || '';
                    }
                    break;
                case 'multi_select':
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

        // Debug log to trace row extraction
        console.log('[Notion ExtractRow]', row.properties.title ? `OK: ${row.properties.title}` : `FILTERED: No title found, raw props: ${JSON.stringify(Object.keys(properties))}`);

        if (row.properties.title) {
            rows.push(row);
        }
    }

    console.log('[Notion ExtractRows] Total rows extracted:', rows.length);
    return rows;
}

// Internal Fetch Content (Uncached execution)
export async function fetchNotionData(pageUrl: string) {
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
                console.log('[Notion] Fetching page content for:', row.id, '| Title:', row.properties?.title);
                const pageRecordMap = await notion.getPage(row.id);

                if (!pageRecordMap?.block) {
                    console.log('[Notion] No block data for page:', row.id);
                }

                let content = '';
                try {
                    content = blocksToHtml(pageRecordMap, row.id);
                } catch (htmlError: any) {
                    console.error('[Notion] blocksToHtml error for:', row.id, '| Error:', htmlError?.message, '| Stack:', htmlError?.stack?.slice(0, 300));
                    content = '<p>Content could not be loaded</p>';
                }

                const props = row.properties;

                const title = props.title || 'Untitled';

                const slug = props.slug || props.url || props.permalink ||
                    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                const typeValue = String(props.type || props.contenttype || props['content type'] || 'post').toLowerCase();
                const contentType = typeValue === 'page' ? 'page' : 'post';

                const statusValue = String(props.status || '').toLowerCase();
                const isPublished = statusValue === 'published' || props.published === true;

                // Debug log to trace content processing
                console.log('[Notion Debug]', title, '| Type:', typeValue, '| Status:', statusValue, '| Published:', isPublished, '| ContentType:', contentType);

                const excerpt = props.summary || props.excerpt || props.description ||
                    props.subtitle || props.intro || '';

                let tags = props.tags || props.categories || props.labels || [];
                if (typeof tags === 'string') {
                    tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
                }

                const publishedAt = props.date || props.published_date || props.publishedat ||
                    props['publish date'] || props.created || null;

                const coverImage = props['hero image'] || props['heroimage'] || props['hero_image'] ||
                    props.cover || props.image || props.thumbnail || props.banner || '';

                const heroSizeValue = String(
                    props['hero size'] ||
                    props['Hero Size'] ||
                    props['herosize'] ||
                    props['hero_size'] ||
                    props['HeroSize'] ||
                    ''
                ).toLowerCase();
                const coverImageSize = heroSizeValue === 'big' ? 'big' : heroSizeValue === 'small' ? 'small' : undefined;

                // Extract Hero ALT Text
                const coverImageAlt = props['hero alt text'] || props['hero alt'] ||
                    props['heroalttext'] || props['hero_alt_text'] ||
                    props['alt text'] || props['alttext'] || '';

                return {
                    notionId: row.id,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage,
                    coverImageSize,
                    coverImageAlt,
                    tags,
                    status: isPublished ? 'published' : 'draft',
                    publishedAt,
                    contentType,
                };
            } catch (e: any) {
                console.error('[Notion Error] Failed to process row:', row.id, '| Title:', row.properties?.title, '| Error:', e?.message || e);
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

// Fetch and cache Notion content
export async function fetchNotionContent() {
    const pageUrl = process.env.NEXT_PUBLIC_NOTION_PAGE_URL;
    if (!pageUrl) {
        return { posts: [], pages: [], source: 'none' };
    }

    const now = Date.now();
    const cacheAge = (now - lastFetchTime) / 1000;

    if (postsCache && pagesCache && cacheAge < REVALIDATE_SECONDS) {
        return {
            posts: postsCache,
            pages: pagesCache,
            source: 'cache',
            cacheAge,
        };
    }

    try {
        const { posts, pages } = await fetchNotionData(pageUrl);
        postsCache = posts;
        pagesCache = pages;
        lastFetchTime = now;

        return {
            posts,
            pages,
            source: 'notion',
        };
    } catch (error) {
        console.error('Notion fetch error:', error);
        if (postsCache && pagesCache) {
            return {
                posts: postsCache,
                pages: pagesCache,
                source: 'stale-cache',
                error
            };
        }
        throw error;
    }
}
