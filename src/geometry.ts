import type { Opening, WallKey } from "./types";

/* ============================================================
   Diagram geometry — converts opening data to SVG coordinates.
   Landscape layout: building LENGTH runs horizontally, WIDTH
   vertically. So Left/Right walls (= length) sit on the top
   and bottom edges, Front/Back walls (= width) sit on the
   left and right edges.
   ============================================================ */

export const BARH = 14;
export const TAG_OFF = 30;
export const LBL_OFF = 49;

export interface Geo {
  oX: number;
  oY: number;
  DW: number;
  DH: number;
  scale: number;
}

export interface BarGeom {
  bx: number; by: number; bw: number; bh: number;
  tcx: number; tcy: number;
  lx: number; ly: number;
  la: "start" | "middle" | "end";
  horiz: boolean;
}

export function wallLen(wall: WallKey, width: number, length: number): number {
  return wall === "front" || wall === "back" ? width : length;
}

export function computeGeo(width: number, length: number, marg = 110, maxBox = 760): Geo {
  // The plan must be readable, so we'd like the building drawn
  // as large as the inner area allows. maxBox is the maximum
  // dimension of the longer side, in px.
  const scale = Math.max(4, Math.min(20, Math.min(maxBox / Math.max(width, length), 30)));
  const DW = length * scale;
  const DH = width * scale;
  return { oX: marg, oY: marg, DW, DH, scale };
}

export function barGeom(op: Opening, geo: Geo): BarGeom {
  const { oX, oY, DW, DH, scale } = geo;
  const len = op.w * scale;
  const x0 = oX + op.o * scale;
  const y0 = oY + op.o * scale;
  const mid = (op.o + op.w / 2) * scale;

  if (op.wall === "left") {
    // top horizontal edge
    const eY = oY;
    return {
      bx: x0, by: eY - BARH / 2, bw: len, bh: BARH,
      tcx: oX + mid, tcy: eY - TAG_OFF,
      lx: oX + mid, ly: eY - LBL_OFF + 3,
      la: "middle", horiz: true,
    };
  }
  if (op.wall === "right") {
    // bottom horizontal edge
    const eY = oY + DH;
    return {
      bx: x0, by: eY - BARH / 2, bw: len, bh: BARH,
      tcx: oX + mid, tcy: eY + TAG_OFF,
      lx: oX + mid, ly: eY + LBL_OFF,
      la: "middle", horiz: true,
    };
  }
  if (op.wall === "front") {
    // left vertical edge
    const eX = oX;
    return {
      bx: eX - BARH / 2, by: y0, bw: BARH, bh: len,
      tcx: eX - TAG_OFF, tcy: oY + mid,
      lx: eX - LBL_OFF, ly: oY + mid + 3,
      la: "end", horiz: false,
    };
  }
  // back: right vertical edge
  const eX = oX + DW;
  return {
    bx: eX - BARH / 2, by: y0, bw: BARH, bh: len,
    tcx: eX + TAG_OFF, tcy: oY + mid,
    lx: eX + LBL_OFF, ly: oY + mid + 3,
    la: "start", horiz: false,
  };
}

/* Dimension chain — list of segments along one wall, marking
   gap vs. opening segments so we can label each segment. */
export interface ChainSeg {
  a: number;
  b: number;
  op?: boolean;
}

export function dimChain(
  wall: WallKey,
  openings: Opening[],
  width: number,
  length: number,
): ChainSeg[] {
  const L = wallLen(wall, width, length);
  const ops = openings.filter((o) => o.wall === wall).slice().sort((a, b) => a.o - b.o);
  const segs: ChainSeg[] = [];
  let c = 0;
  ops.forEach((o) => {
    if (o.o - c > 0.01) segs.push({ a: c, b: o.o });
    segs.push({ a: o.o, b: o.o + o.w, op: true });
    c = o.o + o.w;
  });
  if (L - c > 0.01) segs.push({ a: c, b: L });
  return segs;
}
