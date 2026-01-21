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
            <div className="flex flex-col items-center justify-start h-full bg-gray-100 dark:bg-gray-800 border-r p-2 gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="w-8 h-8"
                    title={`Expand ${title}`}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                {icon && <div className="text-gray-600 dark:text-gray-400">{icon}</div>}
                <div className="writing-mode-vertical text-xs font-medium text-gray-600 dark:text-gray-400 mt-4">
                    {title}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
                {icon && <div className="text-gray-700 dark:text-gray-300">{icon}</div>}
                <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <div className="flex items-center gap-1">
                {!isExpanded && onExpand && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExpand}
                        className="w-7 h-7"
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
                        className="w-7 h-7"
                        title="Reset size"
                    >
                        <Minimize2 className="h-3.5 w-3.5" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="w-7 h-7"
                    title="Minimize"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default PanelHeader;
