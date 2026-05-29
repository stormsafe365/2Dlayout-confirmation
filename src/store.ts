import { create } from "zustand";
import type {
  DimDir, Density, Mode, Opening, OpeningTypeKey, WallKey, DocInfo,
  LegType, TrussOC, Gauge,
} from "./types";
import { TYPES, DEFAULT_HEX } from "./constants";
import { clamp } from "./format";
import { wallLen } from "./geometry";
import { autoLeg, autoTrussOC, trussOCAllowed } from "./framing";

interface State {
  /* building */
  width: number;
  length: number;
  eave: number;
  wind: number;
  pitch: string;

  /* framing */
  legType: LegType;
  legAuto: boolean;   // follow the height/width rule
  trussOC: TrussOC;
  trussAuto: boolean; // follow the width rule
  gauge: Gauge;
  showTrusses: boolean;

  /* openings */
  openings: Opening[];
  selId: number | null;
  nextId: number;

  /* doc */
  doc: DocInfo;
  notes: string;

  /* visual */
  mode: Mode;
  dir: DimDir;
  showDims: boolean;
  blueprint: boolean;
  density: Density;
  accent: string;
  typeColors: Record<OpeningTypeKey, string>;
  tweaksMin: boolean;

  /* actions */
  setBuilding: (b: Partial<Pick<State, "width" | "length" | "eave" | "wind" | "pitch">>) => void;
  setLeg: (t: LegType | "auto") => void;
  setTrussOC: (oc: TrussOC | "auto") => void;
  setGauge: (g: Gauge) => void;
  toggleTrusses: () => void;
  setDoc: (patch: Partial<DocInfo>) => void;
  setNotes: (s: string) => void;
  add: (type: OpeningTypeKey, wall?: WallKey, offset?: number) => Opening;
  remove: (id: number) => void;
  update: (id: number, patch: Partial<Opening>) => void;
  select: (id: number | null) => void;
  setMode: (m: Mode) => void;
  setDir: (d: DimDir) => void;
  toggleDims: () => void;
  toggleBlueprint: () => void;
  setDensity: (d: Density) => void;
  setAccent: (hex: string) => void;
  setTypeColor: (k: OpeningTypeKey, hex: string) => void;
  resetTypeColors: () => void;
  toggleTweaks: () => void;
  reset: () => void;
}

function seedOpenings(): Opening[] {
  const list: Opening[] = [];
  let id = 1;
  const add = (type: OpeningTypeKey, wall: WallKey, o: number, w?: number, h?: number) => {
    const t = TYPES[type];
    list.push({
      id: id++,
      type,
      wall,
      w: w ?? t.w,
      h: h ?? t.h,
      o,
    });
  };
  add("rollup", "front", 6.6667);
  add("rollup", "front", 23.3333);
  add("walk", "right", 3.5);
  add("window", "back", 17, 6, 6);
  add("window", "left", 35);
  add("window", "left", 12);
  return list;
}

const useStore = create<State>((set, get) => ({
  width: 40,
  length: 50,
  eave: 16,
  wind: 150,
  pitch: "3:12",

  legType: autoLeg(16, 40),
  legAuto: true,
  trussOC: autoTrussOC(40),
  trussAuto: true,
  gauge: 14,
  showTrusses: false,

  openings: seedOpenings(),
  selId: null,
  nextId: 7,

  doc: { customer: "", address: "", phone: "", quote: "", rep: "" },
  notes: "",

  mode: "builder",
  dir: "engineering",
  showDims: true,
  blueprint: false,
  density: "regular",
  accent: "#22d3c8",
  typeColors: { ...DEFAULT_HEX },
  tweaksMin: false,

  setBuilding: (b) =>
    set((s) => {
      const next = { ...s, ...b };
      // clamp opening offsets/widths against new wall lengths/eave
      next.openings = s.openings.map((o) => {
        const wl = wallLen(o.wall, next.width, next.length);
        const w = Math.min(o.w, wl);
        const h = Math.min(o.h, next.eave);
        const off = clamp(o.o, 0, wl - w);
        return { ...o, w, h, o: off };
      });
      // re-derive framing where the user hasn't overridden it
      if (next.legAuto) next.legType = autoLeg(next.eave, next.width);
      if (next.trussAuto) next.trussOC = autoTrussOC(next.width);
      // 5' OC is never valid past 24' wide — snap down even if overridden
      if (next.width > 24 && next.trussOC === 5) next.trussOC = 4;
      return next;
    }),

  setLeg: (t) =>
    set((s) =>
      t === "auto"
        ? { legAuto: true, legType: autoLeg(s.eave, s.width) }
        : { legAuto: false, legType: t },
    ),

  setTrussOC: (oc) =>
    set((s) => {
      if (oc === "auto") return { trussAuto: true, trussOC: autoTrussOC(s.width) };
      const allowed = trussOCAllowed(s.width);
      return { trussAuto: false, trussOC: allowed.includes(oc) ? oc : allowed[0] };
    }),

  setGauge: (g) => set({ gauge: g }),
  toggleTrusses: () => set((s) => ({ showTrusses: !s.showTrusses })),

  setDoc: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),
  setNotes: (s) => set({ notes: s }),

  add: (type, wall = "front", offset = 0) => {
    const t = TYPES[type];
    const s = get();
    const wl = wallLen(wall, s.width, s.length);
    const w = Math.min(t.w, wl);
    const op: Opening = {
      id: s.nextId,
      type,
      wall,
      w,
      h: Math.min(t.h, s.eave),
      o: clamp(offset, 0, wl - w),
    };
    set((p) => ({
      openings: [...p.openings, op],
      selId: op.id,
      nextId: p.nextId + 1,
    }));
    return op;
  },

  remove: (id) =>
    set((s) => ({
      openings: s.openings.filter((o) => o.id !== id),
      selId: s.selId === id ? null : s.selId,
    })),

  update: (id, patch) =>
    set((s) => ({
      openings: s.openings.map((o) => {
        if (o.id !== id) return o;
        const merged: Opening = { ...o, ...patch };
        const wl = wallLen(merged.wall, s.width, s.length);
        merged.w = clamp(merged.w, 0.5, wl);
        merged.h = clamp(merged.h, 0.5, s.eave);
        merged.o = clamp(merged.o, 0, wl - merged.w);
        return merged;
      }),
    })),

  select: (id) => set({ selId: id }),
  setMode: (m) => set({ mode: m }),
  setDir: (d) => set({ dir: d }),
  toggleDims: () => set((s) => ({ showDims: !s.showDims })),
  toggleBlueprint: () => set((s) => ({ blueprint: !s.blueprint })),
  setDensity: (d) => set({ density: d }),
  setAccent: (hex) => set({ accent: hex }),
  setTypeColor: (k, hex) =>
    set((s) => ({ typeColors: { ...s.typeColors, [k]: hex } })),
  resetTypeColors: () => set({ typeColors: { ...DEFAULT_HEX } }),
  toggleTweaks: () => set((s) => ({ tweaksMin: !s.tweaksMin })),
  reset: () =>
    set({
      width: 40, length: 50, eave: 16, wind: 150, pitch: "3:12",
      legType: autoLeg(16, 40), legAuto: true,
      trussOC: autoTrussOC(40), trussAuto: true,
      gauge: 14, showTrusses: false,
      openings: seedOpenings(),
      nextId: 7,
      selId: null,
      notes: "",
      doc: { customer: "", address: "", phone: "", quote: "", rep: "" },
    }),
}));

export default useStore;
