import React, { useContext, useEffect, useRef, useState } from "react";
import WebPageTools from "./WebPageTools";
import { OnSaveContext } from "@/context/OnSaveContext";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import PanelHeader from "./PanelHeader";
import { Monitor } from "lucide-react";
import VersionSelector from "./VersionSelector";
import { Button } from "@/components/ui/button";
import SequentialLoaders from "./SequentialLoaders";

type Props = {
  generatedCode: string;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onMinimize: () => void;
  onElementSelect: (element: HTMLElement | null) => void;
  frames?: any[];
  currentFrame?: any;
  isStreaming?: boolean;
};

const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2248%22%20viewBox%3D%220%200%2040%2048%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad-light%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23c084fc%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23f9a8d4%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23fdba74%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22grad-medium%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23a855f7%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23f472b6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23fb923c%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22grad-dark%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%237c3aed%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23ec4899%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f97316%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cg%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%3E%3Cpath%20fill%3D%22url(%23grad-light)%22%20d%3D%22m34.5868%208.40061-9.6868-2.59556c-.6687-.17919-1.2108.23679-1.2108.92911v10.02854c0%20.6923.5421%201.3988%201.2108%201.578l9.6868%202.5955c.6687.1792%201.2109-.2368%201.2109-.9291v-10.02848c0-.69232-.5422-1.39882-1.2109-1.57801z%20m-9.6868-6.35625c-2.6749-.71674-4.8434.94718-4.8434%203.71647v10.02847c0%202.7693%202.1685%205.5953%204.8434%206.312l9.6868%202.5956c2.6749.7168%204.8434-.9472%204.8434-3.7165v-10.0284c0-2.76934-2.1685-5.59533-4.8434-6.31207z%22%2F%3E%3Cpath%20fill%3D%22url(%23grad-medium)%22%20d%3D%22m26.9812%2016.5707-12.1085-3.2444c-.6687-.1792-1.2109.2368-1.2109.9291v12.5356c0%20.6923.5422%201.3988%201.2109%201.578l12.1085%203.2445c.6687.1792%201.2108-.2368%201.2108-.9291v-12.5356c0-.6924-.5421-1.3989-1.2108-1.5781z%20m-12.1085-7.0051c-2.6749-.71674-4.8434.9472-4.8434%203.7165v12.5356c0%202.7693%202.1685%205.5953%204.8434%206.312l12.1085%203.2445c2.6749.7167%204.8433-.9472%204.8433-3.7165v-12.5356c0-2.7693-2.1684-5.5953-4.8433-6.312z%22%2F%3E%3Cpath%20fill%3D%22url(%23grad-dark)%22%20d%3D%22m19.3736%2024.7409-14.53021-3.8934c-.66873-.1792-1.21085.2368-1.21085.9291v15.0428c0%20.6923.54212%201.3988%201.21085%201.578l14.53021%203.8933c.6687.1792%201.2108-.2368%201.2108-.9291v-15.0427c0-.6923-.5421-1.3988-1.2108-1.578z%20m-14.53021-7.6541c-2.67493-.7167-4.84339.9472-4.84339%203.7165v15.0427c0%202.7693%202.16846%205.5953%204.84339%206.3121l14.53021%203.8933c2.6749.7168%204.8433-.9472%204.8433-3.7164v-15.0428c0-2.7693-2.1684-5.5953-4.8433-6.312z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E" type="image/svg+xml" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.css" rel="stylesheet">
</head>
<body id="root" class="bg-transparent"></body>
<script src="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.js"></script>
</html>`;

function WebsiteDesign({ generatedCode, isMinimized, isExpanded, onToggle, onExpand, onMinimize, onElementSelect, frames = [], currentFrame, isStreaming = false }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState("web");
  const { onSaveData, setOnSaveData } = useContext(OnSaveContext);
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const { getToken } = useAuth();

  const selectedElRef = useRef<HTMLElement | null>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);

  /** 1️⃣ Initialize Shell ONCE */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    if (!doc.getElementById("root")) {
      doc.open();
      doc.write(HTML_CODE);
      doc.close();
    }
  }, []);

  /** 2️⃣ Seamless DOM Updates (Flicker-Free) */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const root = doc.getElementById("root");
    if (!root) return;

    if (generatedCode) {
      const extractHtmlCode = (code: string) => {
        const htmlMatch = code.match(/```html([\s\S]*?)```/);
        if (htmlMatch && htmlMatch[1]) return htmlMatch[1].trim();

        return code
          .replace(/```html/g, "")
          .replace(/```/g, "")
          .replace(/^html,/, "")
          .trim();
      };

      const cleanCode = extractHtmlCode(generatedCode);
      // Directly update innerHTML to prevent iframe reloads and "blanking"
      root.innerHTML = cleanCode;
    } else {
      root.innerHTML = ''; // Clear if empty
    }
  }, [generatedCode]);

  /** 3️⃣ Interactivity Listeners */
  const setupListeners = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const root = doc?.getElementById("root");
    if (!doc || !root) {
      setTimeout(setupListeners, 100);
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      if (selectedElRef.current) return;
      const target = e.target as HTMLElement;
      if (!target || target === root || target === doc.documentElement) return;

      if (hoverElRef.current && hoverElRef.current !== target) {
        hoverElRef.current.style.outline = "";
      }
      hoverElRef.current = target;
      target.style.outline = "2px dotted blue";
    };

    const handleMouseOut = () => {
      if (selectedElRef.current) return;
      if (hoverElRef.current) {
        hoverElRef.current.style.outline = "";
        hoverElRef.current = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (!target || target === root || target === doc.documentElement) return;

      if (selectedElRef.current) {
        selectedElRef.current.style.outline = "";
        selectedElRef.current.removeAttribute("contenteditable");
      }

      selectedElRef.current = target;
      target.style.outline = "2px solid red";
      target.setAttribute("contenteditable", "true");
      target.focus();
      onElementSelect(target);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedElRef.current) {
        selectedElRef.current.style.outline = "";
        selectedElRef.current.removeAttribute("contenteditable");
        selectedElRef.current = null;
      }
    };

    root.addEventListener("mouseover", handleMouseOver);
    root.addEventListener("mouseout", handleMouseOut);
    root.addEventListener("click", handleClick);
    doc.addEventListener("keydown", handleKeyDown);

    return () => {
      root.removeEventListener("mouseover", handleMouseOver);
      root.removeEventListener("mouseout", handleMouseOut);
      root.removeEventListener("click", handleClick);
      doc.removeEventListener("keydown", handleKeyDown);
    };
  };

  useEffect(() => {
    const cleanup = setupListeners();
    return () => { if (cleanup) cleanup(); };
  }, [isMinimized, generatedCode]);

  useEffect(() => {
    onSaveData && onSaveCode();
  }, [onSaveData]);

  const onSaveCode = async () => {
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const cloneDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;

          //remove all outlines before saving
          const AllEls = cloneDoc.querySelectorAll<HTMLElement>("*");
          AllEls.forEach((el) => {
            el.style.outline = '';
            el.style.cursor = '';
            el.removeAttribute("contenteditable");
          });

          const html = cloneDoc.outerHTML;
          console.log("HTML to save:", html);

          const token = await getToken();
          const result = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/frames`, {
            designCode: html,
            frameId: frameId,
            projectId: projectId
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(result.data);
          toast.success('Your website is saved and ready!');
        }
      } catch (err) {
        console.error("Save error:", err);
      }
    }
  }

  return (
    <div className={`${isMinimized ? 'w-12' : isExpanded ? 'w-full' : 'flex-1'} 
      flex flex-col panel-transition bg-background`}>
      <PanelHeader
        title="Preview"
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onExpand={onExpand}
        onMinimize={onMinimize}
        icon={<Monitor className="h-3.5 w-3.5" />}
      >
        {!isMinimized && (
          <div className="flex items-center gap-2">
            {/* @ts-ignore */}
            <VersionSelector frames={frames} currentFrameId={currentFrame?.frameId || frameId} />
          </div>
        )}
      </PanelHeader>

      <div className={`${isMinimized ? 'hidden' : 'flex'} flex-col h-full overflow-auto custom-scrollbar`}>
        <div className="p-3 sm:p-5 flex-1 flex flex-col items-center justify-center relative w-full h-full">
          {(isStreaming || !generatedCode) && (
            <div className="absolute inset-0 z-10 p-3 sm:p-5">
              <SequentialLoaders mode={isStreaming ? 'streaming' : 'loading'} />
            </div>
          )}
          <iframe
            ref={iframeRef}
            className={`${selectedScreenSize === "web" ? "w-full" : "w-full max-w-md"
              } flex-1 min-h-[400px] border border-border/50 rounded-xl bg-white shadow-lg transition-all duration-500 ${(isStreaming || !generatedCode) ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            sandbox="allow-scripts allow-same-origin"
          />

          <WebPageTools
            selectedScreenSize={selectedScreenSize}
            setSelectedScreenSize={setSelectedScreenSize}
            generatedCode={generatedCode}
          />
        </div>
      </div>
    </div >
  );
}

export default WebsiteDesign;
