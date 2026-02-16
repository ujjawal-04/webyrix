'use client';

import React, { useEffect, useState, useRef } from 'react';
import PlaygroundHeader from '../_components/PlaygroundHeader';
import ChatSection from '../_components/ChatSection';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import WebsiteDesign from '../_components/WebsiteDesign';
import { toast } from 'sonner';
import { usePanelState } from '@/hooks/usePanelState';
import ElementSettingSection from '../_components/ElementSettingSection';
import ImageSettingSection from '../_components/ImageSettingsSection';
import { v4 as uuidv4 } from 'uuid';

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
- micro-Interactions**: Every interactive element MUST have: \`transition-all duration-300 hover:scale-[1.03] active:scale-95\`.
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

const useHistory = (initialState: string) => {
  const [history, setHistory] = useState<string[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const set = (newState: string) => {
    if (!newState || newState === history[currentIndex]) return;
    const nextHistory = [...history.slice(0, currentIndex + 1), newState];
    setHistory(nextHistory);
    setCurrentIndex(nextHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const redo = () => {
    if (currentIndex < history.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const reset = (state: string) => {
    setHistory([state]);
    setCurrentIndex(0);
  }

  return {
    state: history[currentIndex],
    set,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    reset
  };
};

function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const frameId = params.get('frameId');
  const { getToken } = useAuth();
  const prevFrameIdRef = useRef<string | null>(null);

  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [projectDetail, setProjectDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);

  const {
    state: generatedCode,
    set: setGeneratedCode,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetGeneratedCode
  } = useHistory('');

  const [streamingCode, setStreamingCode] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const isGeneratingRef = useRef(false);
  const hasAutoResumedRef = useRef(false);
  const [viewingStreaming, setViewingStreaming] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const {
    panelStates,
    togglePanel,
    expandPanel,
    minimizePanel,
    resetPanel,
    screenSize
  } = usePanelState();

  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('preview');
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) setChatWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleRefresh = () => {
    const currentCode = generatedCode;
    resetGeneratedCode(currentCode);
    toast.success('Preview refreshed!');
  };

  useEffect(() => {
    if (projectId) {
      const frameChanged = prevFrameIdRef.current !== frameId;
      if (frameChanged || !prevFrameIdRef.current) {
        FetchInitialData(true);
      }
      prevFrameIdRef.current = frameId;
      setViewingStreaming(false);
    }
  }, [frameId, projectId]);

  // Handle Undo/Redo key bindings for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const FetchInitialData = async (shouldResetHistory: boolean = false) => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const isValidProjectId = projectId && projectId !== 'undefined';
      const isValidFrameId = frameId && frameId !== 'undefined';

      const [projectRes, frameRes] = await Promise.all([
        isValidProjectId ? axios.get(process.env.NEXT_PUBLIC_API_URL + `/api/projects/${projectId}`, { headers }).catch(e => { console.error("Project fetch 404/Error:", e); return null; }) : Promise.resolve(null),
        isValidFrameId ? axios.get(process.env.NEXT_PUBLIC_API_URL + `/api/frames?frameId=${frameId}&projectId=${projectId}`, { headers }).catch(e => { console.error("Frame fetch 404/Error:", e); return null; }) : Promise.resolve(null)
      ]);

      if (projectRes) {
        const projectData = projectRes.data?.data;
        setProjectDetail(projectData);
        if (projectData?.chats) {
          setMessages(projectData.chats);
          const sortedFrames = [...(projectData.frames || [])].sort((a: any, b: any) =>
            new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
          );
          const latestFrame = sortedFrames[0];
          if (latestFrame && !latestFrame.designCode && projectData.chats.length > 0 && !isGeneratingRef.current && !hasAutoResumedRef.current) {
            const userMessages = projectData.chats.filter((m: any) => m.role === 'user');
            const lastUserMsg = userMessages[userMessages.length - 1]?.content;
            if (lastUserMsg) {
              hasAutoResumedRef.current = true;
              setTimeout(() => SendMessage(lastUserMsg, true), 1000);
            }
          }
        }

        if (!frameId && projectData?.frames?.length > 0) {
          const sortedFrames = [...projectData.frames].sort((a: any, b: any) =>
            new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
          );
          const latestFrame = sortedFrames[0];
          setFrameDetail(latestFrame);
          if (latestFrame.designCode) {
            let formattedCode = latestFrame.designCode;
            if (formattedCode.includes('```html')) {
              const index = formattedCode.indexOf('```html');
              formattedCode = formattedCode.slice(index + 7);
              const endIndex = formattedCode.indexOf('```');
              if (endIndex !== -1) formattedCode = formattedCode.slice(0, endIndex);
            }
            if (shouldResetHistory) resetGeneratedCode(formattedCode.trim());
            else setGeneratedCode(formattedCode.trim());
          }
          if (!frameId) router.replace(`${pathname}?frameId=${latestFrame.frameId}`, { scroll: false });
        }
      }

      if (frameRes) {
        const data = frameRes.data?.data;
        setFrameDetail(data);
        const designCode = data?.designCode;
        if (designCode !== undefined) {
          let formattedCode = designCode || '';
          if (formattedCode.includes('```html')) {
            const index = formattedCode.indexOf('```html');
            formattedCode = formattedCode.slice(index + 7);
            const endIndex = formattedCode.indexOf('```');
            if (endIndex !== -1) formattedCode = formattedCode.slice(0, endIndex);
          }
          if (shouldResetHistory) resetGeneratedCode(formattedCode.trim());
          else setGeneratedCode(formattedCode.trim());
        }
        if (data?.chats || data?.chatMessages) setMessages(data?.chats || data?.chatMessages);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const SendMessage = async (userInput: string, isAutoResume: boolean = false) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsChatLoading(true);
    setIsStreaming(true);
    setStreamingCode('');
    setViewingStreaming(true);
    if (!isAutoResume) {
      setMessages((prev: any) => [...prev, { role: 'user', content: userInput }]);
    }
    try {
      const token = await getToken();
      const finalPrompt = Prompt
        .replace('{userInput}', userInput)
        .replace('{projectDescription}', projectDetail?.description || 'A professional web application');

      const result = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: finalPrompt }]
        })
      });

      const reader = result.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      let generatedHtmlCode = '';
      let isCode = false;
      let buffer = '';
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
              if (!isCode && aiResponse.includes('```html')) {
                isCode = true;
                const index = aiResponse.indexOf('```html') + 7;
                generatedHtmlCode = aiResponse.slice(index);
                setStreamingCode(generatedHtmlCode);
                setMessages((prev: any) => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0) newMessages[newMessages.length - 1].content = 'Generating your website...';
                  return newMessages;
                });
              } else if (isCode) {
                if (aiResponse.includes('```', aiResponse.indexOf('```html') + 7)) {
                  const startIndex = aiResponse.indexOf('```html') + 7;
                  const endIndex = aiResponse.lastIndexOf('```');
                  generatedHtmlCode = aiResponse.slice(startIndex, endIndex);
                  setStreamingCode(generatedHtmlCode);
                } else {
                  generatedHtmlCode += content;
                  setStreamingCode(generatedHtmlCode);
                }
              } else {
                setMessages((prev: any) => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0) newMessages[newMessages.length - 1].content = aiResponse;
                  return newMessages;
                });
              }
            }
          } catch (e) {
            console.log('Error parsing JSON chunk:', e);
          }
        }
      }
      setIsChatLoading(false);
      setIsStreaming(false);

      if (isCode && generatedHtmlCode) {
        // Reset history to the newly generated code so undo history starts fresh for this version
        resetGeneratedCode(generatedHtmlCode);
        setMessages((prev: any) => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = 'Your website is ready!';
          }
          return newMessages;
        });
        toast.success("Your website is ready!");
        await saveGeneratedCode(generatedHtmlCode);
      } else if (aiResponse) {
        setMessages((prev: any) => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = aiResponse;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev: any) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
      toast.error("Failed to generate code");
    } finally {
      setIsChatLoading(false);
      setIsStreaming(false);
      isGeneratingRef.current = false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 0) SaveMessages();
    }, 2000);
    return () => clearTimeout(timer);
  }, [messages]);

  const SaveMessages = async () => {
    try {
      const token = await getToken();
      await axios.put(process.env.NEXT_PUBLIC_API_URL + '/api/frames/chats', {
        messages: messages,
        projectId: projectId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  };

  const saveGeneratedCode = async (code: string) => {
    try {
      const token = await getToken();
      const existingVersions = projectDetail?.frames?.filter((f: any) => f.designCode) || [];
      const nextVersionNumber = existingVersions.length + 1;
      const versionName = `Version ${nextVersionNumber}`;
      const isInitialFrame = !frameDetail?.designCode;
      let res: any;
      if (isInitialFrame && frameId) {
        res = await axios.put(process.env.NEXT_PUBLIC_API_URL + '/api/frames', {
          frameId: frameId,
          projectId: projectId,
          designCode: code,
          name: versionName
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedFrame = res.data.data;
        handleFrameUpdate(updatedFrame);
      } else {
        const newFrameId = uuidv4();
        res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/frames/version', {
          frameId: newFrameId,
          projectId: projectId,
          designCode: code,
          messages: messages,
          name: versionName
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const newFrame = res.data.data;
        setFrameDetail(newFrame);
        setProjectDetail((prev: any) => {
          if (!prev) return prev;
          return { ...prev, frames: [...(prev.frames || []), newFrame] };
        });
        if (viewingStreaming) router.replace(`${pathname}?frameId=${newFrameId}`);
      }
    } catch (error) {
      console.error("Error saving code version:", error);
      toast.error("Failed to save website version");
    }
  };

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

  const handleFrameUpdate = (updatedFrame: any) => {
    setFrameDetail(updatedFrame);
    setProjectDetail((prev: any) => {
      if (!prev) return prev;
      const updatedFrames = (prev.frames || []).map((f: any) => f.frameId === updatedFrame.frameId ? updatedFrame : f);
      return { ...prev, frames: updatedFrames };
    });
  };

  const handleDeleteVersion = (deletedFrameId: string) => {
    setProjectDetail((prev: any) => {
      if (!prev) return prev;
      const filteredFrames = (prev.frames || []).filter((f: any) => f.frameId !== deletedFrameId);

      // If we deleted the current frame, navigate to the latest remaining version
      if (frameId === deletedFrameId && filteredFrames.length > 0) {
        const sorted = [...filteredFrames].sort((a: any, b: any) =>
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        );
        router.replace(`${pathname}?frameId=${sorted[0].frameId}`, { scroll: false });
      } else if (filteredFrames.length === 0) {
        router.replace(`${pathname}`, { scroll: false });
      }

      return { ...prev, frames: filteredFrames };
    });
  };

  return (
    <div className='h-screen flex flex-col bg-gradient-to-br from-background via-background to-card/20'>
      <PlaygroundHeader
        projectId={projectId as string}
        onRefresh={handleRefresh}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onProjectUpdate={(data) => setProjectDetail((prev: any) => ({ ...prev, ...data }))}
      />

      <div className='flex flex-col md:flex-row flex-1 overflow-hidden'>
        {screenSize === 'mobile' && (
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/30">
              <button onClick={() => selectMobileTab('chat')} className={`flex-1 text-sm py-2 rounded-lg text-center transition-all duration-200 ${mobileTab === 'chat' ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chat</button>
              <button onClick={() => selectMobileTab('preview')} className={`flex-1 text-sm py-2 rounded-lg text-center transition-all duration-200 ${mobileTab === 'preview' ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Preview</button>
            </div>
          </div>
        )}
        {!panelStates.chat.minimized && screenSize !== 'mobile' && (
          <>
            <div style={{ width: panelStates.chat.expanded ? '40%' : `${chatWidth}px` }}>
              <ChatSection
                messages={messages}
                onSend={(input: string) => SendMessage(input)}
                onDeleteMessage={handleDeleteMessage}
                onClearChat={handleClearChat}
                loading={isChatLoading}
                fullPrompt={Prompt.replace('{userInput}', '...').replace('{projectDescription}', projectDetail?.description || 'A professional web application')}
                isMinimized={panelStates.chat.minimized}
                isExpanded={panelStates.chat.expanded}
                onToggle={() => togglePanel('chat')}
                onExpand={() => expandPanel('chat')}
                onMinimize={() => resetPanel('chat')}
              />
            </div>
            {!panelStates.chat.expanded && (
              <div onMouseDown={handleMouseDown} className={`w-1 bg-border/50 hover:bg-border hover:w-1.5 cursor-col-resize transition-all duration-150 relative group ${isResizing ? 'bg-primary w-1.5' : ''}`}>
                <div className="absolute inset-y-0 -left-1 -right-1" />
              </div>
            )}
          </>
        )}
        {!panelStates.chat.minimized && screenSize === 'mobile' && mobileTab === 'chat' && (
          <ChatSection
            messages={messages}
            onSend={(input: string) => SendMessage(input)}
            onDeleteMessage={handleDeleteMessage}
            onClearChat={handleClearChat}
            loading={isChatLoading}
            fullPrompt={Prompt.replace('{userInput}', '...').replace('{projectDescription}', projectDetail?.description || 'A professional web application')}
            isMinimized={panelStates.chat.minimized}
            isExpanded={panelStates.chat.expanded}
            onToggle={() => togglePanel('chat')}
            onExpand={() => expandPanel('chat')}
            onMinimize={() => resetPanel('chat')}
          />
        )}
        {panelStates.chat.minimized && screenSize !== 'mobile' && (
          <div className="w-12 h-full bg-card/50 border-r border-border flex flex-col items-center pt-4 cursor-pointer hover:bg-card transition-all duration-200" onClick={() => togglePanel('chat')}>
            <div className="writing-mode-vertical text-xs font-medium text-muted-foreground">Chat</div>
          </div>
        )}
        {(screenSize !== 'mobile' || mobileTab === 'preview') && (
          <WebsiteDesign
            generatedCode={(isStreaming && viewingStreaming) ? streamingCode : generatedCode}
            isMinimized={panelStates.preview.minimized}
            isExpanded={panelStates.preview.expanded}
            onToggle={() => togglePanel('preview')}
            onExpand={() => expandPanel('preview')}
            onMinimize={() => resetPanel('preview')}
            onElementSelect={setSelectedElement}
            frames={projectDetail?.frames || []}
            currentFrame={frameDetail}
            isStreaming={isStreaming}
            onCodeUpdate={(newCode) => setGeneratedCode(newCode)}
            onFrameUpdate={handleFrameUpdate}
            onDelete={handleDeleteVersion}
          />
        )}
        {selectedElement && !panelStates.settings.minimized && (
          <>
            {selectedElement.tagName === 'IMG' ? (
              <ImageSettingSection selectedEl={selectedElement as any} isMinimized={panelStates.settings.minimized} isExpanded={panelStates.settings.expanded} onToggle={() => togglePanel('settings')} onExpand={() => expandPanel('settings')} onMinimize={() => resetPanel('settings')} />
            ) : (
              <ElementSettingSection selectedEl={selectedElement} clearSelection={() => setSelectedElement(null)} isMinimized={panelStates.settings.minimized} isExpanded={panelStates.settings.expanded} onToggle={() => togglePanel('settings')} onExpand={() => expandPanel('settings')} onMinimize={() => resetPanel('settings')} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PlayGround;