import { Metadata } from 'next';

// This file sets noindex/nofollow for all admin routes
export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};
