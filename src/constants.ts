import type { OpeningTypeDef, OpeningTypeKey, WallDef, WallKey } from "./types";

export const TYPES: Record<OpeningTypeKey, OpeningTypeDef> = {
  rollup:  { label: "Roll-Up Door",     abbr: "RU",  hex: "#e8552a", w: 10, h: 10,     dashed: false },
  walk:    { label: "Walk Door",        abbr: "WD",  hex: "#15a08f", w: 3,  h: 6.6667, dashed: false },
  dwalk:   { label: "Double Walk Door", abbr: "DWD", hex: "#0e7c70", w: 6,  h: 6.6667, dashed: false },
  window:  { label: "Window",           abbr: "WIN", hex: "#27466b", w: 3,  h: 4,      dashed: false },
  sliding: { label: "Sliding Door",     abbr: "SL",  hex: "#2f7fbf", w: 12, h: 8,      dashed: false },
  framed:  { label: "Framed Opening",   abbr: "FO",  hex: "#64748b", w: 12, h: 12,     dashed: true  },
  custom:  { label: "Custom Frame Out", abbr: "CFO", hex: "#475569", w: 10, h: 10,     dashed: true  },
};

export const DEFAULT_HEX: Record<OpeningTypeKey, string> = Object.fromEntries(
  (Object.entries(TYPES) as [OpeningTypeKey, OpeningTypeDef][]).map(([k, v]) => [k, v.hex])
) as Record<OpeningTypeKey, string>;

export const WALLS: Record<WallKey, WallDef> = {
  front: { label: "Front", ref: "Left" },
  back:  { label: "Back",  ref: "Left" },
  left:  { label: "Left",  ref: "Front" },
  right: { label: "Right", ref: "Front" },
};

export const ACCENTS: [string, string][] = [
  ["#22d3c8", "Teal"],
  ["#1ab5ab", "Deep Teal"],
  ["#e8552a", "Orange"],
  ["#2f9e6f", "Green"],
];
