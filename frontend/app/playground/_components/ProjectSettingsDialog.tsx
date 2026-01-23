'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Settings, BarChart3, Globe, Lock, Info, Calendar, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

type ProjectStats = {
    frameCount: number;
    userMessageCount: number;
    aiMessageCount: number;
    totalMessages: number;
    createdOn: string;
    updatedAt: string;
};

type Props = {
    projectId: string;
};

export default function ProjectSettingsDialog({ projectId }: Props) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [open, setOpen] = useState(false);
    const [projectData, setProjectData] = useState({
        description: '',
        isPublic: false
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            fetchProjectData();
        }
    }, [open, projectId]);

    const fetchProjectData = async () => {
        try {
            const token = await getToken();
            // Fetch stats
            const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data.data);

            // Fetch project details
            const projectRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = projectRes.data.data;
            setProjectData({
                description: data.description || '',
                isPublic: data.isPublic || false
            });
        } catch (error) {
            console.error("Error fetching project data:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Project settings updated');
        } catch (error) {
            console.error("Error updating project settings:", error);
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/view/${projectId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Share link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Project Settings
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Manage your project metadata and view usage statistics.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <BarChart3 className="h-3.5 w-3.5" />
                                <span className="text-[10px] uppercase font-bold tracking-wider">User Messages</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">{stats?.userMessageCount || 0}</span>
                            </div>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Settings className="h-3.5 w-3.5" />
                                <span className="text-[10px] uppercase font-bold tracking-wider">AI Messages</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">{stats?.aiMessageCount || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Info className="h-3.5 w-3.5" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Project Frames</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{stats?.frameCount || 0}</span>
                            <span className="text-[10px] text-muted-foreground uppercase opacity-70">Version history for this project</span>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What is this project about?"
                                className="bg-secondary/50 border-0 focus-visible:ring-1 resize-none h-20 text-sm"
                                value={projectData.description}
                                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    {projectData.isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4" />}
                                    Public Access
                                </Label>
                                <p className="text-[10px] text-muted-foreground">Allow others to view this project via link</p>
                            </div>
                            <Switch
                                checked={projectData.isPublic}
                                onCheckedChange={(checked) => setProjectData(prev => ({ ...prev, isPublic: checked }))}
                            />
                        </div>

                        {projectData.isPublic && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-xs font-medium">Share link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/view/${projectId}`}
                                        className="bg-secondary/50 border-0 text-[10px] h-8 focus-visible:ring-0 select-all"
                                    />
                                    <Button size="icon" variant="secondary" className="h-8 w-8 shrink-0" onClick={handleCopyLink}>
                                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        {stats && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-secondary/20 p-2 rounded-lg">
                                <Calendar className="h-3 w-3" />
                                <span>Created on {new Date(stats.createdOn).toLocaleDateString()}</span>
                            </div>
                        )}
                        <Button onClick={handleSave} disabled={loading} className="w-full bg-foreground text-background hover:bg-foreground/90">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
