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
      shadow h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-gray-900`}>

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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Preview (clickable) */}
          <div className="flex justify-center">
            <img
              src={preview}
              alt={altText}
              className="max-h-40 object-contain border rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={openFileDialog}
              onLoad={() => setLoading(false)}
            />
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
            variant="outline"
            className="w-full"
            onClick={saveUploadedFile}
            disabled={loading}
          >
            {loading && <Loader2Icon className="animate-spin mr-2 h-4 w-4" />} Upload Image
          </Button>

          {/* Alt text */}
          <div>
            <label className="text-sm font-medium">Prompt</label>
            <Input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Enter alt text"
              className="mt-1"
            />
          </div>

          <Button className="w-full" onClick={GenerateAiImage}
            disabled={loading}>{loading && <Loader2Icon className="animate-spin mr-2 h-4 w-4" />}
            Generate AI Image</Button>

          {/* Transform Buttons */}
          <div>
            <label className="text-sm font-medium mb-1 block">AI Transform</label>
            <div className="flex gap-2 flex-wrap">
              <TooltipProvider>
                {transformOptions.map((opt) => {
                  const applied = activeTransforms.includes(opt.value);
                  return (
                    <Tooltip key={opt.value}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={preview.includes(opt.transformation) ? 'default' : 'outline'}
                          className="flex items-center justify-center p-2"
                          onClick={() => ApplyTransformation(opt.transformation)}
                        >
                          {opt.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
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
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium">Width</label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Height</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Border Radius */}
          <div>
            <label className="text-sm font-medium">Border Radius</label>
            <Input
              type="text"
              value={borderRadius}
              onChange={(e) => setBorderRadius(e.target.value)}
              placeholder="e.g. 8px or 50%"
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSettingSection;
