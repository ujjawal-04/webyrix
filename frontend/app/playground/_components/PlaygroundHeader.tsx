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
    <div className='flex justify-between items-center p-2 sm:p-3 md:p-4 bg-background border-b border-border'>
      <Link href='/' className='flex gap-1 sm:gap-2 items-center hover:opacity-80 transition-opacity'>
        <Image src={'/logo.svg'} alt='Logo' width={32} height={32} className='sm:w-10 sm:h-10' />
        <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-foreground">Webyrix</h2>
      </Link>

      <div className='flex items-center gap-1 sm:gap-2'>
        <TooltipProvider>
          {/* Undo Button */}
          {onUndo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className='h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground'
                >
                  <Undo2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
          )}

          {/* Redo Button */}
          {onRedo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className='h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground'
                >
                  <Redo2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className='h-8 sm:h-9 gap-1 text-muted-foreground hover:text-foreground border-input'
                >
                  <RotateCcw className='h-4 w-4' />
                  <span className='hidden sm:inline'>Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Preview</TooltipContent>
            </Tooltip>
          )}

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setOnSaveData(Date.now())}
                className='h-8 sm:h-9 text-sm px-3 sm:px-4 gap-1'
              >
                <Save className='h-4 w-4' />
                <span className='hidden sm:inline'>Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Changes (Ctrl+S)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default PlaygroundHeader
