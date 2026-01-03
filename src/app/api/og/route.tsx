import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Dynamic params
        const title = searchParams.get('title') || 'EzBlog';
        const date = searchParams.get('date');
        const author = searchParams.get('author') || 'EzBlog Author';
        const bgImage = searchParams.get('image');

        // Font loading (using fetch for Edge compatibility)
        // Using Inter Bold from Google Fonts
        const fontData = await fetch(
            new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff')
        ).then((res) => res.arrayBuffer());

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        backgroundColor: '#09090b', // slate-950
                        color: 'white',
                        padding: '40px 60px',
                        position: 'relative',
                    }}
                >
                    {/* Background Image (optional) */}
                    {bgImage && (
                        <img
                            src={bgImage}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.4,
                            }}
                            alt=""
                        />
                    )}

                    {/* Content Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            zIndex: 10,
                            maxWidth: '90%',
                        }}
                    >
                        {/* Site/Author Label */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 24,
                                color: '#a1a1aa', // zinc-400
                                marginBottom: '10px',
                                alignItems: 'center',
                            }}
                        >
                            <span>{author}</span>
                            {date && (
                                <>
                                    <span style={{ margin: '0 10px' }}>•</span>
                                    <span>{new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <div
                            style={{
                                fontSize: 60,
                                fontWeight: 'bold',
                                lineHeight: 1.1,
                                color: 'white',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            }}
                        >
                            {title}
                        </div>

                        {/* Brand / Logo Area */}
                        <div
                            style={{
                                marginTop: '30px',
                                fontSize: 20,
                                color: '#3b82f6', // blue-500
                                fontWeight: 600,
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                                paddingTop: '20px',
                                width: '100%',
                                display: 'flex',
                            }}
                        >
                            ezBlog
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: fontData,
                        style: 'normal',
                        weight: 700,
                    },
                ],
                // Using emoji support explicitly if needed, but not critical
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
