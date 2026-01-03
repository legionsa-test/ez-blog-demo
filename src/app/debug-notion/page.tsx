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
                        <h2 className="font-bold mb-2">Raw RecordMap Users</h2>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {JSON.stringify(data.recordMap?.notion_user || {}, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto max-h-[500px]">
                        <h2 className="font-bold mb-2">First Block Metadata</h2>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {(() => {
                                const blockId = Object.keys(data.recordMap?.block || {})[0];
                                const block = data.recordMap?.block?.[blockId]?.value;
                                return JSON.stringify({
                                    id: blockId,
                                    type: block?.type,
                                    created_by_id: block?.created_by_id,
                                    created_by_table: block?.created_by_table, // checking if it exists
                                    properties: block?.properties
                                }, null, 2);
                            })()}
                        </pre>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto max-h-[500px]">
                        <h2 className="font-bold mb-2">First Post Raw Properties</h2>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {data.recordMap ? (() => {
                                // Find the first page block that is a post
                                const blockId = data.posts?.[0]?.notionId;
                                const block = data.recordMap.block?.[blockId]?.value;
                                return JSON.stringify(block?.properties || {}, null, 2);
                            })() : 'No recordMap'}
                        </pre>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto max-h-[500px]">
                        <h2 className="font-bold mb-2">First Post Processed</h2>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {JSON.stringify(data.posts?.[0] || {}, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto max-h-[500px]">
                        <h2 className="font-bold mb-2">First Post Author Data</h2>
                        <pre className="text-xs font-mono">
                            {data.posts?.[0] ? JSON.stringify({
                                title: data.posts[0].title,
                                authorName: data.posts[0].authorName,
                                authorAvatar: data.posts[0].authorAvatar,
                            }, null, 2) : 'No posts'}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
