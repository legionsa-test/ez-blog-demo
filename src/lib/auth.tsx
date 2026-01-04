'use client';

import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const AUTH_COOKIE = 'ezblog_auth';
const AUTH_EXPIRY_DAYS = 7;

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (password: string) => Promise<boolean>;
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

    const login = async (password: string): Promise<boolean> => {
        try {
            // Call server-side API for secure password verification
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Password verified on server - set auth cookie
                Cookies.set(AUTH_COOKIE, 'true', { expires: AUTH_EXPIRY_DAYS });
                setIsAuthenticated(true);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
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
