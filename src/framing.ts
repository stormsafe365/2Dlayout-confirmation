import type { LegType, Opening, TrussOC } from "./types";

/* ============================================================
   Framing rules — trusses, legs, and gauge.

   Trusses fall on the EAVE walls (the long / Left + Right walls,
   which run along the building LENGTH) and are spaced along that
   length on-center. Spacing depends on width, with upgrade paths.

   Leg type is driven by wall (eave) height, with a wide-span
   override: any building 32' wide or more always uses ladder legs.
   ============================================================ */

/** Framing-tube dimensions per gauge (square steel tube). */
export const GAUGE_TUBE: Record<14 | 12, string> = {
  14: "2½″ × 2½″",
  12: "2¼″ × 2¼″",
};

export const LEG_INFO: Record<LegType, { label: string; range: string; desc: string }> = {
  single: { label: "Single Legs", range: "up to 12′", desc: "A single vertical steel tube column." },
  double: { label: "Double Legs", range: "13′–16′",   desc: "Two columns welded or bolted side-by-side." },
  ladder: { label: "Ladder Legs", range: "17′ & up",  desc: "Two parallel posts with horizontal step bracing." },
};

/** Recommended leg type from eave height + width (wide span forces ladder). */
export function autoLeg(eave: number, width: number): LegType {
  if (width >= 32) return "ladder"; // wide span — ladder legs regardless of wall height
  if (eave >= 17) return "ladder";
  if (eave >= 13) return "double";
  return "single";
}

/** Recommended truss spacing from width. 5' OC only on narrow (≤24') buildings. */
export function autoTrussOC(width: number): TrussOC {
  return width <= 24 ? 5 : 4;
}

/** Truss spacings the customer may pick for this width (widest → tightest). */
export function trussOCAllowed(width: number): TrussOC[] {
  return width <= 24 ? [5, 4, 2] : [4, 2];
}

/** Truss centerlines along the building LENGTH, in feet (incl. both gable ends). */
export function trussPositions(length: number, oc: TrussOC): number[] {
  const pos: number[] = [];
  for (let p = 0; p < length - 1e-6; p += oc) pos.push(Math.round(p * 1e4) / 1e4);
  pos.push(length); // closing gable-end truss
  return pos;
}

export interface TrussAnalysis {
  positions: number[];
  hitOpenings: Set<number>; // opening ids a truss passes through
  hitTrusses: Set<number>;  // indices into `positions` that conflict
}

/**
 * Find truss/opening conflicts. Only eave-wall openings (Left/Right walls,
 * which run along the length) can be crossed by a truss column. An opening
 * spanning [o, o+w] conflicts with any truss whose centerline falls strictly
 * inside that span (touching an edge is fine).
 */
export function analyzeTrusses(openings: Opening[], length: number, oc: TrussOC): TrussAnalysis {
  const positions = trussPositions(length, oc);
  const hitOpenings = new Set<number>();
  const hitTrusses = new Set<number>();
  const EPS = 0.02; // ~¼" tolerance so a truss sitting on the jamb isn't flagged
  openings.forEach((o) => {
    if (o.wall !== "left" && o.wall !== "right") return;
    const a = o.o;
    const b = o.o + o.w;
    positions.forEach((p, idx) => {
      if (p > a + EPS && p < b - EPS) {
        hitOpenings.add(o.id);
        hitTrusses.add(idx);
      }
    });
  });
  return { positions, hitOpenings, hitTrusses };
}
