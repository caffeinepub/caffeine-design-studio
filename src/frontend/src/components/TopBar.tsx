import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, FolderOpen, Save, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCanvasContext } from "../hooks/useCanvas";
import {
  useDeleteDesign,
  useListDesigns,
  useSaveDesign,
} from "../hooks/useQueries";
import { CANVAS_PRESETS, PRESET_CATEGORIES } from "../types/canvas";

interface TopBarProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function TopBar({ canvasRef }: TopBarProps) {
  const {
    canvasSize,
    setCanvasSize,
    getCanvasJson,
    loadFromJson,
    clearCanvas,
  } = useCanvasContext();

  const [saveTitle, setSaveTitle] = useState("My Design");
  const [customW, setCustomW] = useState("800");
  const [customH, setCustomH] = useState("600");
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

  const { mutateAsync: saveDesign, isPending: isSaving } = useSaveDesign();
  const { data: designs = [] } = useListDesigns();
  const { mutateAsync: deleteDesign } = useDeleteDesign();

  const selectedPreset =
    CANVAS_PRESETS.find(
      (p) => p.width === canvasSize.width && p.height === canvasSize.height,
    )?.name ?? "Custom";

  function handlePresetChange(name: string) {
    if (name === "Custom") {
      const w = Number.parseInt(customW) || 800;
      const h = Number.parseInt(customH) || 600;
      setCanvasSize({ name: "Custom", width: w, height: h });
      return;
    }
    const preset = CANVAS_PRESETS.find((p) => p.name === name);
    if (preset) setCanvasSize(preset);
  }

  async function handleSave() {
    const json = getCanvasJson();
    const thumb = canvasRef.current?.toDataURL("image/jpeg", 0.4) ?? "";
    try {
      await saveDesign({ title: saveTitle, data: json, thumbnailUrl: thumb });
      toast.success("Design saved!");
      setSaveOpen(false);
    } catch {
      toast.error("Failed to save design");
    }
  }

  async function handleLoad(data: string) {
    loadFromJson(data);
    setLoadOpen(false);
    toast.success("Design loaded!");
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteDesign(id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <header className="flex items-center gap-3 px-3 h-11 border-b border-border bg-card shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-2">
        <Sparkles size={16} className="text-primary" />
        <span className="font-display font-bold text-sm tracking-tight text-foreground">
          Designr
        </span>
      </div>

      {/* Canvas Preset */}
      <div className="flex items-center gap-2">
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger
            data-ocid="topbar.preset_select"
            className="h-7 text-xs w-56 bg-secondary border-border"
          >
            <SelectValue />
            <ChevronDown size={12} className="ml-1 opacity-50" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {PRESET_CATEGORIES.map((cat) => (
              <SelectGroup key={cat}>
                <SelectLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {cat}
                </SelectLabel>
                {CANVAS_PRESETS.filter(
                  (p) => (p.category ?? "Other") === cat,
                ).map((p) => (
                  <SelectItem
                    key={p.name}
                    value={p.name}
                    className="text-xs pl-4"
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {selectedPreset === "Custom" && (
          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-16 text-xs text-center font-mono bg-secondary border-border"
              value={customW}
              onChange={(e) => setCustomW(e.target.value)}
              onBlur={() => handlePresetChange("Custom")}
              placeholder="W"
            />
            <span className="text-muted-foreground text-xs">×</span>
            <Input
              className="h-7 w-16 text-xs text-center font-mono bg-secondary border-border"
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              onBlur={() => handlePresetChange("Custom")}
              placeholder="H"
            />
          </div>
        )}
      </div>

      <div className="text-border text-xs mx-1">|</div>
      <div className="text-xs text-muted-foreground font-mono">
        {canvasSize.width} × {canvasSize.height}px
      </div>

      <div className="flex-1" />

      {/* New */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={clearCanvas}
      >
        New
      </Button>

      {/* Load */}
      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <FolderOpen size={13} />
            Open
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Saved Designs</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-72">
            {designs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No saved designs yet
              </p>
            ) : (
              <div className="space-y-2 pr-2">
                {designs.map((d, i) => (
                  <div
                    key={String(i) + d.title}
                    data-ocid={`designs.item.${i + 1}`}
                    className="flex items-center gap-3 p-2 rounded-md bg-secondary hover:bg-muted cursor-pointer group"
                  >
                    {d.thumbnailUrl && (
                      <img
                        src={d.thumbnailUrl}
                        className="w-16 h-10 object-cover rounded"
                        alt={d.title}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{d.title}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => handleLoad(d.data)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(BigInt(i))}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Save */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button
            data-ocid="topbar.save_button"
            size="sm"
            variant="secondary"
            className="h-7 text-xs gap-1"
          >
            <Save size={12} />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Save Design</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Design Title
              </Label>
              <Input
                className="mt-1 text-sm bg-input border-border"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="My Design"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
