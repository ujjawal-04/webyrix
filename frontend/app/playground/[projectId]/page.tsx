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

You are a senior web developer at a top design agency. Generate COMPLETE, PROFESSIONAL, FULL-LENGTH websites with MULTIPLE sections and RICH content.

CRITICAL: Generate COMPREHENSIVE websites, not minimal examples. Each website should be FULL-FEATURED with AT LEAST 6-8 SECTIONS.

RULES:
1. If user asks to build/create/generate a website → Generate COMPLETE, FULL-LENGTH HTML code
2. If user says "hi" or asks a question → Respond conversationally

WHEN GENERATING CODE:

Required CDN Links (add at top of body):
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.js"></script>

MANDATORY SECTIONS (Include ALL of these):
1. Navigation Bar: Sticky header with logo, 5-6 menu links, CTA button, mobile hamburger menu
2. Hero Section: Full-width with large heading (text-5xl md:text-7xl), subheading, 2 CTA buttons, background gradient or image
3. Features Section: Grid of 6 feature cards with icons, titles, descriptions (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
4. About/How It Works: 2-3 column layout with images and detailed text explaining the product/service
5. Testimonials: 3-6 customer testimonials with avatars, names, roles, quotes
6. Stats/Numbers: 4 impressive statistics with big numbers and labels
7. Pricing/Plans: 3 pricing tiers with features list, prices, CTA buttons (if applicable)
8. FAQ Section: 6-8 frequently asked questions with Flowbite accordion component
9. Final CTA: Eye-catching section with gradient background, heading, subtext, CTA button
10. Footer: Multi-column (4 columns) with company info, product links, resources, social icons, newsletter signup, copyright

Design Standards:
- Main container: font-['Inter'] antialiased
- Professional colors: blue-600, indigo-600, purple-600, emerald-600, slate-800
- GENEROUS spacing: py-20 md:py-32 for sections (make it spacious!)
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Cards: bg-white shadow-xl rounded-xl p-8 hover:shadow-2xl transition-all duration-300
- Buttons: px-8 py-4 text-lg rounded-lg font-semibold with hover effects
- Headings: text-4xl md:text-6xl font-bold for main headings, text-3xl md:text-4xl for section headings
- Body text: text-lg leading-relaxed text-gray-600
- Fully responsive with sm:, md:, lg:, xl: breakpoints

Visual Quality:
- Use semantic HTML: <header>, <nav>, <main>, <section>, <footer>
- FontAwesome 6 icons: <i class="fa-solid fa-icon-name text-3xl"></i>
- Images: Use varied Unsplash URLs with different photo IDs
  - https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80
  - https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80
  - https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80
- Add gradient backgrounds: bg-gradient-to-r from-blue-600 to-purple-600
- Smooth transitions on all interactive elements
- Professional typography with cl          ear hierarchy
- Good contrast and readability

Content Requirements:
- Write REALISTIC, DETAILED content (minimum 2-3 sentences per description)
- NO Lorem Ipsum - use actual relevant content
- Feature descriptions should be 40-60 words each
- Testimonials should be 30-50 words with realistic names and roles
- FAQ answers should be comprehensive (50-80 words)
- Make content specific to the website type requested

Interactive Elements:
- Working mobile menu toggle (Flowbite navbar component)
- Smooth scroll navigation (href="#section-id")
- Hover effects on all buttons and cards
- Accordion for FAQ section (Flowbite accordion)
- All forms should have proper styling and placeholders

Output Format:
- Start with \`\`\`html and end with \`\`\`
- Only include <body> content (no <head> or <title>)
- No explanations before or after code
- Generate AT LEAST 400-600 lines of HTML for a complete website
- Each section should be substantial with real content

REMEMBER: Generate FULL, COMPLETE, COMPREHENSIVE websites with ALL sections listed above. Quality over brevity!
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
