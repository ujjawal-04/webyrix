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
  id?: number;
  role: string;
  content: string;
};

export type Frame = {
  projectId: string;
  frameId: string;
  designCode: string;
  chatMessages: Messages[];
};

const Prompt = `User Request: {userInput}
Project Context: {projectDescription}

You are a Legendary UI/UX Designer and Senior Front-end Architect. Your mission is to generate a visual masterpiece that is modern, professional, and flawlessly responsive.

### 1. DYNAMIC SCOPE ADAPTATION (CRITICAL)
- **COMPONENT MODE**: If the user asks for a specific item (e.g., "Signup Form", "Profile Card", "Navigation Bar"), generate **ONLY** that item. Wrap it in a clean, centered container with a subtle shadow to show it off professionally.
- **PAGE MODE**: If the user asks for a "Website" or "Landing Page", generate a comprehensive 8-12 section experience (Nav, Hero, Social Proof, Core Features, Detailed Benefits, Case Study/Gallery, Pricing/Plans, FAQ, High-Conversion CTA, Footer).

### 2. ADAPTIVE DESIGN & CREATIVE FREEDOM
- **Creative Color Theory**: Do NOT use default or generic color palettes. Select a sophisticated, harmonized palette tailored specifically to the user request and project context. Use vibrant accents, professionally balanced neutrals, and deep accessibility-compliant contrasts.
- **Visual Personality**: Match the "vibe" of the input. (e.g., High-end Law Firm = Elegant/Traditional; Modern AI Start-up = Futuristic/Glow; Wellness App = Serene/Natural).
- **The "High-End" Depth**: Apply multi-layered shadows (\`shadow-2xl\`), soft borders (\`border border-zinc-200/50\` or theme-balanced glassmorphism), and generous padding (\`py-24 md:py-32\`).

### 3. MASTER-CLASS ARCHITECTURE
- **Typography Mastery**: Strictly use **Inter**. Use bold weights (\`font-extrabold\`) for impact and tight tracking (\`tracking-tight\`) on primary headings.
- **Micro-Interactions**: Every interactive element MUST have: \`transition-all duration-300 hover:scale-[1.03] active:scale-95\`.
- **Images (MANDATORY)**: Always include high-fidelity Unsplash images: \`https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&q=80&w=1200\`. Match the industry perfectly.
- **Icons**: Use **FontAwesome 6** (\`fa-solid\`).

### 4. PRODUCTION-READY COPY
- **No Fillers**: Write actual, persuasive copy. Use "Value-First" headlines. 
- **Clarity**: Ensure the user experience is intuitive, clean, and professional.

### TECHNICAL SPECIFICATIONS:
- Frameworks: **Tailwind CSS**, **Flowbite**, **Inter Font**.
- **External CDNs (Include at the very top of <body>)**:
  \`\`\`html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.js"></script>
  \`\`\`

### OUTPUT RULES:
- Output **ONLY** the HTML code within \`\`\`html and \`\`\` fences.
- No conversational text or explanations.
- The result must be visually "stunning" and production-ready upon render.

GOAL: Build a result that earns a "Site of the Day" nomination. Excellence is the only option. 🚀`;

