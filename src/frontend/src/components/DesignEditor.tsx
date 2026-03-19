import { Layers, Layout } from "lucide-react";
import { useRef, useState } from "react";
import BottomBar from "./BottomBar";
import CanvasView from "./CanvasView";
import LayersPanel from "./LayersPanel";
import PropertiesPanel from "./PropertiesPanel";
import TemplatesPanel from "./TemplatesPanel";
import Toolbar from "./Toolbar";
import TopBar from "./TopBar";

type LeftTab = "tools" | "templates";

export default function DesignEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>("tools");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <TopBar canvasRef={canvasRef} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left side: tab switcher + panel */}
        <div className="flex shrink-0">
          {/* Icon tabs */}
          <div className="panel-glass flex flex-col items-center gap-1 w-12 py-3 shrink-0 border-r border-border">
            <button
              type="button"
              data-ocid="sidebar.tools_tab"
              title="Tools"
              onClick={() => setLeftTab("tools")}
              className={`tool-btn ${leftTab === "tools" ? "active" : ""}`}
            >
              <Layout size={16} />
            </button>
            <button
              type="button"
              data-ocid="sidebar.templates_tab"
              title="Templates"
              onClick={() => setLeftTab("templates")}
              className={`tool-btn ${leftTab === "templates" ? "active" : ""}`}
            >
              <Layers size={16} />
            </button>
          </div>

          {/* Panel content */}
          {leftTab === "tools" ? (
            <Toolbar />
          ) : (
            <div className="w-56 panel-glass border-r border-border overflow-hidden flex flex-col">
              <TemplatesPanel />
            </div>
          )}
        </div>

        <CanvasView canvasRef={canvasRef} />
        <div className="flex flex-col w-64 shrink-0 panel-glass-right overflow-hidden">
          <PropertiesPanel />
          <LayersPanel />
        </div>
      </div>
      <BottomBar canvasRef={canvasRef} />
    </div>
  );
}
