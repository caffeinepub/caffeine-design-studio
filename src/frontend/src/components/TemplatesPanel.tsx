import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCanvasContext } from "../hooks/useCanvas";
import { DESIGN_TEMPLATES, TEMPLATE_CATEGORIES } from "../types/canvas";

export default function TemplatesPanel() {
  const { setCanvasSize, setBackground, loadFromJson, clearCanvas } =
    useCanvasContext();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const categories = ["All", ...TEMPLATE_CATEGORIES];

  const filtered = useMemo(() => {
    return DESIGN_TEMPLATES.filter((t) => {
      const matchCat =
        activeCategory === "All" || t.category === activeCategory;
      const matchSearch =
        search === "" || t.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  function applyTemplate(templateId: string) {
    const tpl = DESIGN_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    setCanvasSize(tpl.preset);
    setBackground(tpl.background);

    if (tpl.objects.length > 0) {
      const json = JSON.stringify({
        objects: tpl.objects.map((obj, i) => ({
          ...obj,
          id: `tpl_${i}_${Date.now()}`,
        })),
      });
      loadFromJson(json);
    } else {
      clearCanvas();
    }

    toast.success(`Template "${tpl.name}" applied!`);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 mb-2">
          <Layout size={13} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">
            Templates
          </span>
        </div>
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="templates.search_input"
            className="h-7 text-xs pl-7 bg-secondary border-border"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="px-3 py-2 border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex gap-1 flex-wrap pb-1">
            {categories.map((cat) => (
              <Badge
                key={cat}
                data-ocid="templates.tab"
                variant={activeCategory === cat ? "default" : "outline"}
                className="cursor-pointer text-[10px] h-5 px-1.5 shrink-0"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Templates grid */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div
            data-ocid="templates.empty_state"
            className="flex flex-col items-center justify-center py-10 text-center px-4"
          >
            <Layout size={28} className="text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {filtered.map((tpl, i) => (
              <button
                type="button"
                key={tpl.id}
                data-ocid={`templates.item.${i + 1}`}
                onClick={() => applyTemplate(tpl.id)}
                className="group relative rounded-md overflow-hidden border border-border hover:border-primary/60 transition-all duration-150 hover:shadow-md cursor-pointer text-left"
                title={tpl.name}
              >
                {/* Thumbnail */}
                <div
                  className="w-full aspect-video flex items-end"
                  style={{
                    background: tpl.thumbnail,
                    backgroundSize: "cover",
                  }}
                >
                  <div className="w-full bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-medium leading-tight line-clamp-1">
                      Apply
                    </span>
                  </div>
                </div>
                {/* Label */}
                <div className="px-1.5 py-1 bg-card">
                  <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-1">
                    {tpl.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {tpl.preset.width}×{tpl.preset.height}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
