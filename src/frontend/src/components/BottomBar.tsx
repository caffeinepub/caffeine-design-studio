import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Maximize2,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCanvasContext } from "../hooks/useCanvas";

interface BottomBarProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function BottomBar({ canvasRef }: BottomBarProps) {
  const { zoom, setZoom, undo, redo, historyIndex, historyLength, canvasSize } =
    useCanvasContext();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFmt, setExportFmt] = useState<"png" | "jpeg">("png");
  const [exportQuality, setExportQuality] = useState(90);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  function handleZoomIn() {
    setZoom(Math.min(4, zoom + 0.1));
  }
  function handleZoomOut() {
    setZoom(Math.max(0.1, zoom - 0.1));
  }
  function handleFitScreen() {
    const el = document.querySelector(".canvas-workspace");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const zw = (rect.width - 64) / canvasSize.width;
    const zh = (rect.height - 64) / canvasSize.height;
    setZoom(Math.min(zw, zh, 4));
  }

  function doExport() {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not ready");
      return;
    }
    const mime = exportFmt === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mime, exportQuality / 100);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `design.${exportFmt}`;
    a.click();
    toast.success(`Exported as ${exportFmt.toUpperCase()}`);
    setExportOpen(false);
  }

  const zoomPct = Math.round(zoom * 100);

  return (
    <TooltipProvider delayDuration={400}>
      <footer className="flex items-center gap-1 px-3 h-9 border-t border-border bg-card shrink-0">
        {/* Undo / Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-ocid="bottombar.undo_button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-ocid="bottombar.redo_button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Zoom */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomOut}
            >
              <ZoomOut size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>

        <input
          data-ocid="bottombar.zoom_input"
          type="number"
          className="h-7 w-14 text-center text-xs bg-input border border-border rounded font-mono"
          value={zoomPct}
          min={10}
          max={400}
          onChange={(e) =>
            setZoom(
              Math.max(
                0.1,
                Math.min(4, Number.parseInt(e.target.value || "100") / 100),
              ),
            )
          }
        />
        <span className="text-xs text-muted-foreground">%</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomIn}
            >
              <ZoomIn size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleFitScreen}
            >
              <Maximize2 size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to Screen</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        {/* Export */}
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="topbar.export_button"
              size="sm"
              className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download size={12} />
              Export
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="export.dialog"
            className="bg-card border-border max-w-sm"
          >
            <DialogHeader>
              <DialogTitle className="text-sm">Export Design</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Format
                </Label>
                <div className="flex gap-2">
                  {(["png", "jpeg"] as const).map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => setExportFmt(fmt)}
                      className={`flex-1 py-2 rounded text-xs font-medium border transition-all ${
                        exportFmt === fmt
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {exportFmt === "jpeg" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Quality: {exportQuality}%
                  </Label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={exportQuality}
                    onChange={(e) =>
                      setExportQuality(Number.parseInt(e.target.value))
                    }
                    className="w-full accent-primary"
                  />
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Size: {canvasSize.width} × {canvasSize.height}px
              </div>
            </div>
            <DialogFooter>
              <Button
                data-ocid="export.cancel_button"
                variant="ghost"
                size="sm"
                onClick={() => setExportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="export.confirm_button"
                size="sm"
                onClick={doExport}
                className="bg-primary text-primary-foreground"
              >
                <Download size={12} className="mr-1" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </footer>
    </TooltipProvider>
  );
}
