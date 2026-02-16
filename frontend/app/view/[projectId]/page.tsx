'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Globe, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';

export default function ViewProject() {
    const { projectId } = useParams();
    const { getToken } = useAuth();
    const searchParams = useSearchParams();
    const isPreviewMode = searchParams.get('mode') === 'preview';

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setProject(res.data.data);
        } catch (err: any) {
            console.error("Error fetching project:", err);
            setError(err.response?.data?.message || 'Failed to load project. It might be private or deleted.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching design...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <Globe className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                    {error}
                </p>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        );
    }

    const extractHtmlCode = (code: string) => {
        if (!code) return '';
        // Try to match the whole block first
        const htmlMatch = code.match(/```html([\s\S]*?)```/);
        if (htmlMatch && htmlMatch[1]) {
            return htmlMatch[1].trim();
        }

        // Fallback for partial fences
        let processed = code
            .replace(/```html/g, "")
            .replace(/```/g, "")
            .replace(/^html,/, "")
            .trim();

        return processed;
    };

    const frameId = searchParams.get('frameId');

    // Use specific frame if requested, otherwise use latest
    const selectedFrame = project.frames && project.frames.length > 0
        ? (frameId
            ? project.frames.find((f: any) => f.frameId === frameId)
            : project.frames.sort((a: any, b: any) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())[0])
        : null;

    const displayCode = selectedFrame ? extractHtmlCode(selectedFrame.designCode) : '';
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* Header */}
            {!isPreviewMode && (
                <header className="h-14 flex items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
                            <span className="font-semibold text-sm">Webyrix</span>
                        </Link>
                        <div className="h-4 w-[1px] bg-border/50" />
                        <div className="flex flex-col">
                            <span className="text-xs font-medium">{project.description || 'Shared Project'}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Globe className="h-2.5 w-2.5" />
                                Public Preview
                            </span>
                        </div>
                    </div>

                    <Link href="/">
                        <Button size="sm" variant="outline" className="text-xs gap-2">
                            Build your own
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </Link>
                </header>
            )}

            {/* Preview */}
            <main className="flex-1 bg-transparent">
                {displayCode ? (
                    <iframe
                        srcDoc={displayCode}
                        title="Project Preview"
                        className="w-full h-full border-0 bg-transparent"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <p>No design code found for this project.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
