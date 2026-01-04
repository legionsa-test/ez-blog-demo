import { NextResponse } from 'next/server';
import { fetchNotionContent } from '@/lib/notion';

// GET handler - returns cached or fresh Notion content
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await fetchNotionContent();

        if (result.source === 'none') {
            return NextResponse.json(
                { posts: [], pages: [], source: 'none', message: 'No Notion URL configured' },
                { status: 200 }
            );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Notion fetch error:', error);
        return NextResponse.json(
            { posts: [], pages: [], source: 'error', error: error.message },
            { status: 500 }
        );
    }
}
