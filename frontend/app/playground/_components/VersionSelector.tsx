'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { History, Clock } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Frame = {
    frameId: string;
    name: string | null;
    designCode: string | null;
    createdOn: string;
};

type Props = {
    frames: Frame[];
    currentFrameId: string | null;
};

export default function VersionSelector({ frames, currentFrameId }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const handleVersionChange = (frameId: string) => {
        router.replace(`${pathname}?frameId=${frameId}`);
    };

    // Sort frames by date descending and filter out empty ones
    const sortedFrames = [...frames]
        .filter(f => f.designCode) // Only show completed versions
        .sort((a, b) => {
            const dateA = new Date(a.createdOn).getTime();
            const dateB = new Date(b.createdOn).getTime();
            return dateB - dateA;
        });

    const currentFrameName = sortedFrames.find(f => f.frameId === currentFrameId)?.name ||
        (currentFrameId ? `Version ${sortedFrames.length - sortedFrames.findIndex(f => f.frameId === currentFrameId)}` : 'Select version');

    return (
        <div className="flex items-center">
            <Select value={currentFrameId || ''} onValueChange={handleVersionChange}>
                <SelectTrigger className="h-9 w-[200px] bg-background border-primary/30 text-[13px] gap-2 rounded-full hover:bg-secondary/50 transition-all hover:border-primary/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(var(--primary),0.05)] hover:shadow-[0_4px_12px_-3px_rgba(var(--primary),0.15)] ring-offset-background focus:ring-1 focus:ring-primary/20">
                    <div className="flex items-center justify-center gap-2 w-full truncate px-4">
                        <History className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                        <span className="truncate font-semibold text-foreground tracking-tight">
                            {currentFrameName}
                        </span>
                    </div>
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="bg-background/95 backdrop-blur-md border-border/50 min-w-[280px]">
                    <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1">
                        Design History
                    </div>
                    {sortedFrames.map((frame, index) => (
                        <SelectItem key={frame.frameId} value={frame.frameId} className="text-xs focus:bg-primary/5 cursor-pointer py-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">
                                        {frame.name || `Version ${sortedFrames.length - index}`}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
                                    <Clock className="h-2.5 w-2.5 text-primary/60" />
                                    {new Date(frame.createdOn).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
