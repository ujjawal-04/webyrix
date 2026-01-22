'use client';

import React, { useEffect, useState } from 'react';
import PlaygroundHeader from '../_components/PlaygroundHeader';
import ChatSection from '../_components/ChatSection';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import WebsiteDesign from '../_components/WebsiteDesign';
import { toast } from 'sonner';
import { usePanelState } from '@/hooks/usePanelState';
import ElementSettingSection from '../_components/ElementSettingSection';
import ImageSettingSection from '../_components/ImageSettingsSection';

export type Messages = {
  role: string;
  content: string;
};

export type Frame = {
  projectId: string;
  frameId: string;
  designCode: string;
  chatMessages: Messages[];
};

const Prompt = `userInput: {userInput}

Instructions:
1. If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

- Generate a complete HTML Tailwind CSS code using Flowbite UI components.
- Use a modern design with good colors.
- Only include the <body> content (do not add <head> or <title>).
- Make it fully responsive for all screen sizes.
- All primary components must match the theme color.
- Add proper padding and margin for each element.
- Components should be independent; do not connect them.
- Use placeholders for all images:
  https://community.softr.io/uploads/db9110/original/2X/7/746e2382d0ffd7773ca987e6f8817a86a7e391ba6.jpeg
  Dark mode: https://www.cibakoy.com/wp-content/uploads/2015/12/placeholder-3.jpg
- Add alt tag describing the image prompt.
- Use the following libraries/components where appropriate:
  - FontAwesome icons (fa fa-)
  - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, popovers, accordions, etc.
  - Chart.js for charts & graphs
  - Swiper.js for sliders/carousels
  - Tippy.js for tooltips & popovers
- Include interactive components like modals, dropdowns, and accordions.
- Ensure proper spacing, alignment, hierarchy, and theme consistency.
- Ensure charts are visually appealing and match the theme color.
- Header menu options should be spread out and not connected.
- Do not include broken links.
- Do not add any extra text before or after the HTML code.

2. If the user input is **general text or greetings** (e.g., "Hi", "Hello", "How are you?") that does not explicitly ask to generate code**, then:
- Respond with a simple, friendly text message instead of generating any code.

Example:
- User: "Hi" -> Response: "Hello! How can I help you today?"
- User: "Build a responsive landing page with Tailwind CSS" -> Response: [Generate full HTML code as per instructions above]
`;

