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
      shadow h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-gray-900`}>

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
          <div className='flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 flex flex-col'>
            {messages?.length === 0 ? (
              <p className='text-gray-400 text-center text-sm'>No Messages</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[85%] text-sm ${msg.role === 'user'
                        ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-black dark:text-white'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && <div className='flex justify-center items-center p-4'>
              <div className='animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-zinc-800 dark:border-zinc-200'></div>
              <span className='ml-2 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm'>Thinking... Working on your request</span>
            </div>}
          </div>

          {/* Footer Input */}
          <div className='p-2 sm:p-3 border-t flex items-center gap-2'>
            <textarea
              placeholder='Describe your website design idea'
              className='flex-1 resize-none border rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:border-gray-600'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
              rows={2}
            />
            <Button onClick={handleSend} disabled={loading} size="icon" className='shrink-0'>
              <ArrowUp className='h-4 w-4' />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatSection;
