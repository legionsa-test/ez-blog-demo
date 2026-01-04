import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        notionPageUrl: !!process.env.NOTION_PAGE_URL,
        adminPassword: !!process.env.ADMIN_PASSWORD,
        giscusRepo: !!process.env.GISCUS_REPO,
        giscusRepoId: !!process.env.GISCUS_REPO_ID,
        giscusCategory: !!process.env.GISCUS_CATEGORY,
        giscusCategoryId: !!process.env.GISCUS_CATEGORY_ID,
    };

    return NextResponse.json(config);
}