function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const { getToken } = useAuth();

  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  // Panel state management
  const {
    panelStates,
    togglePanel,
    expandPanel,
    minimizePanel,
    resetPanel,
    screenSize
  } = usePanelState();

  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('preview');

  // Keep local mobile tab in sync with panelStates
  useEffect(() => {
    if (screenSize === 'mobile') {
      setMobileTab(panelStates.preview.minimized ? 'chat' : 'preview');
    }
  }, [panelStates, screenSize]);

  const selectMobileTab = (tab: 'chat' | 'preview') => {
    if (tab === 'chat') {
      resetPanel('chat');
      minimizePanel('preview');
      setMobileTab('chat');
    } else {
      resetPanel('preview');
      minimizePanel('chat');
      setMobileTab('preview');
    }
  };

  // Refresh iframe - force reload of generated code
  const handleRefresh = () => {
    const currentCode = generatedCode;
    setGeneratedCode('');
    setTimeout(() => {
      setGeneratedCode(currentCode);
      toast.success('Preview refreshed!');
    }, 50);
  };

  useEffect(() => {
    frameId && GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    try {
      const token = await getToken();
      const result = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/api/frames?frameId=${frameId}&projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Frame Details:", result.data);
      setFrameDetail(result.data);

      const designCode = result.data?.designCode;

      // ✅ Check if designCode exists before processing
      if (designCode) {
        const index = designCode.indexOf('```html');
        if (index !== -1) {
          const formattedCode = designCode.slice(index + 7);
          setGeneratedCode(formattedCode);
        } else {
          // If no code fence, use the code as-is
          setGeneratedCode(designCode);
        }
      }

      // Auto-send first message if exists
      if (result.data?.chatMessages?.length === 1) {
        const userMsg = result.data?.chatMessages[0].content;
        SendMessage(userMsg);
      } else if (result.data?.chatMessages) {
        setMessages(result.data?.chatMessages);
      }
    } catch (error) {
      console.error("Error fetching frame details:", error);
      toast.error("Failed to load frame details");
    }
  };

  const SendMessage = async (userInput: string) => {
    setLoading(true);

    // Add user message to chat
    setMessages((prev: any) => [...prev, { role: 'user', content: userInput }]);

    // Reset generatedCode before streaming new code
    setGeneratedCode('');


    try {
      const token = await getToken();
      const result = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: Prompt?.replace('{userInput}', userInput) }]
        }),
      });

      const reader = result.body?.getReader();
      const decoder = new TextDecoder();

      let aiResponse = '';
      let generatedHtmlCode = '';
      let isCode = false;

      while (reader) {
        const { done, value } = await reader?.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE format (data: {...})
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              if (jsonStr.trim() === '[DONE]') continue;

              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';

              if (content) {
                aiResponse += content;

                // Detect code fences
                if (!isCode && aiResponse.includes('```html')) {
                  isCode = true;
                  const index = aiResponse.indexOf('```html') + 7;
                  generatedHtmlCode = aiResponse.slice(index);
                  setGeneratedCode(generatedHtmlCode);
                } else if (isCode && !aiResponse.includes('```\n') && !aiResponse.endsWith('```')) {
                  generatedHtmlCode += content;
                  setGeneratedCode(generatedHtmlCode);
                } else if (isCode && (aiResponse.includes('```\n') || aiResponse.endsWith('```'))) {
                  // End of code block
                  const endIndex = generatedHtmlCode.lastIndexOf('```');
                  if (endIndex !== -1) {
                    generatedHtmlCode = generatedHtmlCode.slice(0, endIndex);
                    setGeneratedCode(generatedHtmlCode);
                  }
                }
              }
            } catch (e) {
              // Skip invalid JSON
              console.log('Skipping invalid JSON chunk');
            }
          }
        }
      }

      // Save the final code
      if (isCode && generatedHtmlCode) {
        await saveGeneratedCode(generatedHtmlCode);
      } else {
        await saveGeneratedCode(aiResponse);
      }

      // after streaming ends
      if (!isCode) {
        setMessages((prev: any) => [
          ...prev,
          { role: 'assistant', content: aiResponse }
        ]);
      } else {
        setMessages((prev: any) => [
          ...prev,
          { role: 'assistant', content: 'Your code is ready!' }
        ]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev: any) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' }
      ]);
      toast.error("Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      SaveMessages();
    }
  }, [messages]);

  const SaveMessages = async () => {
    try {
      const token = await getToken();
      const result = await axios.put(process.env.NEXT_PUBLIC_API_URL + '/api/frames/chats', {
        messages: messages,
        frameId: frameId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(result);
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  }

  const saveGeneratedCode = async (code: string) => {
    try {
      const token = await getToken();
      const result = await axios.put(process.env.NEXT_PUBLIC_API_URL + '/api/frames', {
        designCode: code,
        frameId: frameId,
        projectId: projectId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(result.data);
      toast.success('Website is Ready!');
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Failed to save website");
    }
  }

  return (
    <div className='h-screen flex flex-col bg-background'>
      <PlaygroundHeader
        onRefresh={handleRefresh}
        onUndo={() => toast.info('Undo functionality coming soon!')}
        onRedo={() => toast.info('Redo functionality coming soon!')}
        canUndo={false}
        canRedo={false}
      />

      <div className='flex flex-col md:flex-row flex-1 overflow-hidden'>
        {/* Mobile tab selector */}
        {screenSize === 'mobile' && (
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-lg p-1">
              <button
                aria-pressed={mobileTab === 'chat'}
                onClick={() => selectMobileTab('chat')}
                className={`flex-1 text-sm py-2 rounded-md text-center ${mobileTab === 'chat' ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
              >
                Chat
              </button>
              <button
                aria-pressed={mobileTab === 'preview'}
                onClick={() => selectMobileTab('preview')}
                className={`flex-1 text-sm py-2 rounded-md text-center ${mobileTab === 'preview' ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
              >
                Preview
              </button>
            </div>
          </div>
        )}
        {/* Chat Section */}
        {!panelStates.chat.minimized && (
          <ChatSection
            messages={messages}
            onSend={(input: string) => SendMessage(input)}
            loading={loading}
            isMinimized={panelStates.chat.minimized}
            isExpanded={panelStates.chat.expanded}
            onToggle={() => togglePanel('chat')}
            onExpand={() => expandPanel('chat')}
            onMinimize={() => resetPanel('chat')}
          />
        )}

        {/* Minimized Chat Panel (hidden on mobile to keep Preview clean) */}
        {panelStates.chat.minimized && screenSize !== 'mobile' && (
          <div className="w-12 h-full bg-background border-r border-border flex flex-col items-center pt-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => togglePanel('chat')}>
            <div className="writing-mode-vertical text-xs font-medium text-muted-foreground">Chat</div>
          </div>
        )}

        {/* Website Design Section (render on desktop/tablet or when Preview tab selected on mobile) */}
        {(screenSize !== 'mobile' || mobileTab === 'preview') && (
          <WebsiteDesign
            generatedCode={generatedCode?.replace('```', '')}
            isMinimized={panelStates.preview.minimized}
            isExpanded={panelStates.preview.expanded}
            onToggle={() => togglePanel('preview')}
            onExpand={() => expandPanel('preview')}
            onMinimize={() => resetPanel('preview')}
            onElementSelect={setSelectedElement}
          />
        )}

        {/* Settings Panel - Right Side */}
        {selectedElement && !panelStates.settings.minimized && (
          <>
            {selectedElement.tagName === 'IMG' ? (
              <ImageSettingSection
                // @ts-ignore
                selectedEl={selectedElement}
                isMinimized={panelStates.settings.minimized}
                isExpanded={panelStates.settings.expanded}
                onToggle={() => togglePanel('settings')}
                onExpand={() => expandPanel('settings')}
                onMinimize={() => resetPanel('settings')}
              />
            ) : (
              <ElementSettingSection
                selectedEl={selectedElement}
                clearSelection={() => setSelectedElement(null)}
                isMinimized={panelStates.settings.minimized}
                isExpanded={panelStates.settings.expanded}
                onToggle={() => togglePanel('settings')}
                onExpand={() => expandPanel('settings')}
                onMinimize={() => resetPanel('settings')}
              />
            )}
          </>
        )}

        {/* Minimized Settings Panel (hidden on mobile) */}
        {panelStates.settings.minimized && selectedElement && screenSize !== 'mobile' && (
          <div className="w-12 h-full bg-background border-l border-border flex flex-col items-center pt-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => togglePanel('settings')}>
            <div className="writing-mode-vertical text-xs font-medium text-muted-foreground">Settings</div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PlayGround;
