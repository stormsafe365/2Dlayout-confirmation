export type OpeningTypeKey =
  | "rollup"
  | "walk"
  | "dwalk"
  | "window"
  | "sliding"
  | "framed"
  | "custom";

export type WallKey = "front" | "back" | "left" | "right";

export interface OpeningTypeDef {
  label: string;
  abbr: string;
  hex: string;
  w: number; // default width in feet
  h: number; // default height in feet
  dashed: boolean;
}

export interface WallDef {
  label: string;
  ref: string; // reference corner for offset
}

export interface Opening {
  id: number;
  type: OpeningTypeKey;
  wall: WallKey;
  w: number;
  h: number;
  o: number; // offset from reference corner, in feet
}

export interface DocInfo {
  customer: string;
  address: string;
  phone: string;
  quote: string;
  rep: string;
}

export type DimDir = "engineering" | "architectural";
export type Density = "compact" | "regular" | "comfy";
export type Mode = "builder" | "approval";

/* framing */
export type LegType = "single" | "double" | "ladder";
export type TrussOC = 2 | 4 | 5; // truss spacing, feet on-center
export type Gauge = 14 | 12;
