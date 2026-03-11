export type ToolType =
  | "select"
  | "rect"
  | "circle"
  | "text"
  | "line"
  | "arrow"
  | "image";

export interface CanvasObject {
  id: string;
  type: "rect" | "circle" | "text" | "line" | "arrow" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  // text-specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  // image-specific
  imageUrl?: string;
  // line/arrow end point
  x2?: number;
  y2?: number;
  // display name
  name?: string;
}

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { name: "Banner (1200×400)", width: 1200, height: 400 },
  { name: "Instagram (1080×1080)", width: 1080, height: 1080 },
  { name: "Twitter (1200×675)", width: 1200, height: 675 },
  { name: "Facebook Cover (820×312)", width: 820, height: 312 },
  { name: "A4 Portrait (794×1123)", width: 794, height: 1123 },
  { name: "Custom", width: 800, height: 600 },
];

export interface CanvasBackground {
  type: "solid" | "gradient";
  color: string;
  gradientEnd: string;
  gradientAngle: number;
}

export const DEFAULT_BACKGROUND: CanvasBackground = {
  type: "solid",
  color: "#ffffff",
  gradientEnd: "#a855f7",
  gradientAngle: 135,
};
