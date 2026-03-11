import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type {
  CanvasBackground,
  CanvasObject,
  CanvasPreset,
  ToolType,
} from "../types/canvas";
import { CANVAS_PRESETS, DEFAULT_BACKGROUND } from "../types/canvas";

function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}

interface HistoryEntry {
  objects: CanvasObject[];
  background: CanvasBackground;
}

export interface CanvasContextValue {
  objects: CanvasObject[];
  selectedIds: string[];
  activeTool: ToolType;
  zoom: number;
  canvasSize: CanvasPreset;
  background: CanvasBackground;
  historyIndex: number;
  historyLength: number;
  setActiveTool: (t: ToolType) => void;
  setZoom: (z: number) => void;
  setCanvasSize: (s: CanvasPreset) => void;
  setBackground: (bg: CanvasBackground) => void;
  setSelectedIds: (ids: string[]) => void;
  addObject: (obj: Omit<CanvasObject, "id">) => string;
  updateObjects: (ids: string[], updates: Partial<CanvasObject>) => void;
  commitHistory: () => void;
  deleteSelected: () => void;
  deleteObjects: (ids: string[]) => void;
  duplicate: () => void;
  undo: () => void;
  redo: () => void;
  reorderLayer: (fromIdx: number, toIdx: number) => void;
  getCanvasJson: () => string;
  loadFromJson: (json: string) => void;
  clearCanvas: () => void;
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvasContext must be inside CanvasProvider");
  return ctx;
}

function makeSampleObjects(preset: CanvasPreset): CanvasObject[] {
  const w = preset.width;
  const h = preset.height;
  return [
    {
      id: genId(),
      type: "rect",
      x: 0,
      y: 0,
      width: w,
      height: h,
      rotation: 0,
      fill: "#1a0533",
      stroke: "transparent",
      strokeWidth: 0,
      opacity: 1,
      name: "Background Rect",
    },
    {
      id: genId(),
      type: "circle",
      x: w * 0.65,
      y: -h * 0.3,
      width: h * 1.1,
      height: h * 1.1,
      rotation: 0,
      fill: "#3b0764",
      stroke: "transparent",
      strokeWidth: 0,
      opacity: 0.6,
      name: "Glow Circle",
    },
    {
      id: genId(),
      type: "rect",
      x: Math.round(w * 0.07),
      y: Math.round(h * 0.25),
      width: Math.round(w * 0.55),
      height: Math.round(h * 0.5),
      rotation: 0,
      fill: "transparent",
      stroke: "#a855f7",
      strokeWidth: 1,
      opacity: 0.35,
      name: "Accent Border",
    },
    {
      id: genId(),
      type: "text",
      x: Math.round(w * 0.08),
      y: Math.round(h * 0.28),
      width: Math.round(w * 0.5),
      height: Math.round(h * 0.3),
      rotation: 0,
      fill: "#ffffff",
      stroke: "transparent",
      strokeWidth: 0,
      opacity: 1,
      text: "Design Studio",
      fontFamily: "Bricolage Grotesque",
      fontSize: Math.round(h * 0.18),
      bold: true,
      name: "Headline",
    },
    {
      id: genId(),
      type: "text",
      x: Math.round(w * 0.08),
      y: Math.round(h * 0.58),
      width: Math.round(w * 0.45),
      height: Math.round(h * 0.2),
      rotation: 0,
      fill: "#c4b5fd",
      stroke: "transparent",
      strokeWidth: 0,
      opacity: 1,
      text: "Create beautiful graphics & banners",
      fontFamily: "Sora",
      fontSize: Math.round(h * 0.07),
      name: "Subheadline",
    },
  ];
}

