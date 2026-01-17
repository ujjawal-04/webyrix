import React, { useEffect, useRef, useState } from "react";
import WebPageTools from "./WebPageTools";
import ElementSettingSection from "./ElementSettingSection";
import ImageSettingSection from "./ImageSettingsSection";

type Props = {
  generatedCode: string;
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

function WebsiteDesign({ generatedCode }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState("web");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>();

  const selectedElRef = useRef<HTMLElement | null>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);

  /** 1️⃣ Initialize iframe ONCE */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(HTML_CODE);
    doc.close();

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
        setSelectedElement(target);
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
  }, []);

  /** 2️⃣ Update HTML safely without breaking selection */
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const root = doc.getElementById("root");
    if (!root) return;

    root.innerHTML = generatedCode
      .replaceAll("```html", "")
      .replaceAll("```", "")
      .replace("html,", "");
  }, [generatedCode]);

  return (
    <div className="flex gap-2 w-full">
    <div className="p-5 w-full flex flex-col items-center">
      <iframe
        ref={iframeRef}
        className={`${
          selectedScreenSize === "web" ? "w-full" : "w-130"
        } h-215 border-2 rounded-xl`}
        sandbox="allow-scripts allow-same-origin"
      />

      <WebPageTools
        selectedScreenSize={selectedScreenSize}
        setSelectedScreenSize={setSelectedScreenSize}
        generatedCode={generatedCode}
      />
      </div>

      {/* Element Setting Section */}
      {/* @ts-ignore */}
      {/* <ElementSettingSection } /> */}

      {selectedElement?.tagName === 'IMG' ?
      // @ts-ignore
        <ImageSettingSection selectedEl={selectedElement} /> :
        selectedElement?<ElementSettingSection selectedEl={selectedElement} clearSelection={() => setSelectedElement(null)} />:null
        }
    </div>
  );
}

export default WebsiteDesign;
