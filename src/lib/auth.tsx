'use client';

import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const AUTH_COOKIE = 'ezblog_auth';
const AUTH_EXPIRY_DAYS = 7;

// Simple password-based authentication
// In production, use the ADMIN_PASSWORD environment variable
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth cookie
        const authCookie = Cookies.get(AUTH_COOKIE);
        setIsAuthenticated(authCookie === 'true');
        setIsLoading(false);
    }, []);

    const login = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            Cookies.set(AUTH_COOKIE, 'true', { expires: AUTH_EXPIRY_DAYS });
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        Cookies.remove(AUTH_COOKIE);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Check if authenticated (for middleware/server-side)
export function checkAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return Cookies.get(AUTH_COOKIE) === 'true';
}
