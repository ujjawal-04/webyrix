import { SwatchBook } from "lucide-react";
import React, { useEffect, useState } from "react";

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
};

function ElementSettingSection({ selectedEl, clearSelection }: Props) {
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
    <div className="w-96 shadow p-4 space-y-4 overflow-auto h-[90vh] rounded-xl mt-2 mr-2">
      <h2 className="flex gap-2 items-center font-bold">
        <SwatchBook /> Settings
      </h2>

      {/* Font Size + Text Color */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm">Font Size</label>
          <Select
            defaultValue={selectedEl?.style?.fontSize || "24px"}
            onValueChange={(value) => applyStyle("fontSize", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Size" />
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

        <div>
          <label className="text-sm block">Text Color</label>
          <Input
            type="color"
            className="w-[40px] h-[40px] rounded-lg mt-1"
            value={selectedEl?.style?.color || "#000000"}
            onChange={(event) =>
              applyStyle("color", event.target.value)
            }
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="text-sm mb-1 block">Text Alignment</label>
        <ToggleGroup
          type="single"
          value={align}
          onValueChange={setAlign}
          className="bg-gray-100 rounded-lg p-1 inline-flex w-full justify-between"
        >
          <ToggleGroupItem
            value="left"
            className="p-2 rounded hover:bg-gray-200 flex-1"
          >
            <AlignLeft size={20} />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="center"
            className="p-2 rounded hover:bg-gray-200 flex-1"
          >
            <AlignCenter size={20} />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="right"
            className="p-2 rounded hover:bg-gray-200 flex-1"
          >
            <AlignRight size={20} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Background Color & Border Radius */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm block">Background</label>
          <Input
            type="color"
            className="w-[40px] h-[40px] rounded-lg mt-1"
            defaultValue={selectedEl?.style?.backgroundColor || "#ffffff"}
            onChange={(event) =>
              applyStyle("backgroundColor", event.target.value)
            }
          />
        </div>

        <div className="flex-1">
          <label className="text-sm">Border Radius</label>
          <Input
            type="text"
            placeholder="e.g. 8px"
            defaultValue={selectedEl?.style?.borderRadius || ""}
            onChange={(e) =>
              applyStyle("borderRadius", e.target.value)
            }
            className="mt-1"
          />
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="text-sm">Padding</label>
        <Input
          type="text"
          placeholder="e.g. 10px 15px"
          defaultValue={selectedEl?.style?.padding || ""}
          onChange={(e) => applyStyle("padding", e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Margin */}
      <div>
        <label className="text-sm">Margin</label>
        <Input
          type="text"
          placeholder="e.g. 10px 15px"
          defaultValue={selectedEl?.style?.margin || ""}
          onChange={(e) => applyStyle("margin", e.target.value)}
          className="mt-1"
        />
      </div>

      {/* === Class Manager === */}
      <div>
        <label className="text-sm font-medium">Classes</label>

        {/* Existing classes */}
        <div className="flex flex-wrap gap-2 mt-2">
          {classes.length > 0 ? (
            classes.map((cls) => (
              <span
                key={cls}
                className="flex text-xs items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border"
              >
                {cls}
                <button
                  onClick={() => removeClass(cls)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">
              No classes applied
            </span>
          )}
        </div>

        {/* Add new class */}
        <div className="flex gap-2 mt-3">
          <Input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            placeholder="Add class..."
          />
          <Button type="button" onClick={addClass}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ElementSettingSection;
