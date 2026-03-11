import { useRef } from "react";
import BottomBar from "./BottomBar";
import CanvasView from "./CanvasView";
import LayersPanel from "./LayersPanel";
import PropertiesPanel from "./PropertiesPanel";
import Toolbar from "./Toolbar";
import TopBar from "./TopBar";

export default function DesignEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <TopBar canvasRef={canvasRef} />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
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