function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const { getToken } = useAuth();

  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [projectDetail, setProjectDetail] = useState<any>();
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

  // Resize state
  const [chatWidth, setChatWidth] = useState(400); // Default 400px
  const [isResizing, setIsResizing] = useState(false);

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

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      // Constrain width between 280px and 600px
      if (newWidth >= 280 && newWidth <= 600) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
    if (projectId) GetProjectDetails();
    if (frameId) GetFrameDetails();
  }, [frameId, projectId]);

  const GetProjectDetails = async () => {
    try {
      const token = await getToken();
      const result = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectDetail(result.data?.data);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const GetFrameDetails = async () => {
    try {
      const token = await getToken();
      const result = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/api/frames?frameId=${frameId}&projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Frame Details:", result.data);
      const data = result.data?.data;
      setFrameDetail(data);

      const designCode = data?.designCode;

      // ✅ Check if designCode exists before processing
      if (designCode) {
        let formattedCode = designCode;
        if (designCode.includes('```html')) {
          const index = designCode.indexOf('```html');
          formattedCode = designCode.slice(index + 7);
          const endIndex = formattedCode.indexOf('```');
          if (endIndex !== -1) {
            formattedCode = formattedCode.slice(0, endIndex);
          }
        }
        setGeneratedCode(formattedCode.trim());
      }

      // Auto-send first message if exists
      if (data?.chatMessages?.length === 1) {
        const userMsg = data?.chatMessages[0].content;
        SendMessage(userMsg);
      } else if (data?.chatMessages) {
        setMessages(data?.chatMessages);
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
      const finalPrompt = Prompt
        .replace('{userInput}', userInput)
        .replace('{projectDescription}', projectDetail?.description || 'A professional web application');

      const result = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: finalPrompt }]
        }),
      });

      const reader = result.body?.getReader();
      const decoder = new TextDecoder();

      let aiResponse = '';
      let generatedHtmlCode = '';
      let isCode = false;
      let buffer = '';

      // Create a temporary message for streaming
      setMessages((prev: any) => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const jsonStr = trimmedLine.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
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

                // Update chat to indicate we started generating code
                setMessages((prev: any) => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1].content = 'Generating your website...';
                  }
                  return newMessages;
                });
              } else if (isCode) {
                // If we are in code block, check for end
                if (aiResponse.includes('```', aiResponse.indexOf('```html') + 7)) {
                  const startIndex = aiResponse.indexOf('```html') + 7;
                  const endIndex = aiResponse.lastIndexOf('```');
                  generatedHtmlCode = aiResponse.slice(startIndex, endIndex);
                  setGeneratedCode(generatedHtmlCode);
                } else {
                  generatedHtmlCode += content;
                  setGeneratedCode(generatedHtmlCode);
                }
              } else {
                // Conversational text streaming
                setMessages((prev: any) => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1].content = aiResponse;
                  }
                  return newMessages;
                });
              }
            }
          } catch (e) {
            console.log('Error parsing JSON chunk:', e);
          }
        }
      }

      // Finalize the state after streaming ends
      if (isCode && generatedHtmlCode) {
        await saveGeneratedCode(generatedHtmlCode);
        setMessages((prev: any) => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = 'Your code is ready!';
          }
          return newMessages;
        });
      } else if (isCode) {
        // Fallback for code that ended but was somehow incorrectly sliced
        await saveGeneratedCode(aiResponse);
        setMessages((prev: any) => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = 'Your code is ready!';
          }
          return newMessages;
        });
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

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const token = await getToken();
      await axios.delete(process.env.NEXT_PUBLIC_API_URL + `/api/chats/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  }

  const handleClearChat = async () => {
    try {
      const token = await getToken();
      await axios.delete(process.env.NEXT_PUBLIC_API_URL + `/api/chats/frame/${frameId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
      toast.success('Chat cleared');
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat");
    }
  }

  return (
    <div className='h-screen flex flex-col bg-gradient-to-br from-background via-background to-card/20'>
      <PlaygroundHeader
        projectId={projectId as string}
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
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/30">
              <button
                aria-pressed={mobileTab === 'chat'}
                onClick={() => selectMobileTab('chat')}
                className={`flex-1 text-sm py-2 rounded-lg text-center transition-all duration-200 ${mobileTab === 'chat' ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Chat
              </button>
              <button
                aria-pressed={mobileTab === 'preview'}
                onClick={() => selectMobileTab('preview')}
                className={`flex-1 text-sm py-2 rounded-lg text-center transition-all duration-200 ${mobileTab === 'preview' ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Preview
              </button>
            </div>
          </div>
        )}
        {/* Chat Section */}
        {!panelStates.chat.minimized && screenSize !== 'mobile' && (
          <>
            <div style={{ width: panelStates.chat.expanded ? '40%' : `${chatWidth}px` }}>
              <ChatSection
                messages={messages}
                onSend={(input: string) => SendMessage(input)}
                onDeleteMessage={handleDeleteMessage}
                onClearChat={handleClearChat}
                loading={loading}
                fullPrompt={Prompt
                  .replace('{userInput}', '...')
                  .replace('{projectDescription}', projectDetail?.description || 'A professional web application')}
                isMinimized={panelStates.chat.minimized}
                isExpanded={panelStates.chat.expanded}
                onToggle={() => togglePanel('chat')}
                onExpand={() => expandPanel('chat')}
                onMinimize={() => resetPanel('chat')}
              />
            </div>

            {/* Resize Handle */}
            {!panelStates.chat.expanded && (
              <div
                onMouseDown={handleMouseDown}
                className={`w-1 bg-border/50 hover:bg-border hover:w-1.5 cursor-col-resize transition-all duration-150 relative group ${isResizing ? 'bg-primary w-1.5' : ''
                  }`}
              >
                <div className="absolute inset-y-0 -left-1 -right-1" />
                {/* Visual indicator on hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-8 bg-muted-foreground rounded-full" />
                    <div className="w-0.5 h-8 bg-muted-foreground rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mobile Chat Section */}
        {!panelStates.chat.minimized && screenSize === 'mobile' && mobileTab === 'chat' && (
          <ChatSection
            messages={messages}
            onSend={(input: string) => SendMessage(input)}
            onDeleteMessage={handleDeleteMessage}
            onClearChat={handleClearChat}
            loading={loading}
            fullPrompt={Prompt
              .replace('{userInput}', '...')
              .replace('{projectDescription}', projectDetail?.description || 'A professional web application')}
            isMinimized={panelStates.chat.minimized}
            isExpanded={panelStates.chat.expanded}
            onToggle={() => togglePanel('chat')}
            onExpand={() => expandPanel('chat')}
            onMinimize={() => resetPanel('chat')}
          />
        )}

        {/* Minimized Chat Panel (hidden on mobile to keep Preview clean) */}
        {panelStates.chat.minimized && screenSize !== 'mobile' && (
          <div className="w-12 h-full bg-card/50 border-r border-border flex flex-col items-center pt-4 cursor-pointer hover:bg-card transition-all duration-200" onClick={() => togglePanel('chat')}>
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
          <div className="w-12 h-full bg-card/50 border-l border-border flex flex-col items-center pt-4 cursor-pointer hover:bg-card transition-all duration-200" onClick={() => togglePanel('settings')}>
            <div className="writing-mode-vertical text-xs font-medium text-muted-foreground">Settings</div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PlayGround;
