import { NextResponse } from 'next/server';
import { NotionAPI } from 'notion-client';

const notion = new NotionAPI();

// GET handler - returns recordMap for a specific Notion page
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Page ID is required' },
                { status: 400 }
            );
        }

        // Fetch the recordMap for the page
        const recordMap = await notion.getPage(id);

        return NextResponse.json({
            recordMap,
            pageId: id,
            success: true
        });
    } catch (error: any) {
        console.error('Notion page fetch error:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}
