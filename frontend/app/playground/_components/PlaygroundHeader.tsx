'use client';
import React, { useContext } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { OnSaveContext } from '@/context/OnSaveContext';
import Link from 'next/link';
import { Save, RotateCcw, Undo2, Redo2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  onRefresh?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

function PlaygroundHeader({ onRefresh, onUndo, onRedo, canUndo = false, canRedo = false }: Props) {

  const { onSaveData, setOnSaveData } = useContext(OnSaveContext);

  return (
    <div className='glass sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 px-4'>
      <Link href='/' className='flex gap-2.5 items-center hover:opacity-80 transition-opacity'>
        <Image src={'/logo.svg'} alt='Logo' width={32} height={32} />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Webyrix</h2>
      </Link>

      <TooltipProvider delayDuration={0}>
        <div className='flex items-center gap-1'>
          {/* Undo/Redo */}
          {(onUndo || onRedo) && (
            <div className="mr-2 hidden items-center rounded-lg border border-border/50 bg-secondary/30 p-0.5 md:flex">
              {onUndo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onUndo}
                      disabled={!canUndo}
                      className='h-7 w-7 text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <Undo2 className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Undo</TooltipContent>
                </Tooltip>
              )}
              {onRedo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onRedo}
                      disabled={!canRedo}
                      className='h-7 w-7 text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <Redo2 className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Redo</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  className='h-8 w-8 text-muted-foreground hover:text-foreground transition-colors'
                >
                  <RotateCcw className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Refresh Preview</TooltipContent>
            </Tooltip>
          )}

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setOnSaveData(Date.now())}
                size="sm"
                className='h-8 px-4 bg-foreground text-background transition-all hover:bg-foreground/90 hover:shadow-lg hover:shadow-foreground/10'
              >
                <Save className='h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline'>Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Save</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}

export default PlaygroundHeader
