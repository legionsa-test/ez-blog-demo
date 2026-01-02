'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PenLine, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, AuthProvider } from '@/lib/auth';

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms
const RATE_LIMIT_KEY = 'ezblog_login_attempts';

interface RateLimitData {
    attempts: number;
    lockoutUntil: number | null;
    lastAttempt: number;
}

function getRateLimitData(): RateLimitData {
    if (typeof window === 'undefined') {
        return { attempts: 0, lockoutUntil: null, lastAttempt: 0 };
    }
    try {
        const data = localStorage.getItem(RATE_LIMIT_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch {
        // Ignore parse errors
    }
    return { attempts: 0, lockoutUntil: null, lastAttempt: 0 };
}

function saveRateLimitData(data: RateLimitData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

function clearRateLimitData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RATE_LIMIT_KEY);
}

function formatTimeRemaining(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

function LoginForm() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);

    // Check lockout status on mount and update countdown
    useEffect(() => {
        const checkLockout = () => {
            const data = getRateLimitData();
            const now = Date.now();

            if (data.lockoutUntil && now < data.lockoutUntil) {
                setIsLocked(true);
                setLockoutTimeRemaining(data.lockoutUntil - now);
            } else if (data.lockoutUntil && now >= data.lockoutUntil) {
                // Lockout expired, reset
                clearRateLimitData();
                setIsLocked(false);
                setLockoutTimeRemaining(0);
                setAttemptsRemaining(MAX_ATTEMPTS);
            } else {
                setIsLocked(false);
                setAttemptsRemaining(MAX_ATTEMPTS - data.attempts);
            }
        };

        checkLockout();

        // Update countdown every second if locked
        const interval = setInterval(() => {
            const data = getRateLimitData();
            const now = Date.now();

            if (data.lockoutUntil && now < data.lockoutUntil) {
                setIsLocked(true);
                setLockoutTimeRemaining(data.lockoutUntil - now);
            } else if (data.lockoutUntil) {
                clearRateLimitData();
                setIsLocked(false);
                setLockoutTimeRemaining(0);
                setAttemptsRemaining(MAX_ATTEMPTS);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
        router.push('/admin');
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Check client-side lockout first (for UI feedback)
        const clientData = getRateLimitData();
        const now = Date.now();

        if (clientData.lockoutUntil && now < clientData.lockoutUntil) {
            setError('Too many failed attempts. Please wait before trying again.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Check server-side rate limit first
            const rateLimitResponse = await fetch('/api/auth/rate-limit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: '***' }), // Don't send actual password, just trigger check
            });

            const rateLimitData = await rateLimitResponse.json();

            if (!rateLimitResponse.ok) {
                // Server-side rate limit triggered
                if (rateLimitData.locked) {
                    setIsLocked(true);
                    setLockoutTimeRemaining(rateLimitData.lockoutRemaining || LOCKOUT_DURATION);
                    // Sync with client-side storage
                    saveRateLimitData({
                        attempts: MAX_ATTEMPTS,
                        lockoutUntil: now + (rateLimitData.lockoutRemaining || LOCKOUT_DURATION),
                        lastAttempt: now,
                    });
                }
                setError(rateLimitData.error || 'Too many attempts. Please try again later.');
                setIsSubmitting(false);
                return;
            }

            // Server-side rate limit passed, now check password
            if (login(password)) {
                // Success - clear both client and server rate limits
                clearRateLimitData();
                await fetch('/api/auth/rate-limit', { method: 'DELETE' });
                router.push('/admin');
            } else {
                // Failed attempt - update client-side tracking
                const newAttempts = clientData.attempts + 1;
                const serverAttemptsRemaining = rateLimitData.attemptsRemaining ?? (MAX_ATTEMPTS - newAttempts);

                const newData: RateLimitData = {
                    attempts: newAttempts,
                    lockoutUntil: serverAttemptsRemaining <= 0 ? now + LOCKOUT_DURATION : null,
                    lastAttempt: now,
                };
                saveRateLimitData(newData);

                if (serverAttemptsRemaining <= 0) {
                    setIsLocked(true);
                    setLockoutTimeRemaining(LOCKOUT_DURATION);
                    setError(`Too many failed attempts. Account locked for ${Math.floor(LOCKOUT_DURATION / 60000)} minutes.`);
                } else {
                    setAttemptsRemaining(serverAttemptsRemaining);
                    setError(`Invalid password. ${serverAttemptsRemaining} attempt${serverAttemptsRemaining !== 1 ? 's' : ''} remaining.`);
                }
            }
        } catch (err) {
            // Network error - fall back to client-side only
            console.error('Rate limit API error:', err);

            if (login(password)) {
                clearRateLimitData();
                router.push('/admin');
            } else {
                const newAttempts = clientData.attempts + 1;
                const newData: RateLimitData = {
                    attempts: newAttempts,
                    lockoutUntil: newAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION : null,
                    lastAttempt: now,
                };
                saveRateLimitData(newData);

                if (newAttempts >= MAX_ATTEMPTS) {
                    setIsLocked(true);
                    setLockoutTimeRemaining(LOCKOUT_DURATION);
                    setError(`Too many failed attempts. Account locked for ${Math.floor(LOCKOUT_DURATION / 60000)} minutes.`);
                } else {
                    const remaining = MAX_ATTEMPTS - newAttempts;
                    setAttemptsRemaining(remaining);
                    setError(`Invalid password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
                }
            }
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="mx-auto mb-4 flex items-center gap-2 text-xl font-bold">
                        <PenLine className="h-6 w-6" aria-hidden="true" />
                        <span>ezBlog</span>
                    </Link>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your password to access the admin dashboard.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {isLocked && lockoutTimeRemaining > 0 && (
                            <div
                                className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                                role="alert"
                            >
                                <Clock className="h-4 w-4" aria-hidden="true" />
                                <span>
                                    Account locked. Try again in {formatTimeRemaining(lockoutTimeRemaining)}
                                </span>
                            </div>
                        )}
                        {error && !isLocked && (
                            <div
                                className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                                role="alert"
                            >
                                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                    autoComplete="current-password"
                                    disabled={isLocked}
                                    aria-describedby={error ? 'password-error' : undefined}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || isLoading || isLocked}
                        >
                            {isSubmitting ? 'Signing in...' : isLocked ? 'Locked' : 'Sign In'}
                        </Button>
                        {!isLocked && attemptsRemaining < MAX_ATTEMPTS && attemptsRemaining > 0 && (
                            <p className="text-center text-xs text-muted-foreground">
                                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before lockout
                            </p>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <AuthProvider>
            <LoginForm />
        </AuthProvider>
    );
}
