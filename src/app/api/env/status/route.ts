import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const config = {
        NOTION_PAGE_URL: !!process.env.NOTION_PAGE_URL,
        ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
        GISCUS_REPO: !!process.env.GISCUS_REPO,
        GISCUS_REPO_ID: !!process.env.GISCUS_REPO_ID,
        GISCUS_CATEGORY: !!process.env.GISCUS_CATEGORY,
        GISCUS_CATEGORY_ID: !!process.env.GISCUS_CATEGORY_ID,
    };

    return NextResponse.json(config);
}
