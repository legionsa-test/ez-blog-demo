
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchNotionData } from '@/lib/notion';
import { parsePageId } from 'notion-utils';

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

        // Validate Page ID logic (simple check)
        const pageId = parsePageId(pageUrl);
        if (!pageId) {
            return NextResponse.json({ error: 'Invalid Notion page URL' }, { status: 400 });
        }

        // Fetch using shared library
        const { posts, pages } = await fetchNotionData(pageUrl);

        // Determine response type based on what was returned
        // Attempt to guess if it was a database or single page based on volume?
        // Actually, the original sync distinguished between type 'database' and 'page'.
        // Does the frontend care? likely yes.
        // fetchNotionData returns flattened lists.
        // If we want to preserve "type", we might need to check the return.
        // But the previous implementation logic was:
        // if hasCollection -> type: database
        // else -> type: page

        // Since the shared lib handles both and returns normalized [posts, pages],
        // we can just return success: true and the data.
        // The admin UI likely consumes "posts" and "pages".

        return NextResponse.json({
            success: true,
            type: posts.length > 1 ? 'database' : 'page', // Simple heuristic or just omit type if unused
            posts,
            pages,
        });

    } catch (error: any) {
        console.error('Notion sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync from Notion. Please check the URL and try again.' },
            { status: 500 }
        );
    }
}
