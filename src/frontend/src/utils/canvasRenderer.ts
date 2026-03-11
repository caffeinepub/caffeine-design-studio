import type { CanvasBackground, CanvasObject } from "../types/canvas";

export const HANDLE_SIZE = 8;
export const ROTATION_HANDLE_OFFSET = 30;

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: CanvasBackground,
) {
  if (bg.type === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  } else {
    const angle = (bg.gradientAngle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const len = Math.sqrt(width * width + height * height) / 2;
    const x0 = cx - Math.cos(angle) * len;
    const y0 = cy - Math.sin(angle) * len;
    const x1 = cx + Math.cos(angle) * len;
    const y1 = cy + Math.sin(angle) * len;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, bg.color);
    grad.addColorStop(1, bg.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

export function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject,
  imageCache: Map<string, HTMLImageElement>,
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, obj.opacity));

  if (obj.type === "line" || obj.type === "arrow") {
    drawLineObject(ctx, obj);
    ctx.restore();
    return;
  }

  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;

  if (obj.rotation !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  ctx.fillStyle = obj.fill || "transparent";
  ctx.strokeStyle = obj.stroke || "transparent";
  ctx.lineWidth = obj.strokeWidth || 0;

  if (obj.type === "rect") {
    if (obj.fill && obj.fill !== "transparent") {
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
    if (
      (obj.strokeWidth || 0) > 0 &&
      obj.stroke &&
      obj.stroke !== "transparent"
    ) {
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }
  } else if (obj.type === "circle") {
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      Math.abs(obj.width / 2),
      Math.abs(obj.height / 2),
      0,
      0,
      Math.PI * 2,
    );
    if (obj.fill && obj.fill !== "transparent") ctx.fill();
    if (
      (obj.strokeWidth || 0) > 0 &&
      obj.stroke &&
      obj.stroke !== "transparent"
    )
      ctx.stroke();
  } else if (obj.type === "text") {
    const fontSize = obj.fontSize || 24;
    const fontFamily = obj.fontFamily || "Sora, sans-serif";
    const weight = obj.bold ? "bold" : "normal";
    const style = obj.italic ? "italic" : "normal";
    ctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = obj.fill || "#000000";
    ctx.textBaseline = "top";
    const lines = (obj.text || "").split("\n");
    const lineH = fontSize * 1.25;
    lines.forEach((line, i) => {
      ctx.fillText(line, obj.x, obj.y + i * lineH);
      if (obj.underline) {
        const m = ctx.measureText(line);
        ctx.fillRect(obj.x, obj.y + i * lineH + fontSize + 2, m.width, 1.5);
      }
    });
  } else if (obj.type === "image") {
    if (obj.imageUrl && imageCache.has(obj.imageUrl)) {
      const img = imageCache.get(obj.imageUrl)!;
      ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
    } else {
      ctx.fillStyle = "#2d2d3d";
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      ctx.fillStyle = "#666";
      ctx.font = "13px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading image...", cx, cy);
      ctx.textAlign = "left";
    }
  }

  ctx.restore();
}

function drawLineObject(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
  const x2 = obj.x2 ?? obj.x + obj.width;
  const y2 = obj.y2 ?? obj.y + obj.height;

  ctx.strokeStyle = obj.stroke || obj.fill || "#000000";
  ctx.lineWidth = obj.strokeWidth || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  if (obj.type === "arrow") {
    const angle = Math.atan2(y2 - obj.y, x2 - obj.x);
    const headLen = Math.min(24, Math.max(12, (obj.strokeWidth || 2) * 5));
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
  }
}

export function getHandlePositions(obj: CanvasObject): [number, number][] {
  if (obj.type === "line" || obj.type === "arrow") {
    const x2 = obj.x2 ?? obj.x + obj.width;
    const y2 = obj.y2 ?? obj.y + obj.height;
    return [
      [obj.x, obj.y],
      [x2, y2],
    ];
  }
  const { x, y, width, height } = obj;
  return [
    [x, y],
    [x + width / 2, y],
    [x + width, y],
    [x, y + height / 2],
    [x + width, y + height / 2],
    [x, y + height],
    [x + width / 2, y + height],
    [x + width, y + height],
  ];
}

