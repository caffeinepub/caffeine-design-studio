import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasContext } from "../hooks/useCanvas";
import type { CanvasObject } from "../types/canvas";
import {
  RESIZE_CURSORS,
  applyResize,
  drawBackground,
  drawObject,
  drawSelectionHandles,
  getHitHandle,
  getObjectsInSelectionRect,
  isPointInObject,
  normalizeObject,
} from "../utils/canvasRenderer";

type InteractMode =
  | "idle"
  | "drawing"
  | "moving"
  | "resizing"
  | "rotating"
  | "selecting";

interface Interaction {
  mode: InteractMode;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  drawingId: string | null;
  movingOffsets: {
    id: string;
    ox: number;
    oy: number;
    ox2?: number;
    oy2?: number;
  }[];
  resizeHandle: number;
  rotateStart: number;
  selectRect: { x: number; y: number; w: number; h: number } | null;
}

interface CanvasViewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CanvasView({ canvasRef }: CanvasViewProps) {
  const {
    objects,
    selectedIds,
    setSelectedIds,
    activeTool,
    zoom,
    canvasSize,
    background,
    addObject,
    updateObjects,
    commitHistory,
    setActiveTool,
    deleteSelected,
    duplicate,
    undo,
    redo,
  } = useCanvasContext();

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const interactionRef = useRef<Interaction>({
    mode: "idle",
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    drawingId: null,
    movingOffsets: [],
    resizeHandle: -1,
    rotateStart: 0,
    selectRect: null,
  });

  const [cursor, setCursor] = useState("default");
  const [selectRect, setSelectRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textValue, setTextValue] = useState("");
  const [forceRedraw, setForceRedraw] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Preload images
  useEffect(() => {
    for (const obj of objects) {
      if (
        obj.type === "image" &&
        obj.imageUrl &&
        !imageCacheRef.current.has(obj.imageUrl)
      ) {
        const img = new Image();
        img.onload = () => {
          imageCacheRef.current.set(obj.imageUrl!, img);
          setForceRedraw((v) => v + 1);
        };
        img.src = obj.imageUrl;
      }
    }
  }, [objects]);

