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
    <div className={`${isMinimized ? 'w-12' : isExpanded ? 'w-full md:w-2/5' : 'w-full md:w-80 lg:w-96'} 
      h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out bg-background border-r border-border`}>

      <PanelHeader
        title="Chat"
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onExpand={onExpand}
        onMinimize={onMinimize}
        icon={<MessageSquare className="h-4 w-4" />}
      />

      {!isMinimized && (
        <>
          {/* Message Section */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 flex flex-col'>
            {messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                 <div className="bg-muted rounded-full p-4 mb-3">
                   <MessageSquare className="h-6 w-6 opacity-50" />
                 </div>
                 <p className='text-sm font-medium mb-1'>No messages yet</p>
                 <p className='text-xs opacity-70'>Start a conversation to generate designs</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none border border-border'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && <div className='flex items-center gap-3 p-2 bg-muted/30 rounded-lg mx-2 border border-border/50'>
              <div className='animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent'></div>
              <span className='text-muted-foreground text-xs font-medium animate-pulse'>Thinking...</span>
            </div>}
          </div>

          {/* Footer Input */}
          <div className='p-3 border-t border-border bg-background/50 backdrop-blur-sm'>
            <div className="relative">
              <textarea
                placeholder='Describe your website design idea...'
                className='w-full resize-none border border-input bg-muted/30 rounded-xl pl-3 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all'
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={loading}
                rows={3}
                onKeyDown={(e) => {
                   if(e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                   }
                }}
              />
              <Button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                size="icon" 
                className='absolute right-2 bottom-2 h-8 w-8 rounded-lg transition-transform hover:scale-105 active:scale-95'
              >
                <ArrowUp className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatSection;
