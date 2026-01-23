import React, { useState } from 'react';
import { Messages } from '../[projectId]/page';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageSquare } from 'lucide-react';
import PanelHeader from './PanelHeader';

type Props = {
  messages: Messages[];
  onSend: (input: string) => void | Promise<void>;
  loading: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onMinimize: () => void;
};

function ChatSection({
  messages,
  onSend,
  loading,
  isMinimized,
  isExpanded,
  onToggle,
  onExpand,
  onMinimize
}: Props) {
  const [input, setInput] = useState<string>('');

  const handleSend = () => {
    if (!input?.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className={`${isMinimized ? 'w-12' : 'w-full'} h-full min-h-0 flex flex-col panel-transition bg-card/50 border-r border-border/50`}>

      <PanelHeader
        title="Chat"
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onExpand={onExpand}
        onMinimize={onMinimize}
        icon={<MessageSquare className="h-3.5 w-3.5" />}
      />

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
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-[#1F1F1F] text-white border border-white/10 shadow-lg shadow-black/20'
                      : 'bg-secondary text-foreground border border-white/10 shadow-md'
                      }`}
                  >
                    {msg.content}
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
