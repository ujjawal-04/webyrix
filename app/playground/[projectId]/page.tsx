'use client';

import React, { useEffect, useState } from 'react';
import PlaygroundHeader from '../_components/PlaygroundHeader';
import ChatSection from '../_components/ChatSection';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import WebsiteDesign from '../_components/WebsiteDesign';

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
- Use a modern design with **blue as the primary color**.
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

  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]); 
  const [generatedCode, setGeneratedCode] = useState<any>('');

  useEffect(() => {
    if (frameId) GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    try {
      const result = await axios.get(`/api/frames?frameId=${frameId}&projectId=${projectId}`);
      console.log("Frame Details:", result.data);
      setFrameDetail(result.data);

      // Auto-send first message if exists
      if (result.data?.chatMessages?.length == 1) {
        const userMsg = result.data?.chatMessages[0].content;
        SendMessage(userMsg);
      }
    } catch (error) {
      console.error("Error fetching frame details:", error);
    }
  };

  const SendMessage = async (userInput: string) => {
    setLoading(true);

    // Add user message to chat
    setMessages((prev:any) => [...prev, { role: 'user', content: userInput }]);

    try {
      const result = await fetch('/api/ai-model', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: "user", content: Prompt?.replace('{userInput}', userInput) }]
        }),
      });

      const reader = result.body?.getReader();
      const decoder = new TextDecoder();

      let aiResponse = '';
      let isCode = false;

      while (reader) {
        const { done, value } = await reader?.read(); 
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // Detect code fences
        if (!isCode && aiResponse.includes('```html')) {
          isCode = true;
          const index = aiResponse.indexOf('```html') + 7;
          const initialCodeChunk = aiResponse.slice(index);
          setGeneratedCode((prev :any) => prev + initialCodeChunk);
        } else if (isCode) {
          setGeneratedCode((prev : any) => prev + chunk);
        }
      }

      // after streaming ends
      if (!isCode) {
        setMessages((prev:any) => [
          ...prev,
          { role: 'assistant', content: aiResponse }
        ]);
      } else {
        setMessages((prev:any) => [
          ...prev,
          { role: 'assistant', content: 'Your code is ready!' }
        ]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev:any) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(generatedCode);
  }, [generatedCode]);


  return (
    <div>
      <PlaygroundHeader />

      <div className='flex'>
        <ChatSection
          messages={messages ?? []}
          onSend={(input: string) => SendMessage(input)}
          loading={loading}
        />

        {/* Website Design Section */}
        <WebsiteDesign />

        {/* Element Setting Section */}
        {/* <ElementSettingSection /> */}
      </div>
    </div>
  );
}

export default PlayGround;