export function useCanvas(): CanvasContextValue {
  const [objects, setObjects] = useState<CanvasObject[]>(() =>
    makeSampleObjects(CANVAS_PRESETS[0]),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [zoom, setZoom] = useState(0.72);
  const [canvasSize, setCanvasSizeState] = useState<CanvasPreset>(
    CANVAS_PRESETS[0],
  );
  const [background, setBackgroundState] =
    useState<CanvasBackground>(DEFAULT_BACKGROUND);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyLength, setHistoryLength] = useState(1);

  const historyRef = useRef<HistoryEntry[]>([
    {
      objects: makeSampleObjects(CANVAS_PRESETS[0]),
      background: DEFAULT_BACKGROUND,
    },
  ]);
  const historyIdxRef = useRef(0);

  const pushHistory = useCallback(
    (objs: CanvasObject[], bg: CanvasBackground) => {
      const sliced = historyRef.current.slice(0, historyIdxRef.current + 1);
      sliced.push({ objects: objs, background: bg });
      if (sliced.length > 60) sliced.shift();
      historyRef.current = sliced;
      historyIdxRef.current = sliced.length - 1;
      setHistoryIndex(historyIdxRef.current);
      setHistoryLength(sliced.length);
    },
    [],
  );

  const addObject = useCallback(
    (obj: Omit<CanvasObject, "id">) => {
      const newObj: CanvasObject = { ...obj, id: genId() };
      setObjects((prev) => {
        const next = [...prev, newObj];
        pushHistory(next, background);
        return next;
      });
      setSelectedIds([newObj.id]);
      return newObj.id;
    },
    [background, pushHistory],
  );

  const updateObjects = useCallback(
    (ids: string[], updates: Partial<CanvasObject>) => {
      setObjects((prev) =>
        prev.map((o) => (ids.includes(o.id) ? { ...o, ...updates } : o)),
      );
    },
    [],
  );

  const commitHistory = useCallback(() => {
    setObjects((prev) => {
      setBackgroundState((bg) => {
        pushHistory(prev, bg);
        return bg;
      });
      return prev;
    });
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    setObjects((prev) => {
      const next = prev.filter((o) => !selectedIds.includes(o.id));
      pushHistory(next, background);
      return next;
    });
    setSelectedIds([]);
  }, [selectedIds, background, pushHistory]);

  const deleteObjects = useCallback(
    (ids: string[]) => {
      setObjects((prev) => {
        const next = prev.filter((o) => !ids.includes(o.id));
        pushHistory(next, background);
        return next;
      });
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    },
    [background, pushHistory],
  );

  const duplicate = useCallback(() => {
    setObjects((prev) => {
      const toDup = prev.filter((o) => selectedIds.includes(o.id));
      if (toDup.length === 0) return prev;
      const newObjs = toDup.map((o) => ({
        ...o,
        id: genId(),
        x: o.x + 20,
        y: o.y + 20,
      }));
      const next = [...prev, ...newObjs];
      pushHistory(next, background);
      setSelectedIds(newObjs.map((o) => o.id));
      return next;
    });
  }, [selectedIds, background, pushHistory]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const entry = historyRef.current[historyIdxRef.current];
    setObjects(entry.objects);
    setBackgroundState(entry.background);
    setSelectedIds([]);
    setHistoryIndex(historyIdxRef.current);
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const entry = historyRef.current[historyIdxRef.current];
    setObjects(entry.objects);
    setBackgroundState(entry.background);
    setSelectedIds([]);
    setHistoryIndex(historyIdxRef.current);
  }, []);

  const reorderLayer = useCallback(
    (fromIdx: number, toIdx: number) => {
      setObjects((prev) => {
        const next = [...prev];
        const [item] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, item);
        pushHistory(next, background);
        return next;
      });
    },
    [background, pushHistory],
  );

  const setCanvasSize = useCallback((s: CanvasPreset) => {
    setCanvasSizeState(s);
  }, []);

  const setBackground = useCallback(
    (bg: CanvasBackground) => {
      setBackgroundState(bg);
      setObjects((prev) => {
        pushHistory(prev, bg);
        return prev;
      });
    },
    [pushHistory],
  );

  const getCanvasJson = useCallback(() => {
    return JSON.stringify({ objects, background, canvasSize });
  }, [objects, background, canvasSize]);

  const loadFromJson = useCallback(
    (json: string) => {
      try {
        const data = JSON.parse(json);
        const objs = data.objects || [];
        const bg = data.background || DEFAULT_BACKGROUND;
        if (data.canvasSize) setCanvasSizeState(data.canvasSize);
        setObjects(objs);
        setBackgroundState(bg);
        setSelectedIds([]);
        pushHistory(objs, bg);
      } catch (e) {
        console.error("Failed to parse design JSON", e);
      }
    },
    [pushHistory],
  );

  const clearCanvas = useCallback(() => {
    setObjects([]);
    setSelectedIds([]);
    pushHistory([], background);
  }, [background, pushHistory]);

  return {
    objects,
    setObjects,
    selectedIds,
    activeTool,
    zoom,
    canvasSize,
    background,
    historyIndex,
    historyLength,
    setActiveTool,
    setZoom,
    setCanvasSize,
    setBackground,
    setSelectedIds,
    addObject,
    updateObjects,
    commitHistory,
    deleteSelected,
    deleteObjects,
    duplicate,
    undo,
    redo,
    reorderLayer,
    getCanvasJson,
    loadFromJson,
    clearCanvas,
  };
}
