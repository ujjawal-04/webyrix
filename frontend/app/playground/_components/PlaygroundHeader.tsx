'use client';
import React, { useContext } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { OnSaveContext } from '@/context/OnSaveContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Save, RotateCcw, Undo2, Redo2, Settings } from 'lucide-react';
import ProjectSettingsDialog from './ProjectSettingsDialog';

type Props = {
  projectId: string;
  onRefresh?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onProjectUpdate?: (data: { description: string; isPublic: boolean }) => void;
};

function PlaygroundHeader({ projectId, onRefresh, onUndo, onRedo, canUndo = false, canRedo = false, onProjectUpdate }: Props) {

  const { setOnSaveData } = useContext(OnSaveContext);

  return (
    <div className='glass sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 px-4'>
      <Link href='/' className='flex gap-2.5 items-center hover:opacity-80 transition-opacity'>
        <Image src={'/logo.svg'} alt='Logo' width={32} height={32} />
        <h2 className="hidden sm:block text-lg font-semibold tracking-tight text-foreground">Webyrix</h2>
      </Link>

      <div className='flex items-center gap-1'>
        {/* Undo/Redo Buttons - Directly exposed for reliability */}
        <div className="mr-2 flex items-center gap-0.5 rounded-lg border border-border/50 bg-secondary/30 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className='h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all disabled:opacity-30'
          >
            <Undo2 className='h-4 w-4' />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className='h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all disabled:opacity-30'
          >
            <Redo2 className='h-4 w-4' />
          </Button>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            title="Refresh Preview"
            className='h-8 w-8 text-muted-foreground hover:text-foreground transition-colors'
          >
            <RotateCcw className='h-4 w-4' />
          </Button>
        )}

        {/* Project Settings */}
        <ProjectSettingsDialog projectId={projectId} onUpdate={onProjectUpdate} />

        {/* Save Button */}
        <Button
          onClick={() => setOnSaveData(Date.now())}
          size="sm"
          className='h-8 px-4 ml-1 bg-foreground text-background transition-all hover:bg-foreground/90 hover:shadow-lg hover:shadow-foreground/10'
        >
          <Save className='h-4 w-4 sm:mr-2' />
          <span className='hidden sm:inline'>Save</span>
        </Button>
      </div>
    </div>
  )
}

export default PlaygroundHeader