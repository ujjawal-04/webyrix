import React from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    title: string;
    isMinimized: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onExpand?: () => void;
    onMinimize?: () => void;
    icon?: React.ReactNode;
    children?: React.ReactNode;
};

function PanelHeader({
    title,
    isMinimized,
    isExpanded,
    onToggle,
    onExpand,
    onMinimize,
    icon,
    children
}: Props) {

    if (isMinimized) {
        return (
            <div className="flex flex-col items-center justify-start h-full bg-card/50 border-r border-border/50 p-2 gap-2">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggle}
                                className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                                title={`Expand ${title}`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">Expand</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {icon && <div className="text-muted-foreground">{icon}</div>}
                <div className="writing-mode-vertical text-xs font-medium text-muted-foreground mt-4">
                    {title}
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-12 items-center justify-between border-b border-border/50 px-4">
                <div className="flex items-center gap-2">
                    {icon && <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary">{icon}</div>}
                    <span className="text-sm font-medium text-foreground">{title}</span>
                </div>
                {children && <div className="flex-1 flex justify-center">{children}</div>}
                <div className="flex items-center gap-0.5">
                    {!isExpanded && onExpand && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onExpand}
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Expand"
                                >
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Expand</TooltipContent>
                        </Tooltip>
                    )}
                    {isExpanded && onMinimize && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onMinimize}
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Reset size"
                                >
                                    <Minimize2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Collapse</TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggle}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                                title="Minimize"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Minimize</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider >
    );
}

export default PanelHeader;