// Transform point to object-local coordinate space (undoes rotation)
export function toLocalPoint(
  px: number,
  py: number,
  cx: number,
  cy: number,
  rotationDeg: number,
): [number, number] {
  const rad = (-rotationDeg * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return [
    cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  ];
}

export function isPointInObject(
  px: number,
  py: number,
  obj: CanvasObject,
): boolean {
  if (obj.type === "line" || obj.type === "arrow") {
    const x2 = obj.x2 ?? obj.x + obj.width;
    const y2 = obj.y2 ?? obj.y + obj.height;
    return (
      distToSegment(px, py, obj.x, obj.y, x2, y2) <=
      Math.max(8, (obj.strokeWidth || 2) + 4)
    );
  }

  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const [lx, ly] = toLocalPoint(px, py, cx, cy, obj.rotation);

  if (obj.type === "rect" || obj.type === "text" || obj.type === "image") {
    return (
      lx >= obj.x &&
      lx <= obj.x + obj.width &&
      ly >= obj.y &&
      ly <= obj.y + obj.height
    );
  }
  if (obj.type === "circle") {
    const rx = Math.abs(obj.width / 2);
    const ry = Math.abs(obj.height / 2);
    if (rx === 0 || ry === 0) return false;
    return ((lx - cx) / rx) ** 2 + ((ly - cy) / ry) ** 2 <= 1;
  }
  return false;
}

// Returns handle index 0-7 for resize, 8 for rotation, -1 for none
export function getHitHandle(
  px: number,
  py: number,
  obj: CanvasObject,
): number {
  if (obj.type === "line" || obj.type === "arrow") {
    const handles = getHandlePositions(obj);
    for (let i = 0; i < handles.length; i++) {
      const [hx, hy] = handles[i];
      if (Math.hypot(px - hx, py - hy) <= 8) return i;
    }
    return -1;
  }

  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const [lx, ly] = toLocalPoint(px, py, cx, cy, obj.rotation);

  // Check rotation handle (above TM in local space)
  const rotHX = obj.x + obj.width / 2;
  const rotHY = obj.y - ROTATION_HANDLE_OFFSET;
  if (Math.hypot(lx - rotHX, ly - rotHY) <= 10) return 8;

  const handles = getHandlePositions(obj);
  for (let i = 0; i < handles.length; i++) {
    const [hx, hy] = handles[i];
    if (Math.abs(lx - hx) <= 6 && Math.abs(ly - hy) <= 6) return i;
  }
  return -1;
}

export function applyResize(
  obj: CanvasObject,
  handleIndex: number,
  dx: number,
  dy: number,
): Partial<CanvasObject> {
  // For lines, handle 0 = start, handle 1 = end
  if (obj.type === "line" || obj.type === "arrow") {
    if (handleIndex === 0) {
      return { x: obj.x + dx, y: obj.y + dy };
    }
    const x2 = (obj.x2 ?? obj.x + obj.width) + dx;
    const y2 = (obj.y2 ?? obj.y + obj.height) + dy;
    return { x2, y2 };
  }

  let { x, y, width, height } = obj;
  switch (handleIndex) {
    case 0:
      x += dx;
      y += dy;
      width -= dx;
      height -= dy;
      break;
    case 1:
      y += dy;
      height -= dy;
      break;
    case 2:
      y += dy;
      width += dx;
      height -= dy;
      break;
    case 3:
      x += dx;
      width -= dx;
      break;
    case 4:
      width += dx;
      break;
    case 5:
      x += dx;
      width -= dx;
      height += dy;
      break;
    case 6:
      height += dy;
      break;
    case 7:
      width += dx;
      height += dy;
      break;
  }
  if (width < 5) {
    if ([0, 3, 5].includes(handleIndex)) x = obj.x + obj.width - 5;
    width = 5;
  }
  if (height < 5) {
    if ([0, 1, 2].includes(handleIndex)) y = obj.y + obj.height - 5;
    height = 5;
  }
  return { x, y, width, height };
}

export function normalizeObject(obj: CanvasObject): CanvasObject {
  if (obj.type === "line" || obj.type === "arrow") return obj;
  let { x, y, width, height } = obj;
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }
  if (width < 2) width = 2;
  if (height < 2) height = 2;
  return { ...obj, x, y, width, height };
}

export function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject,
) {
  ctx.save();

  if (obj.type === "line" || obj.type === "arrow") {
    const handles = getHandlePositions(obj);
    for (const [hx, hy] of handles) {
      ctx.fillStyle = "#7c3aed";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;

  ctx.translate(cx, cy);
  ctx.rotate((obj.rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  // Selection border
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(obj.x - 0.5, obj.y - 0.5, obj.width + 1, obj.height + 1);

  // Resize handles
  const handles = getHandlePositions(obj);
  for (const [hx, hy] of handles) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 1.5;
    ctx.fillRect(
      hx - HANDLE_SIZE / 2,
      hy - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
    );
    ctx.strokeRect(
      hx - HANDLE_SIZE / 2,
      hy - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
    );
  }

  // Rotation handle stem
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(obj.x + obj.width / 2, obj.y);
  ctx.lineTo(obj.x + obj.width / 2, obj.y - ROTATION_HANDLE_OFFSET);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rotation handle circle
  ctx.fillStyle = "#7c3aed";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(
    obj.x + obj.width / 2,
    obj.y - ROTATION_HANDLE_OFFSET,
    6,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function getObjectsInSelectionRect(
  objects: CanvasObject[],
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): string[] {
  const x1 = Math.min(rx, rx + rw);
  const x2 = Math.max(rx, rx + rw);
  const y1 = Math.min(ry, ry + rh);
  const y2 = Math.max(ry, ry + rh);
  return objects
    .filter((obj) => {
      if (obj.type === "line" || obj.type === "arrow") {
        const ex = obj.x2 ?? obj.x + obj.width;
        const ey = obj.y2 ?? obj.y + obj.height;
        return (
          Math.min(obj.x, ex) >= x1 &&
          Math.max(obj.x, ex) <= x2 &&
          Math.min(obj.y, ey) >= y1 &&
          Math.max(obj.y, ey) <= y2
        );
      }
      return (
        obj.x >= x1 &&
        obj.x + obj.width <= x2 &&
        obj.y >= y1 &&
        obj.y + obj.height <= y2
      );
    })
    .map((o) => o.id);
}

export const RESIZE_CURSORS = [
  "nwse-resize",
  "ns-resize",
  "nesw-resize",
  "ew-resize",
  "ew-resize",
  "nesw-resize",
  "ns-resize",
  "nwse-resize",
  "crosshair", // rotation
];
