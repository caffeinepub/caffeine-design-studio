import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCanvasContext } from "../hooks/useCanvas";

const FONT_FAMILIES = [
  "Sora",
  "Bricolage Grotesque",
  "Geist Mono",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
];

function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="prop-label flex-1">{label}</span>
      <div className="relative">
        <input
          type="color"
          value={value === "transparent" ? "#000000" : value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-7 h-7 cursor-pointer"
        />
        <div
          className="w-7 h-7 rounded border border-border cursor-pointer"
          style={{
            background:
              value === "transparent"
                ? "repeating-conic-gradient(#888 0% 25%, #555 0% 50%) 0 0 / 8px 8px"
                : value,
          }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 bg-input border border-border rounded px-1.5 py-0.5 text-xs font-mono"
      />
    </div>
  );
}

export default function PropertiesPanel() {
  const {
    objects,
    selectedIds,
    updateObjects,
    commitHistory,
    background,
    setBackground,
  } = useCanvasContext();

  const selected = objects.filter((o) => selectedIds.includes(o.id));
  const single = selected.length === 1 ? selected[0] : null;
  const multi = selected.length > 1;

  function up(updates: Parameters<typeof updateObjects>[1]) {
    if (selectedIds.length === 0) return;
    updateObjects(selectedIds, updates);
  }
  function upCommit(updates: Parameters<typeof updateObjects>[1]) {
    up(updates);
    setTimeout(commitHistory, 0);
  }

  const isText = single?.type === "text";

  return (
    <div
      data-ocid="properties.panel"
      className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
      style={{ maxHeight: "50%" }}
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Properties
      </p>

      {selected.length === 0 && (
        <>
          {/* Background controls */}
          <div className="space-y-2">
            <Label className="prop-label">Background Type</Label>
            <div className="flex gap-1">
              {(["solid", "gradient"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setBackground({ ...background, type: t })}
                  className={`flex-1 text-xs py-1 rounded border transition-all ${
                    background.type === t
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <ColorSwatch
              label="Color"
              value={background.color}
              onChange={(v) => setBackground({ ...background, color: v })}
            />
            {background.type === "gradient" && (
              <>
                <ColorSwatch
                  label="End Color"
                  value={background.gradientEnd}
                  onChange={(v) =>
                    setBackground({ ...background, gradientEnd: v })
                  }
                />
                <div>
                  <Label className="prop-label">
                    Angle: {background.gradientAngle}°
                  </Label>
                  <Slider
                    min={0}
                    max={360}
                    step={1}
                    value={[background.gradientAngle]}
                    onValueChange={([v]) =>
                      setBackground({ ...background, gradientAngle: v })
                    }
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center py-2">
            Select an object to edit its properties
          </p>
        </>
      )}

      {(single || multi) && (
        <>
          {/* Position & size */}
          {single && single.type !== "line" && single.type !== "arrow" && (
            <div className="grid grid-cols-2 gap-2">
              {(["x", "y", "width", "height"] as const).map((key) => (
                <div key={key}>
                  <span className="prop-label uppercase block">{key}</span>
                  <input
                    type="number"
                    className="prop-input"
                    value={Math.round(single[key])}
                    onChange={(e) =>
                      up({ [key]: Number.parseFloat(e.target.value) || 0 })
                    }
                    onBlur={() => commitHistory()}
                  />
                </div>
              ))}
            </div>
          )}

          {single && (
            <div>
              <span className="prop-label block">
                Rotation: {Math.round(single.rotation)}°
              </span>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={[single.rotation]}
                onValueChange={([v]) => up({ rotation: v })}
                onValueCommit={() => commitHistory()}
                className="mt-1"
              />
            </div>
          )}

          <Separator />

          {/* Fill / Stroke */}
          {single && single.type !== "text" && (
            <>
              <ColorSwatch
                label="Fill"
                value={single.fill}
                onChange={(v) => upCommit({ fill: v })}
              />
              {single.type !== "line" && single.type !== "arrow" && (
                <>
                  <ColorSwatch
                    label="Stroke"
                    value={single.stroke}
                    onChange={(v) => upCommit({ stroke: v })}
                  />
                  <div>
                    <span className="prop-label block">Stroke Width</span>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      className="prop-input"
                      value={single.strokeWidth}
                      onChange={(e) =>
                        upCommit({
                          strokeWidth: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </>
              )}
              {(single.type === "line" || single.type === "arrow") && (
                <div>
                  <span className="prop-label block">Line Width</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="prop-input"
                    value={single.strokeWidth || 2}
                    onChange={(e) =>
                      upCommit({
                        strokeWidth: Number.parseFloat(e.target.value) || 2,
                      })
                    }
                  />
                </div>
              )}
            </>
          )}

          {/* Text properties */}
          {isText && single && (
            <>
              <ColorSwatch
                label="Text Color"
                value={single.fill}
                onChange={(v) => upCommit({ fill: v })}
              />

              <div>
                <Label className="prop-label">Font Family</Label>
                <Select
                  value={single.fontFamily || "Sora"}
                  onValueChange={(v) => upCommit({ fontFamily: v })}
                >
                  <SelectTrigger className="h-7 text-xs bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <span className="prop-label block">Font Size</span>
                <input
                  type="number"
                  min={6}
                  max={400}
                  className="prop-input"
                  value={single.fontSize || 24}
                  onChange={(e) =>
                    upCommit({
                      fontSize: Number.parseInt(e.target.value) || 24,
                    })
                  }
                />
              </div>

              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="bold"
                    checked={!!single.bold}
                    onCheckedChange={(v) => upCommit({ bold: v })}
                  />
                  <Label htmlFor="bold" className="text-xs">
                    Bold
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="italic"
                    checked={!!single.italic}
                    onCheckedChange={(v) => upCommit({ italic: v })}
                  />
                  <Label htmlFor="italic" className="text-xs">
                    Italic
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="underline"
                  checked={!!single.underline}
                  onCheckedChange={(v) => upCommit({ underline: v })}
                />
                <Label htmlFor="underline" className="text-xs">
                  Underline
                </Label>
              </div>

              <div>
                <span className="prop-label block">Text Content</span>
                <textarea
                  className="w-full bg-input border border-border rounded px-2 py-1 text-xs font-mono min-h-[60px] resize-none"
                  value={single.text || ""}
                  onChange={(e) => up({ text: e.target.value })}
                  onBlur={() => commitHistory()}
                />
              </div>
            </>
          )}

          <Separator />

          {/* Opacity */}
          <div>
            <span className="prop-label block">
              Opacity:{" "}
              {Math.round(
                (single ? single.opacity : (selected[0]?.opacity ?? 1)) * 100,
              )}
              %
            </span>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[single ? single.opacity : (selected[0]?.opacity ?? 1)]}
              onValueChange={([v]) => up({ opacity: v })}
              onValueCommit={() => commitHistory()}
              className="mt-1"
            />
          </div>
        </>
      )}
    </div>
  );
}
