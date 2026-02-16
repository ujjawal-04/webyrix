'use client';

import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, History, Clock, Check } from "lucide-react"
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Frame = {
    frameId: string;
    name: string | null;
    designCode: string | null;
    createdOn: string;
};

type Props = {
    frames: Frame[];
    currentFrameId: string | null;
    onDelete?: (frameId: string) => void;
};

export default function VersionSelector({ frames, currentFrameId, onDelete }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const { getToken } = useAuth();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleVersionChange = (frameId: string) => {
        router.replace(`${pathname}?frameId=${frameId}`);
        setIsMenuOpen(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const token = await getToken();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/frames/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Version deleted successfully');
            if (onDelete) onDelete(deleteId);
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error('Failed to delete version');
        } finally {
            setDeleteId(null);
            setIsDeleteDialogOpen(false);
            // Keep menu open to allow more management
            setIsMenuOpen(true);
        }
    };

    const openDeleteDialog = (e: React.MouseEvent | React.PointerEvent, frameId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteId(frameId);
        setIsDeleteDialogOpen(true);
        setIsMenuOpen(true);
    };

    // Sort frames by date descending and filter out empty ones
    const sortedFrames = [...frames]
        .filter(f => f.designCode !== null && f.designCode !== undefined)
        .sort((a, b) => {
            const dateA = new Date(a.createdOn).getTime();
            const dateB = new Date(b.createdOn).getTime();
            return dateB - dateA;
        });

    const currentFrameName = sortedFrames.find(f => f.frameId === currentFrameId)?.name ||
        (currentFrameId ? `Version ${sortedFrames.length - sortedFrames.findIndex(f => f.frameId === currentFrameId)}` : 'Select version');

    return (
        <div className="flex items-center">
            <DropdownMenu
                open={isMenuOpen}
                onOpenChange={(open) => {
                    // Prevent closure if the delete dialog is being handled
                    if (!open && isDeleteDialogOpen) return;
                    setIsMenuOpen(open);
                }}
            >
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-9 w-[200px] bg-background border-primary/30 text-[13px] gap-2 rounded-full hover:bg-secondary/50 transition-all hover:border-primary/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(var(--primary),0.05)] hover:shadow-[0_4px_12px_-3px_rgba(var(--primary),0.15)] ring-offset-background focus:ring-1 focus:ring-primary/20 p-0"
                    >
                        <div className="flex items-center justify-center gap-2 w-full truncate px-4">
                            <History className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                            <span className="truncate font-semibold text-foreground tracking-tight">
                                {currentFrameName}
                            </span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="bg-background/95 backdrop-blur-md border-border/50 min-w-[280px] p-1"
                    onPointerDownOutside={(e) => {
                        if (isDeleteDialogOpen) e.preventDefault();
                    }}
                >
                    <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1">
                        Design History
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {sortedFrames.map((frame, index) => (
                            <DropdownMenuItem
                                key={frame.frameId}
                                onSelect={(e) => {
                                    // If clicking the delete button, don't select the version
                                    if (deleteId === frame.frameId && isDeleteDialogOpen) {
                                        e.preventDefault();
                                        return;
                                    }
                                    handleVersionChange(frame.frameId);
                                }}
                                className={cn(
                                    "text-xs focus:bg-primary/5 cursor-pointer py-2.5 group/item relative px-3 flex items-center justify-between",
                                    currentFrameId === frame.frameId && "bg-primary/5"
                                )}
                            >
                                <div className="flex flex-col gap-0.5 max-w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-semibold whitespace-nowrap truncate",
                                            currentFrameId === frame.frameId ? "text-primary" : "text-foreground"
                                        )}>
                                            {frame.name || `Version ${sortedFrames.length - index}`}
                                        </span>
                                        {currentFrameId === frame.frameId && (
                                            <Check className="h-3 w-3 text-primary shrink-0" />
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5 font-medium">
                                        <Clock className="h-2.5 w-2.5 text-primary/60" />
                                        {new Date(frame.createdOn).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => openDeleteDialog(e, frame.frameId)}
                                    className="h-8 w-8 justify-center items-center flex opacity-0 group-hover/item:opacity-100 z-30 transition-all rounded-full hover:bg-red-600 group/delete-btn"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500 transition-colors group-hover/delete-btn:text-white" />
                                </Button>
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) {
                        setIsMenuOpen(true);
                    }
                }}
            >
                <AlertDialogContent
                    className="bg-background border-border sm:max-w-[440px] p-6 gap-6"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <AlertDialogHeader className="gap-3">
                        <AlertDialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600">
                            <div className="p-2 bg-red-50 rounded-full">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            Delete Version
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-[14px] leading-relaxed pt-2">
                            Are you sure you want to delete <span className="font-semibold text-foreground px-1 py-0.5 bg-secondary/30 rounded">"{sortedFrames.find(f => f.frameId === deleteId)?.name || 'this version'}"</span>?
                            This action is permanent and will remove this design history from your project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:gap-3 items-center">
                        <AlertDialogCancel
                            className="bg-secondary/50 hover:bg-secondary text-sm h-10 px-6 border-none transition-colors"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700 text-sm h-10 px-6 border-none shadow-md transition-all active:scale-95"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}