  // Render canvas
  // biome-ignore lint/correctness/useExhaustiveDependencies: forceRedraw is an intentional trigger
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvasSize.width, canvasSize.height, background);

    for (const obj of objects) {
      drawObject(ctx, obj, imageCacheRef.current);
    }

    for (const id of selectedIds) {
      const obj = objects.find((o) => o.id === id);
      if (obj) drawSelectionHandles(ctx, obj);
    }

    // Draw selection rect
    if (selectRect) {
      ctx.save();
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(selectRect.x, selectRect.y, selectRect.w, selectRect.h);
      ctx.fillStyle = "rgba(124,58,237,0.06)";
      ctx.fillRect(selectRect.x, selectRect.y, selectRect.w, selectRect.h);
      ctx.restore();
    }
  }, [
    objects,
    selectedIds,
    background,
    canvasSize,
    selectRect,
    forceRedraw,
    canvasRef,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingTextId) return;
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      } else if (e.key === "Escape") {
        setSelectedIds([]);
        setActiveTool("select");
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          undo();
        } else if (e.key === "y") {
          e.preventDefault();
          redo();
        } else if (e.key === "d") {
          e.preventDefault();
          duplicate();
        } else if (e.key === "a") {
          e.preventDefault();
          setSelectedIds(objects.map((o) => o.id));
        }
      } else if (e.key === "v") setActiveTool("select");
      else if (e.key === "r") setActiveTool("rect");
      else if (e.key === "e") setActiveTool("circle");
      else if (e.key === "t") setActiveTool("text");
      else if (e.key === "l") setActiveTool("line");
      else if (e.key === "a" && !e.ctrlKey) setActiveTool("arrow");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    editingTextId,
    deleteSelected,
    setSelectedIds,
    setActiveTool,
    undo,
    redo,
    duplicate,
    objects,
  ]);

  function getCanvasCoords(e: React.MouseEvent): [number, number] {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
  }

  function commitTextEdit() {
    if (!editingTextId) return;
    updateObjects([editingTextId], { text: textValue });
    setTimeout(commitHistory, 0);
    setEditingTextId(null);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: complex handler uses refs
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (editingTextId) {
        commitTextEdit();
        return;
      }
      if (e.button !== 0) return;
      const [px, py] = getCanvasCoords(e);
      const ia = interactionRef.current;
      ia.startX = px;
      ia.startY = py;
      ia.lastX = px;
      ia.lastY = py;

      if (activeTool === "select") {
        // Check handles on single selection first
        if (selectedIds.length === 1) {
          const obj = objects.find((o) => o.id === selectedIds[0]);
          if (obj) {
            const h = getHitHandle(px, py, obj);
            if (h === 8) {
              // Rotation
              const cx = obj.x + obj.width / 2;
              const cy = obj.y + obj.height / 2;
              ia.mode = "rotating";
              ia.rotateStart =
                Math.atan2(py - cy, px - cx) * (180 / Math.PI) - obj.rotation;
              return;
            }
            if (h >= 0) {
              ia.mode = "resizing";
              ia.resizeHandle = h;
              return;
            }
          }
        }

        // Hit test objects (top-most first)
        let hit: CanvasObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          if (isPointInObject(px, py, objects[i])) {
            hit = objects[i];
            break;
          }
        }

        if (hit) {
          if (e.shiftKey) {
            setSelectedIds(
              selectedIds.includes(hit.id)
                ? selectedIds.filter((id) => id !== hit!.id)
                : [...selectedIds, hit.id],
            );
          } else {
            if (!selectedIds.includes(hit.id)) {
              setSelectedIds([hit.id]);
            }
          }
          // Start moving
          const ids = e.shiftKey
            ? selectedIds.includes(hit.id)
              ? selectedIds.filter((id) => id !== hit!.id)
              : [...selectedIds, hit.id]
            : selectedIds.includes(hit.id)
              ? selectedIds
              : [hit.id];

          ia.mode = "moving";
          ia.movingOffsets = ids
            .map((id) => objects.find((o) => o.id === id)!)
            .filter(Boolean)
            .map((o) => ({
              id: o.id,
              ox: o.x - px,
              oy: o.y - py,
              ox2: o.x2 !== undefined ? o.x2 - px : undefined,
              oy2: o.y2 !== undefined ? o.y2 - py : undefined,
            }));
        } else {
          // Start drag-select
          if (!e.shiftKey) setSelectedIds([]);
          ia.mode = "selecting";
          ia.selectRect = { x: px, y: py, w: 0, h: 0 };
        }
        return;
      }

      // Drawing tools
      if (activeTool === "text") {
        const id = addObject({
          type: "text",
          x: px,
          y: py,
          width: 200,
          height: 40,
          rotation: 0,
          fill: "#ffffff",
          stroke: "transparent",
          strokeWidth: 0,
          opacity: 1,
          text: "Text",
          fontFamily: "Sora",
          fontSize: 32,
          name: "Text",
        });
        setEditingTextId(id);
        setTextValue("Text");
        setActiveTool("select");
        return;
      }

      if (activeTool === "rect" || activeTool === "circle") {
        const defaults =
          activeTool === "rect"
            ? { fill: "#7c3aed", stroke: "transparent", strokeWidth: 0 }
            : { fill: "#7c3aed", stroke: "transparent", strokeWidth: 0 };
        const id = addObject({
          type: activeTool,
          x: px,
          y: py,
          width: 0,
          height: 0,
          rotation: 0,
          opacity: 1,
          ...defaults,
          name: activeTool === "rect" ? "Rectangle" : "Ellipse",
        });
        ia.mode = "drawing";
        ia.drawingId = id;
        return;
      }

      if (activeTool === "line" || activeTool === "arrow") {
        const id = addObject({
          type: activeTool,
          x: px,
          y: py,
          width: 0,
          height: 0,
          x2: px,
          y2: py,
          rotation: 0,
          fill: "#7c3aed",
          stroke: "#7c3aed",
          strokeWidth: 2,
          opacity: 1,
          name: activeTool === "line" ? "Line" : "Arrow",
        });
        ia.mode = "drawing";
        ia.drawingId = id;
      }
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool, objects, selectedIds, editingTextId],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: complex mouse handler
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const [px, py] = getCanvasCoords(e);
      const ia = interactionRef.current;
      const dx = px - ia.lastX;
      const dy = py - ia.lastY;

      if (ia.mode === "idle") {
        // Update cursor
        if (activeTool !== "select") {
          setCursor("crosshair");
          return;
        }
        if (selectedIds.length === 1) {
          const obj = objects.find((o) => o.id === selectedIds[0]);
          if (obj) {
            const h = getHitHandle(px, py, obj);
            if (h >= 0 && h < RESIZE_CURSORS.length) {
              setCursor(RESIZE_CURSORS[h]);
              return;
            }
          }
        }
        for (let i = objects.length - 1; i >= 0; i--) {
          if (isPointInObject(px, py, objects[i])) {
            setCursor(selectedIds.includes(objects[i].id) ? "move" : "pointer");
            return;
          }
        }
        setCursor("default");
        return;
      }

      if (ia.mode === "drawing" && ia.drawingId) {
        const obj = objects.find((o) => o.id === ia.drawingId);
        if (!obj) return;
        if (obj.type === "line" || obj.type === "arrow") {
          updateObjects([ia.drawingId], { x2: px, y2: py });
        } else {
          updateObjects([ia.drawingId], {
            width: px - ia.startX,
            height: py - ia.startY,
          });
        }
      } else if (ia.mode === "moving") {
        const updates: { id: string; updates: Partial<CanvasObject> }[] = [];
        for (const offset of ia.movingOffsets) {
          const newX = px + offset.ox;
          const newY = py + offset.oy;
          const u: Partial<CanvasObject> = { x: newX, y: newY };
          if (offset.ox2 !== undefined) u.x2 = px + offset.ox2;
          if (offset.oy2 !== undefined) u.y2 = py + offset.oy2;
          updates.push({ id: offset.id, updates: u });
        }
        for (const { id, updates: u } of updates) {
          updateObjects([id], u);
        }
        setCursor("move");
      } else if (ia.mode === "resizing" && selectedIds.length === 1) {
        const obj = objects.find((o) => o.id === selectedIds[0]);
        if (obj) {
          const upd = applyResize(obj, ia.resizeHandle, dx, dy);
          updateObjects([obj.id], upd);
        }
      } else if (ia.mode === "rotating" && selectedIds.length === 1) {
        const obj = objects.find((o) => o.id === selectedIds[0]);
        if (obj) {
          const cx = obj.x + obj.width / 2;
          const cy = obj.y + obj.height / 2;
          const angle =
            Math.atan2(py - cy, px - cx) * (180 / Math.PI) - ia.rotateStart;
          updateObjects([obj.id], { rotation: angle });
          setCursor("crosshair");
        }
      } else if (ia.mode === "selecting") {
        const r = {
          x: ia.startX,
          y: ia.startY,
          w: px - ia.startX,
          h: py - ia.startY,
        };
        ia.selectRect = r;
        setSelectRect({ ...r });
      }

      ia.lastX = px;
      ia.lastY = py;
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool, objects, selectedIds, updateObjects],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: complex mouse handler
  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const [px, py] = getCanvasCoords(e);
      const ia = interactionRef.current;

      if (ia.mode === "drawing" && ia.drawingId) {
        const obj = objects.find((o) => o.id === ia.drawingId);
        if (obj) {
          const normalized = normalizeObject(obj);
          updateObjects([ia.drawingId], normalized);
        }
        commitHistory();
        setActiveTool("select");
      } else if (
        ia.mode === "moving" ||
        ia.mode === "resizing" ||
        ia.mode === "rotating"
      ) {
        commitHistory();
      } else if (ia.mode === "selecting") {
        const r = ia.selectRect;
        if (r && (Math.abs(r.w) > 3 || Math.abs(r.h) > 3)) {
          const ids = getObjectsInSelectionRect(objects, r.x, r.y, r.w, r.h);
          if (ids.length > 0) {
            setSelectedIds(e.shiftKey ? [...selectedIds, ...ids] : ids);
          }
        } else {
          // Single click on empty: deselect
          if (!e.shiftKey) setSelectedIds([]);
        }
        setSelectRect(null);
        ia.selectRect = null;
      }

      ia.mode = "idle";
      ia.drawingId = null;
      setCursor("default");
      void px;
      void py;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      objects,
      selectedIds,
      commitHistory,
      setActiveTool,
      updateObjects,
      setSelectedIds,
    ],
  );

  function onDoubleClick(e: React.MouseEvent) {
    const [px, py] = getCanvasCoords(e);
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.type === "text" && isPointInObject(px, py, obj)) {
        setEditingTextId(obj.id);
        setTextValue(obj.text || "");
        setSelectedIds([obj.id]);
        setTimeout(() => textareaRef.current?.focus(), 50);
        return;
      }
    }
  }

  // Position textarea overlay over the text object
  const editingObj = editingTextId
    ? objects.find((o) => o.id === editingTextId)
    : null;
  const canvasEl = canvasRef.current;
  let textAreaStyle: React.CSSProperties = {};
  if (editingObj && canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = rect.width / canvasSize.width;
    const scaleY = rect.height / canvasSize.height;
    textAreaStyle = {
      position: "fixed",
      left: rect.left + editingObj.x * scaleX,
      top: rect.top + editingObj.y * scaleY,
      minWidth: Math.max(100, editingObj.width * scaleX),
      minHeight: Math.max(40, editingObj.height * scaleY),
      fontSize: (editingObj.fontSize || 24) * scaleX,
      fontFamily: editingObj.fontFamily || "Sora",
      fontWeight: editingObj.bold ? "bold" : "normal",
      fontStyle: editingObj.italic ? "italic" : "normal",
      color: editingObj.fill,
      background: "transparent",
      border: "2px solid #7c3aed",
      borderRadius: 2,
      padding: 0,
      margin: 0,
      outline: "none",
      resize: "none",
      lineHeight: 1.25,
      zIndex: 1000,
      overflow: "hidden",
    };
  }

  return (
    <div ref={workspaceRef} className="flex-1 overflow-auto canvas-workspace">
      <div className="min-h-full flex items-center justify-center p-8">
        <div style={{ position: "relative", lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            data-ocid="canvas.canvas_target"
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              width: canvasSize.width * zoom,
              height: canvasSize.height * zoom,
              cursor,
              display: "block",
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onDoubleClick={onDoubleClick}
          />
          {editingObj && (
            <textarea
              ref={textareaRef}
              style={textAreaStyle}
              value={textValue}
              onChange={(e) => {
                setTextValue(e.target.value);
                updateObjects([editingTextId!], { text: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") commitTextEdit();
              }}
              onBlur={commitTextEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
