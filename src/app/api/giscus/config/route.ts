import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        enabled: !!(
            process.env.GISCUS_REPO &&
            process.env.GISCUS_REPO_ID &&
            process.env.GISCUS_CATEGORY_ID
        ),
        repo: process.env.GISCUS_REPO || '',
        repoId: process.env.GISCUS_REPO_ID || '',
        category: process.env.GISCUS_CATEGORY || 'Announcements',
        categoryId: process.env.GISCUS_CATEGORY_ID || '',
    };

    return NextResponse.json(config);
}
