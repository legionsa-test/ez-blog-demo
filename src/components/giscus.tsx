'use client';

import { useEffect, useState } from 'react';
import Giscus from '@giscus/react';
import { getSiteSettings } from '@/lib/site-settings';
import { useTheme } from 'next-themes';

export default function GiscusComments() {
    const { theme, systemTheme } = useTheme();
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
        const settings = getSiteSettings();
        if (settings.giscusConfig?.enabled && settings.giscusConfig.repo) {
            setConfig(settings.giscusConfig);
        }
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
                repo={config.repo as any}
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
