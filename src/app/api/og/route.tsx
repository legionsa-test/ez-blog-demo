import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'ezBlog';
    const author = searchParams.get('author') || 'Admin';
    const date = searchParams.get('date') || new Date().toLocaleDateString();

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
                    backgroundColor: '#0a0a0a',
                    padding: '60px',
                    backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 50%, #16213e 100%)',
                }}
            >
                {/* Accent gradient */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                    }}
                />

                {/* Logo */}
                <div
                    style={{
                        position: 'absolute',
                        top: '60px',
                        left: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                        }}
                    >
                        ezBlog
                    </div>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: title.length > 60 ? '48px' : '64px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        lineHeight: 1.2,
                        maxWidth: '900px',
                        marginBottom: '24px',
                    }}
                >
                    {title}
                </div>

                {/* Meta */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        color: '#a1a1aa',
                        fontSize: '24px',
                    }}
                >
                    <span>{author}</span>
                    <span>•</span>
                    <span>{date}</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
