import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  ImageIcon,
  Minus,
  MoveRight,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import { useCanvasContext } from "../hooks/useCanvas";
import type { CanvasObject } from "../types/canvas";

function typeIcon(type: CanvasObject["type"]) {
  const cls = "w-3 h-3";
  switch (type) {
    case "rect":
      return <Square className={cls} />;
    case "circle":
      return <Circle className={cls} />;
    case "text":
      return <Type className={cls} />;
    case "line":
      return <Minus className={cls} />;
    case "arrow":
      return <MoveRight className={cls} />;
    case "image":
      return <ImageIcon className={cls} />;
    default:
      return <Eye className={cls} />;
  }
}

export default function LayersPanel() {
  const { objects, selectedIds, setSelectedIds, deleteObjects, reorderLayer } =
    useCanvasContext();

  // Display layers in reverse order (topmost = first)
  const reversed = [...objects].reverse();

  function handleSelect(id: string, shift: boolean) {
    if (shift) {
      setSelectedIds(
        selectedIds.includes(id)
          ? selectedIds.filter((x) => x !== id)
          : [...selectedIds, id],
      );
    } else {
      setSelectedIds([id]);
    }
  }

  function moveUp(origIdx: number) {
    if (origIdx >= objects.length - 1) return;
    reorderLayer(origIdx, origIdx + 1);
  }

  function moveDown(origIdx: number) {
    if (origIdx <= 0) return;
    reorderLayer(origIdx, origIdx - 1);
  }

  return (
    <div
      data-ocid="layers.panel"
      className="flex flex-col border-t border-border"
      style={{ height: "50%" }}
    >
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layers
        </p>
        <span className="text-xs text-muted-foreground font-mono">
          {objects.length}
        </span>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        {objects.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4 px-3">
            No layers yet
          </p>
        )}
        {reversed.map((obj, reversedIdx) => {
          const origIdx = objects.length - 1 - reversedIdx;
          const isSelected = selectedIds.includes(obj.id);
          return (
            <div
              key={obj.id}
              data-ocid={`layers.item.${reversedIdx + 1}`}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer group transition-colors ${
                isSelected
                  ? "bg-primary/20 border-l-2 border-primary"
                  : "border-l-2 border-transparent hover:bg-secondary"
              }`}
              onClick={(e) => handleSelect(obj.id, e.shiftKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleSelect(obj.id, e.shiftKey);
              }}
            >
              <span className="text-muted-foreground shrink-0">
                {typeIcon(obj.type)}
              </span>
              <span className="flex-1 text-xs truncate">
                {obj.name || `${obj.type} ${origIdx + 1}`}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(origIdx);
                  }}
                >
                  <ChevronUp size={10} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(origIdx);
                  }}
                >
                  <ChevronDown size={10} />
                </Button>
                <Button
                  data-ocid={`layers.delete_button.${reversedIdx + 1}`}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteObjects([obj.id]);
                  }}
                >
                  <Trash2 size={10} />
                </Button>
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
