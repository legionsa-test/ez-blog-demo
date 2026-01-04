'use client';

import { useEffect, useState } from 'react';
import Giscus from '@giscus/react';
import { getSiteSettings } from '@/lib/site-settings';
import { useTheme } from 'next-themes';

export default function GiscusComments() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState<{
        enabled: boolean;
        repo: string;
        repoId: string;
        category: string;
        categoryId: string;
    } | null>(null);

    useEffect(() => {
        setMounted(true);

        // Fetch Giscus config from server-side API
        fetch('/api/giscus/config')
            .then((res) => res.json())
            .then((data) => {
                if (data.enabled && data.repo && data.repoId && data.categoryId) {
                    setConfig(data);
                    return;
                }

                // Fallback: localStorage settings (for local development / admin UI)
                const settings = getSiteSettings();
                if (settings.giscusConfig?.enabled && settings.giscusConfig.repo) {
                    setConfig(settings.giscusConfig);
                }
            })
            .catch(() => {
                // On error, try localStorage fallback
                const settings = getSiteSettings();
                if (settings.giscusConfig?.enabled && settings.giscusConfig.repo) {
                    setConfig(settings.giscusConfig);
                }
            });
    }, []);

    if (!mounted || !config) return null;

    // Determine theme for Giscus
    const giscusTheme =
        theme === 'dark' ? 'dark' :
            theme === 'light' ? 'light' :
                'preferred_color_scheme';

    return (
        <div className="mt-10 pt-10 border-t border-border">
            <Giscus
                id="comments"
                repo={config.repo as `${string}/${string}`}
                repoId={config.repoId}
                category={config.category}
                categoryId={config.categoryId}
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={giscusTheme}
                lang="en"
                loading="lazy"
            />
        </div>
    );
}
