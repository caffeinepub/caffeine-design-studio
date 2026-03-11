import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Circle,
  ImagePlus,
  Minus,
  MousePointer2,
  MoveRight,
  Square,
  Type,
} from "lucide-react";
import { useRef } from "react";
import { useCanvasContext } from "../hooks/useCanvas";
import type { ToolType } from "../types/canvas";

const TOOLS: {
  type: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  ocid: string;
}[] = [
  {
    type: "select",
    icon: <MousePointer2 size={16} />,
    label: "Select",
    shortcut: "V",
    ocid: "toolbar.select_button",
  },
  {
    type: "rect",
    icon: <Square size={16} />,
    label: "Rectangle",
    shortcut: "R",
    ocid: "toolbar.rect_button",
  },
  {
    type: "circle",
    icon: <Circle size={16} />,
    label: "Ellipse",
    shortcut: "E",
    ocid: "toolbar.circle_button",
  },
  {
    type: "text",
    icon: <Type size={16} />,
    label: "Text",
    shortcut: "T",
    ocid: "toolbar.text_button",
  },
  {
    type: "line",
    icon: <Minus size={16} />,
    label: "Line",
    shortcut: "L",
    ocid: "toolbar.line_button",
  },
  {
    type: "arrow",
    icon: <MoveRight size={16} />,
    label: "Arrow",
    shortcut: "A",
    ocid: "toolbar.arrow_button",
  },
];

export default function Toolbar() {
  const { activeTool, setActiveTool, addObject, canvasSize, setSelectedIds } =
    useCanvasContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = Math.min(400, canvasSize.width * 0.5);
        const maxH = Math.min(400, canvasSize.height * 0.5);
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = (h * maxW) / w;
          w = maxW;
        }
        if (h > maxH) {
          w = (w * maxH) / h;
          h = maxH;
        }
        addObject({
          type: "image",
          x: Math.round((canvasSize.width - w) / 2),
          y: Math.round((canvasSize.height - h) / 2),
          width: Math.round(w),
          height: Math.round(h),
          rotation: 0,
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
          opacity: 1,
          imageUrl: url,
          name: file.name.replace(/\.[^.]+$/, ""),
        });
        setSelectedIds([]);
        setActiveTool("select");
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className="panel-glass flex flex-col items-center gap-1 w-12 py-3 shrink-0">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.type}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid={tool.ocid}
                className={`tool-btn ${activeTool === tool.type ? "active" : ""}`}
                onClick={() => setActiveTool(tool.type)}
              >
                {tool.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {tool.label}{" "}
              <span className="text-muted-foreground ml-1">
                {tool.shortcut}
              </span>
            </TooltipContent>
          </Tooltip>
        ))}

        <Separator className="my-1 w-8" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-ocid="toolbar.image_upload_button"
              className="tool-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Upload Image
          </TooltipContent>
        </Tooltip>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>
    </TooltipProvider>
  );
}
