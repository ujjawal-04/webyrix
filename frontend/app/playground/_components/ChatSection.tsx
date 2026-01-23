import React, { useState } from 'react';
import { Messages } from '../[projectId]/page';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageSquare, Trash2, Eraser, BookOpen } from 'lucide-react';
import PanelHeader from './PanelHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  messages: Messages[];
  onSend: (input: string) => void | Promise<void>;
  onDeleteMessage: (messageId: number) => void | Promise<void>;
  onClearChat: () => void | Promise<void>;
  loading: boolean;
  fullPrompt: string;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onMinimize: () => void;
};

function ChatSection({
  messages,
  onSend,
  onDeleteMessage,
  onClearChat,
  loading,
  isMinimized,
  isExpanded,
  onToggle,
  onExpand,
  onMinimize,
  fullPrompt
}: Props) {
  const [input, setInput] = useState<string>('');

  const handleSend = () => {
    if (!input?.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className={`${isMinimized ? 'w-12' : 'w-full'} h-full min-h-0 flex flex-col panel-transition bg-card/50 border-r border-border/50`}>

      <div className="flex items-center justify-between border-b border-border/50 pr-2">
        <div className="flex-1">
          <PanelHeader
            title="Chat"
            isMinimized={isMinimized}
            isExpanded={isExpanded}
            onToggle={onToggle}
            onExpand={onExpand}
            onMinimize={onMinimize}
            icon={<MessageSquare className="h-3.5 w-3.5" />}
          />
        </div>
        {!isMinimized && messages.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" title="Clear Chat">
                <Eraser className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Clear Chat History
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete all messages in this conversation? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-0">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!isMinimized && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" title="View AI Context">
                <BookOpen className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background border-border max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  AI Architect Context
                </DialogTitle>
                <DialogDescription>
                  The specific rules and metadata currently guiding the AI's generation logic.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex-1 overflow-y-auto rounded-lg bg-secondary/30 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-border/50">
                {fullPrompt || "Initializing context..."}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Message Section */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0'>
            {messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center animate-fade-in">
                <div className="bg-muted/50 rounded-full p-4 mb-3">
                  <MessageSquare className="h-6 w-6 opacity-50" />
                </div>
                <p className='text-sm font-medium mb-1'>No messages yet</p>
                <p className='text-xs opacity-70'>Start a conversation to generate designs</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative group/msg ${msg.role === 'user'
                      ? 'bg-[#1F1F1F] text-white border border-white/10 shadow-lg shadow-black/20'
                      : 'bg-secondary text-foreground border border-white/10 shadow-md'
                      }`}
                  >
                    {msg.content}
                    {msg.id && (
                      <button
                        onClick={() => onDeleteMessage(msg.id!)}
                        className={`absolute -top-2 ${msg.role === 'user' ? '-left-2' : '-right-2'} p-1.5 bg-background border border-border rounded-full text-muted-foreground hover:text-destructive opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-sm z-10`}
                        title="Delete message"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">

                <div className="flex items-center gap-2.5 rounded-2xl bg-secondary px-4 py-2.5 border border-white/10 shadow-md">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className='sticky bottom-0 z-40 p-4 border-t border-border/50' style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }}>
            <div className='gradient-border overflow-hidden rounded-xl bg-secondary/50'>
              <textarea
                placeholder='Describe your website design idea...'
                className='w-full resize-none border-0 bg-transparent px-4 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-0 min-h-[50px]'
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className='flex items-center justify-between px-3 pb-3'>
                <div className='text-[10px] text-muted-foreground/50'>
                  Press Enter to send, Shift + Enter for new line
                </div>
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className='h-8 w-8 bg-foreground text-background transition-all hover:bg-foreground/90 hover:shadow-lg hover:shadow-foreground/10 disabled:opacity-30'
                >
                  <ArrowUp className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatSection;
