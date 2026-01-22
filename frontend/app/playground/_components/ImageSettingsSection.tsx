"use client";

import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Crop,
  ImageMinus,
  Loader2Icon,
  Images,
  ImageUpscaleIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageKit from "imagekit";
import { set } from "date-fns";
import PanelHeader from "./PanelHeader";

type Props = {
  selectedEl: HTMLImageElement;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onMinimize: () => void;
};

const transformOptions = [
  { label: "Smart Crop", value: "smartcrop", icon: <Crop />, transformation: 'fo-auto' },
  { label: "dropshadow", value: "dropshadow", icon: <Images />, transformation: 'e-dropshadow' },
  { label: "Upscale", value: "upscale", icon: <ImageUpscaleIcon />, transformation: 'e-upscale' },
  { label: "Remove", value: "bgremove", icon: <ImageMinus />, transformation: 'e-bgremove' },
];

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

function ImageSettingSection({
  selectedEl,
  isMinimized,
  isExpanded,
  onToggle,
  onExpand,
  onMinimize
}: Props) {
  const [altText, setAltText] = useState(selectedEl.alt || "");
  const [width, setWidth] = useState<number>(selectedEl.width || 300);
  const [height, setHeight] = useState<number>(selectedEl.height || 200);
  const [selectedImage, setSelectedImage] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [borderRadius, setBorderRadius] = useState(
    selectedEl.style.borderRadius || "0px"
  );
  const [preview, setPreview] = useState<string>(selectedEl.src || "");
  const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle transform
  const toggleTransform = (value: string) => {
    setActiveTransforms((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveUploadedFile = async () => {
    if (selectedImage) {
      setLoading(true);
      const imageRef = await imagekit.upload({
        //@ts-ignore
        file: selectedImage,
        fileName: Date.now() + ".png",
        isPublished: true
      })
      console.log(imageRef);
      //@ts-ignore
      selectedEl.setAttribute('src', imageRef?.url + "?tr=");
      setLoading(false);
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const GenerateAiImage = async () => {
    setLoading(true);

    const url = `https://ik.imagekit.io/ujjawal04/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`

    setPreview(url);
    selectedEl.setAttribute('src', url);
  };

  const ApplyTransformation = (trValue: string) => {
    setLoading(true);

    if (!preview.includes(trValue)) {
      const url = preview + trValue + ',';
      setPreview(url);
      selectedEl.setAttribute('src', url);
    } else {
      const url = preview.replaceAll(trValue + ',', '');
      setPreview(url);
      selectedEl.setAttribute('src', url);
    }

  }

  return (
    <div className={`${isMinimized ? 'w-12' : isExpanded ? 'w-full md:w-2/5' : 'w-full md:w-80 lg:w-96'} 
      shadow-xl h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out bg-background border-l border-border`}>

      <PanelHeader
        title="Image Settings"
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onExpand={onExpand}
        onMinimize={onMinimize}
        icon={<ImageIcon className="h-4 w-4" />}
      />

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Preview (clickable) */}
          <div className="flex justify-center p-4 bg-muted/30 rounded-lg border border-border dashed relative group">
             {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-sm rounded-lg">
                  <Loader2Icon className="animate-spin h-6 w-6 text-primary" />
                </div>
             )}
            <img
              src={preview}
              alt={altText}
              className="max-h-48 object-contain rounded-md shadow-sm cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02]"
              onClick={openFileDialog}
              onLoad={() => setLoading(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
              <span className="text-foreground text-xs font-medium bg-background/60 px-2 py-1 rounded">Click to Change</span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Upload Button */}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={saveUploadedFile}
            disabled={loading}
          >
            {loading && <Loader2Icon className="animate-spin mr-2 h-4 w-4" />} Upload Image
          </Button>

          <div className="space-y-4 pt-2 border-t border-border">
            {/* Alt text */}
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Prompt</label>
              <Input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Enter AI prompt..."
                className="bg-muted/50 border-border focus:border-primary transition-colors"
              />
            </div>

            <Button className="w-full" onClick={GenerateAiImage}
              disabled={loading}>{loading && <Loader2Icon className="animate-spin mr-2 h-4 w-4" />}
              Generate with AI</Button>
          </div>

          {/* Transform Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">AI Transform</label>
            <div className="grid grid-cols-4 gap-2">
              <TooltipProvider delayDuration={0}>
                {transformOptions.map((opt) => {
                  const applied = activeTransforms.includes(opt.value);
                  const isActive = preview.includes(opt.transformation);
                  return (
                    <Tooltip key={opt.value}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={isActive ? 'default' : 'outline'}
                          size="icon"
                          className={`w-full aspect-square ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                          onClick={() => ApplyTransformation(opt.transformation)}
                        >
                          {opt.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {opt.label} {applied && "(Applied)"}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>

          {/* Conditional Resize Inputs */}
          {activeTransforms.includes("resize") && (
            <div className="flex gap-4 pt-2">
              <div className="flex-1 grid gap-2">
                <label className="text-xs font-semibold bg-muted-foreground/10 px-2 py-0.5 rounded w-fit text-muted-foreground">Width</label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="bg-muted/50"
                />
              </div>
              <div className="flex-1 grid gap-2">
                <label className="text-xs font-semibold bg-muted-foreground/10 px-2 py-0.5 rounded w-fit text-muted-foreground">Height</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="bg-muted/50"
                />
              </div>
            </div>
          )}

          {/* Border Radius */}
          <div className="grid gap-2 pt-4 border-t border-border">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Border Radius</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                placeholder="e.g. 8px"
                className="bg-muted/50"
              />
              <div className="flex items-center justify-center w-10 h-10 bg-muted rounded border border-border" style={{ borderRadius: borderRadius }}>
                <div className="w-4 h-4 bg-foreground/20"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSettingSection;
