import React, { useContext, useEffect, useRef, useState } from "react";
import WebPageTools from "./WebPageTools";
import { OnSaveContext } from "@/context/OnSaveContext";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import PanelHeader from "./PanelHeader";
import { Monitor } from "lucide-react";

type Props = {
  generatedCode: string;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onMinimize: () => void;
  onElementSelect: (element: HTMLElement | null) => void;
};

const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body id="root"></body>
</html>`;

function WebsiteDesign({ generatedCode, isMinimized, isExpanded, onToggle, onExpand, onMinimize, onElementSelect }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState("web");
  const { onSaveData, setOnSaveData } = useContext(OnSaveContext);
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const { getToken } = useAuth();

  const selectedElRef = useRef<HTMLElement | null>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);
  const [iframeInitialized, setIframeInitialized] = useState(false);

  /** 1️⃣ Initialize iframe ONCE and when panel is reopened */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || isMinimized) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    // Only initialize if not already done or if content is missing
    const needsInit = !doc.body || !doc.getElementById("root");

    if (needsInit) {
      doc.open();
      doc.write(HTML_CODE);
      doc.close();
      setIframeInitialized(true);
    }

    // Wait for doc.body to be available after writing HTML
    const setupListeners = () => {
      if (!doc.body) {
        setTimeout(setupListeners, 10);
        return;
      }

      const handleMouseOver = (e: MouseEvent) => {
        if (selectedElRef.current) return;
        const target = e.target as HTMLElement;
        if (!target || target === doc.body || target === doc.documentElement)
          return;
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
        if (!target || target === doc.body || target === doc.documentElement)
          return;
        if (selectedElRef.current) {
          selectedElRef.current.style.outline = "";
          selectedElRef.current.removeAttribute("contenteditable");
        }
        selectedElRef.current = target;
        target.style.outline = "2px solid red";
        target.setAttribute("contenteditable", "true");
        target.focus();
        target.addEventListener("blur", handleBlur);
        onElementSelect(target);
      };

      const handleBlur = () => {
        if (selectedElRef.current) {
          console.log(
            "Final edited HTML:",
            selectedElRef.current.outerHTML
          );
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && selectedElRef.current) {
          selectedElRef.current.style.outline = "";
          selectedElRef.current.removeAttribute("contenteditable");
          selectedElRef.current = null;
        }
      };

      doc.body.addEventListener("mouseover", handleMouseOver);
      doc.body.addEventListener("mouseout", handleMouseOut);
      doc.body.addEventListener("click", handleClick);
      doc.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        doc.body.removeEventListener("mouseover", handleMouseOver);
        doc.body.removeEventListener("mouseout", handleMouseOut);
        doc.body.removeEventListener("click", handleClick);
        doc.removeEventListener("keydown", handleKeyDown);
      };
    };

    // Call setupListeners and store cleanup
    let cleanup: (() => void) | undefined;
    const start = () => {
      cleanup = setupListeners();
    };
    start();
    return () => {
      if (cleanup) cleanup();
    };
  }, []); // Initialize once

  /** 2️⃣ Update HTML safely without breaking selection */
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const root = doc.getElementById("root");
    if (!root) return;

    // Only update if there's actual content to show
    if (generatedCode && generatedCode.trim()) {
      const cleanCode = generatedCode
        .replaceAll("```html", "")
        .replaceAll("```", "")
        .replace("html,", "");

      root.innerHTML = cleanCode;
    }
  }, [generatedCode]);

  useEffect(() => {
    onSaveData && onSaveCode();
  }, [onSaveData]);

  const onSaveCode = async () => {
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const cloneDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;

          //remove all outlines
          const AllEls = cloneDoc.querySelectorAll<HTMLElement>("*");
          AllEls.forEach((el) => {
            el.style.outline = '';
            el.style.cursor = '';
          }
          )


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
          toast.success('Saved Successfully!');


        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <div className={`${isMinimized ? 'w-12' : isExpanded ? 'w-full' : 'flex-1'} 
      flex flex-col transition-all duration-300 ease-in-out bg-muted/10`}>

      <PanelHeader
        title="Preview"
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onExpand={onExpand}
        onMinimize={onMinimize}
        icon={<Monitor className="h-4 w-4" />}
      />

      {/* Keep iframe in DOM but hide when minimized to preserve content */}
      <div className={`${isMinimized ? 'hidden' : 'flex'} flex-col h-full overflow-auto`}>
        <div className="p-3 sm:p-5 flex-1 flex flex-col items-center justify-center">
          <iframe
            ref={iframeRef}
            className={`${selectedScreenSize === "web" ? "w-full" : "w-full max-w-md"
              } flex-1 min-h-[400px] border border-border rounded-xl bg-white shadow-sm transition-all duration-300`}
            sandbox="allow-scripts allow-same-origin"
          />

          <WebPageTools
            selectedScreenSize={selectedScreenSize}
            setSelectedScreenSize={setSelectedScreenSize}
            generatedCode={generatedCode}
          />
        </div>
      </div>
    </div>
  );
}

export default WebsiteDesign;
