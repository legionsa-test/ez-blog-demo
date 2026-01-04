import { NextRequest, NextResponse } from 'next/server';

// Server-side password verification
// This runs on the server only, so ADMIN_PASSWORD is never exposed to clients
export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        // Get password from server-side environment variable
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Verify password
        if (password === adminPassword) {
            // Success - return success response
            // The client will set the auth cookie
            return NextResponse.json({
                success: true,
                message: 'Authentication successful'
            });
        }

        // Invalid password
        return NextResponse.json(
            {
                success: false,
                error: 'Invalid password'
            },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        );
    }
}
