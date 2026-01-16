import React, { useState } from 'react';
import { Messages } from '../[projectId]/page';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

type Props = {
  messages: Messages[];
  onSend: (input: string) => void | Promise<void>;
  loading: boolean; // <-- added loading prop
};

function ChatSection({ messages, onSend, loading}: Props) {
  const [input, setInput] = useState<string>('');

  const handleSend = () => {
    if (!input?.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className='w-96 shadow h-[94vh] p-4 flex flex-col'>
      {/* Message Section */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3 flex flex-col'>
        {messages?.length === 0 ? (
          <p className='text-gray-400 text-center'>No Messages</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-gray-100 text-black'
                    : 'bg-gray-300 text-black'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        { loading && <div className='flex justify-center items-center p-4'>
         <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-800'></div>
         <span className='ml-2 text-zinc-800'>Thinking... Working on your request</span>
        </div>}
      </div>

      {/* Footer Input */}
      <div className='p-3 border-t flex items-center gap-2'>
        <textarea
          placeholder='Describe your website design idea'
          className='flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2'
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={loading} // disable input while loading
        />
        <Button onClick={handleSend} disabled={loading}>
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
}

export default ChatSection;
