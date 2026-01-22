import React from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    title: string;
    isMinimized: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onExpand?: () => void;
    onMinimize?: () => void;
    icon?: React.ReactNode;
};

function PanelHeader({
    title,
    isMinimized,
    isExpanded,
    onToggle,
    onExpand,
    onMinimize,
    icon
}: Props) {

    if (isMinimized) {
        return (
            <div className="flex flex-col items-center justify-start h-full bg-background border-r border-border p-2 gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    title={`Expand ${title}`}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                {icon && <div className="text-muted-foreground">{icon}</div>}
                <div className="writing-mode-vertical text-xs font-medium text-muted-foreground mt-4">
                    {title}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 border-b border-border bg-background">
            <div className="flex items-center gap-2">
                {icon && <div className="text-muted-foreground">{icon}</div>}
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            </div>
            <div className="flex items-center gap-1">
                {!isExpanded && onExpand && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExpand}
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title="Expand"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                )}
                {isExpanded && onMinimize && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMinimize}
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title="Reset size"
                    >
                        <Minimize2 className="h-3.5 w-3.5" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="w-7 h-7 text-muted-foreground hover:text-foreground"
                    title="Minimize"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default PanelHeader;
