import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting (resets on server restart)
// For production with multiple instances, use Redis
const rateLimitMap = new Map<string, { attempts: number; lockoutUntil: number | null; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour window for attempts

// Clean up old entries periodically
function cleanupRateLimitMap() {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
        // Remove entries older than 1 hour with no lockout
        if (!data.lockoutUntil && now - data.lastAttempt > ATTEMPT_WINDOW) {
            rateLimitMap.delete(ip);
        }
        // Remove expired lockouts
        if (data.lockoutUntil && now > data.lockoutUntil) {
            rateLimitMap.delete(ip);
        }
    }
}

// Get client IP
function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    return 'unknown';
}

export async function POST(request: NextRequest) {
    // Cleanup old entries
    cleanupRateLimitMap();

    const ip = getClientIp(request);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitMap.get(ip);
    if (!entry) {
        entry = { attempts: 0, lockoutUntil: null, lastAttempt: now };
    }

    // Check if currently locked out
    if (entry.lockoutUntil && now < entry.lockoutUntil) {
        const remainingMs = entry.lockoutUntil - now;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        return NextResponse.json(
            {
                success: false,
                error: `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).`,
                locked: true,
                lockoutRemaining: remainingMs
            },
            { status: 429 }
        );
    }

    // Reset if lockout expired
    if (entry.lockoutUntil && now >= entry.lockoutUntil) {
        entry = { attempts: 0, lockoutUntil: null, lastAttempt: now };
    }

    // Parse request body
    let password: string;
    try {
        const body = await request.json();
        password = body.password;
    } catch {
        return NextResponse.json(
            { success: false, error: 'Invalid request body' },
            { status: 400 }
        );
    }

    if (!password) {
        return NextResponse.json(
            { success: false, error: 'Password is required' },
            { status: 400 }
        );
    }

    // Note: We can't access localStorage from server-side
    // So we need to receive the hashed/expected password from a secure source
    // For this implementation, we'll validate against an environment variable
    // or accept the password check on client-side but use server for rate limiting

    // Since ezBlog stores password in localStorage (client-side),
    // we'll return a "rate limit passed" response and let client do the actual check
    // This still provides server-side rate limiting protection

    // Record this attempt
    entry.attempts += 1;
    entry.lastAttempt = now;

    // Check if should lock out
    if (entry.attempts >= MAX_ATTEMPTS) {
        entry.lockoutUntil = now + LOCKOUT_DURATION;
        rateLimitMap.set(ip, entry);

        return NextResponse.json(
            {
                success: false,
                error: `Too many attempts. Account locked for ${Math.floor(LOCKOUT_DURATION / 60000)} minutes.`,
                locked: true,
                lockoutRemaining: LOCKOUT_DURATION
            },
            { status: 429 }
        );
    }

    rateLimitMap.set(ip, entry);

    // Return rate limit check passed - client will verify password
    return NextResponse.json({
        success: true,
        attemptsRemaining: MAX_ATTEMPTS - entry.attempts,
        message: 'Rate limit check passed'
    });
}

// Endpoint to report successful login (resets rate limit)
export async function DELETE(request: NextRequest) {
    const ip = getClientIp(request);
    rateLimitMap.delete(ip);
    return NextResponse.json({ success: true });
}
