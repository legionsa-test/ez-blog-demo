'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DebugNotionPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const fetchDebugData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch from our internal API that gets Notion content
            const res = await fetch('/api/notion/content');
            if (!res.ok) throw new Error('Failed to fetch data');
            const jsonData = await res.json();
            setData(jsonData);
            console.log('DEBUG NOTION DATA:', jsonData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Notion Data Debugger</h1>
            <p>Click below to fetch raw Notion data and check console.</p>

            <Button onClick={fetchDebugData} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch Debug Data'}
            </Button>

            {error && <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>}

            {data && (
                <div className="space-y-6">
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto max-h-[500px]">
                        <h2 className="font-bold mb-2">Posts Found: {data.posts?.length}</h2>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {JSON.stringify(data.posts?.slice(0, 1), null, 2)}
                        </pre>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto max-h-[500px]">
                        <h2 className="font-bold mb-2">First Post Author Data</h2>
                        <pre className="text-xs font-mono">
                            {data.posts?.[0] ? JSON.stringify({
                                title: data.posts[0].title,
                                authorName: data.posts[0].authorName,
                                authorAvatar: data.posts[0].authorAvatar,
                                // Check available keys
                                keys: Object.keys(data.posts[0])
                            }, null, 2) : 'No posts'}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
