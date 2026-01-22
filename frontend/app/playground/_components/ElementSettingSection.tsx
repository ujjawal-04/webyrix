import { SwatchBook, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelHeader from "./PanelHeader";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  selectedEl: HTMLElement | null;
  clearSelection: () => void;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onMinimize: () => void;
};

function ElementSettingSection({
  selectedEl,
  clearSelection,
  isMinimized,
  isExpanded,
  onToggle,
  onExpand,
  onMinimize
}: Props) {
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState("");
  const [align, setAlign] = React.useState(
    selectedEl?.style.textAlign
  );

  const applyStyle = (property: string, value: string) => {
    if (selectedEl) {
      (selectedEl.style as any)[property] = value;
    }
  };

  /* Update alignment style when toggled */
  useEffect(() => {
    if (selectedEl && align) {
      selectedEl.style.textAlign = align;
    }
  }, [align, selectedEl]);

  /* Keep in sync if element classes are modified elsewhere */
  useEffect(() => {
    if (!selectedEl) return;

    const currentClasses = selectedEl.className
      .split(" ")
      .filter((c) => c.trim() !== "");
    setClasses(currentClasses);

    const observer = new MutationObserver(() => {
      const updated = selectedEl.className
        .split(" ")
        .filter((c) => c.trim() !== "");
      setClasses(updated);
    });

    observer.observe(selectedEl, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [selectedEl]);

  /* Remove a class */
  const removeClass = (cls: string) => {
    const updated = classes.filter((c) => c !== cls);
    setClasses(updated);
    if (selectedEl) {
      selectedEl.className = updated.join(" ");
    }
  };

  /* Add new class */
  const addClass = () => {
    const trimmed = newClass.trim();
    if (!trimmed) return;
    if (!classes.includes(trimmed)) {
      const updated = [...classes, trimmed];
      setClasses(updated);
      if (selectedEl) {
        selectedEl.className = updated.join(" ");
      }
    }
    setNewClass("");
  };

  return (
    <div className={`${isMinimized ? 'w-12' : isExpanded ? 'w-full md:w-2/5' : 'w-full md:w-80 lg:w-96'} 
      shadow-xl h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out bg-background border-l border-border`}>

      <PanelHeader
        title="Element Settings"
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onExpand={onExpand}
        onMinimize={onMinimize}
        icon={<SwatchBook className="h-4 w-4" />}
      />

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Close Selection Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={clearSelection}
            className="w-full gap-2 text-foreground"
          >
            <X className="h-4 w-4" />
            Clear Selection
          </Button>

          {/* Typography Section */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Typography</h4>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Font Size</label>
                <Select
                  defaultValue={selectedEl?.style?.fontSize || "24px"}
                  onValueChange={(value) => applyStyle("fontSize", value)}
                >
                  <SelectTrigger className="w-full bg-muted/50 border-border">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(53)].map((_, index) => (
                      <SelectItem value={`${index + 12}px`} key={index}>
                        {index + 12}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Color</label>
                <div className="relative">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1 rounded cursor-pointer bg-muted/50 border-border"
                    value={selectedEl?.style?.color || "#0A0A0A"}
                    onChange={(event) =>
                      applyStyle("color", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Alignment</label>
              <ToggleGroup
                type="single"
                value={align}
                onValueChange={setAlign}
                className="bg-muted p-1 rounded-md inline-flex w-full justify-between"
              >
                <ToggleGroupItem
                  value="left"
                  className="flex-1 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-sm transition-all"
                  aria-label="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>

                <ToggleGroupItem
                  value="center"
                  className="flex-1 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-sm transition-all"
                  aria-label="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>

                <ToggleGroupItem
                  value="right"
                  className="flex-1 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-sm transition-all"
                  aria-label="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4 pt-4 border-t border-border">
             <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Appearance</h4>
            
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Background</label>
                 <Input
                    type="color"
                    className="w-12 h-10 p-1 rounded cursor-pointer bg-muted/50 border-border"
                    defaultValue={selectedEl?.style?.backgroundColor || "#ffffff"}
                    onChange={(event) =>
                      applyStyle("backgroundColor", event.target.value)
                    }
                  />
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Border Radius</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="0px"
                    defaultValue={selectedEl?.style?.borderRadius || ""}
                    onChange={(e) =>
                      applyStyle("borderRadius", e.target.value)
                    }
                    className="bg-muted/50 border-border"
                  />
                  <div className="h-9 w-9 border border-dashed border-muted-foreground/30 rounded flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 bg-muted-foreground/20 rounded-sm" style={{ borderRadius: selectedEl?.style?.borderRadius || '0px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing Section */}
          <div className="space-y-4 pt-4 border-t border-border">
             <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Spacing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Padding</label>
                <Input
                  type="text"
                  placeholder="e.g. 10px 15px"
                  defaultValue={selectedEl?.style?.padding || ""}
                  onChange={(e) => applyStyle("padding", e.target.value)}
                  className="bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Margin</label>
                <Input
                  type="text"
                  placeholder="e.g. 10px 15px"
                  defaultValue={selectedEl?.style?.margin || ""}
                  onChange={(e) => applyStyle("margin", e.target.value)}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
          </div>

          {/* === Class Manager === */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Classes</h4>

            {/* Existing classes */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <span
                    key={cls}
                    className="flex text-xs items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {cls}
                    <button
                      onClick={() => removeClass(cls)}
                      className="text-primary/60 hover:text-primary transition-colors p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-xs italic py-1">
                  No classes applied
                </span>
              )}
            </div>

            {/* Add new class */}
            <div className="flex gap-2">
              <Input
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="Add class..."
                className="bg-muted/50 border-border"
                onKeyPress={(e) => e.key === 'Enter' && addClass()}
              />
              <Button type="button" onClick={addClass} size="sm" variant="secondary">
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ElementSettingSection;
