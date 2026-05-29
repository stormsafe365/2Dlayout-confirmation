import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import useStore from "../store";
import { TYPES } from "../constants";
import { clamp, ft, INCH, round } from "../format";
import {
  BARH, barGeom, computeGeo, dimChain, wallLen,
  type Geo,
} from "../geometry";
import type { Opening, WallKey } from "../types";

interface Palette {
  grid: string;
  footLight: string; footHeavy: string;
  centerMain: string; centerSub: string; wall: string;
  dimLine: string; dimExt: string;
  dimText: string; dimTextOp: string;
  tagFill: string; tileLbl: string; hollow: string;
}

function getPalette(blueprint: boolean): Palette {
  return blueprint
    ? {
        grid: "rgba(135,170,205,.16)",
        footLight: "#3f5d7d", footHeavy: "#dbe7f3",
        centerMain: "#eaf2fb", centerSub: "#8aa4c0", wall: "#dbe7f3",
        dimLine: "#7d99b6", dimExt: "rgba(140,170,200,.32)",
        dimText: "#bcd0e4", dimTextOp: "#eaf2fb",
        tagFill: "#0a1b2d", tileLbl: "#9fb4ca", hollow: "#0a1b2d",
      }
    : {
        grid: "#eef2f7",
        footLight: "#b9c6d4", footHeavy: "#12283f",
        centerMain: "#12283f", centerSub: "#7d8ca0", wall: "#12283f",
        dimLine: "#41566e", dimExt: "#cfd9e3",
        dimText: "#41566e", dimTextOp: "#12283f",
        tagFill: "#fff", tileLbl: "#41566e", hollow: "#fff",
      };
}

export default function Plan() {
  const width = useStore((s) => s.width);
  const length = useStore((s) => s.length);
  const eave = useStore((s) => s.eave);
  const openings = useStore((s) => s.openings);
  const selId = useStore((s) => s.selId);
  const select = useStore((s) => s.select);
  const update = useStore((s) => s.update);
  const dir = useStore((s) => s.dir);
  const showDims = useStore((s) => s.showDims);
  const blueprint = useStore((s) => s.blueprint);
  const typeColors = useStore((s) => s.typeColors);

  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: number; moved: boolean } | null>(null);

  const geo = useMemo(() => computeGeo(width, length), [width, length]);
  const palette = getPalette(blueprint);
  const totW = geo.DW + geo.oX * 2;
  const totH = geo.DH + geo.oY * 2;

  function svgPoint(e: React.PointerEvent | PointerEvent) {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  }

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const op = openings.find((o) => o.id === drag.id);
      if (!op) return;
      const p = svgPoint(e);
      const wl = wallLen(op.wall, width, length);
      let o =
        op.wall === "left" || op.wall === "right"
          ? (p.x - geo.oX) / geo.scale - op.w / 2
          : (p.y - geo.oY) / geo.scale - op.w / 2;
      o = clamp(round(o, INCH), 0, wl - op.w);
      if (o !== op.o) {
        update(op.id, { o });
        setDrag((d) => (d ? { ...d, moved: true } : d));
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, openings, width, length, geo.oX, geo.oY, geo.scale, update]);

  return (
    <div className={`diagram ${blueprint ? "blueprint" : ""}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totW} ${totH}`}
        role="img"
        aria-label="Opening plan top view"
        style={{ userSelect: "none" }}
      >
        <defs>
          <pattern id="gridpat" width={geo.scale} height={geo.scale} patternUnits="userSpaceOnUse">
            <path
              d={`M ${geo.scale} 0 L 0 0 0 ${geo.scale}`}
              fill="none"
              stroke={palette.grid}
              strokeWidth={1}
            />
          </pattern>
        </defs>

        {/* footprint */}
        <rect
          x={geo.oX} y={geo.oY} width={geo.DW} height={geo.DH}
          fill="url(#gridpat)" stroke={palette.footLight} strokeWidth={1}
        />
        <rect
          x={geo.oX} y={geo.oY} width={geo.DW} height={geo.DH}
          fill="none" stroke={palette.footHeavy} strokeWidth={2.5}
        />

        {/* center label */}
        <text
          x={geo.oX + geo.DW / 2}
          y={geo.oY + geo.DH / 2 - 6}
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize={16}
          fill={palette.centerMain}
        >
          {width}&apos; W × {length}&apos; L
        </text>
        <text
          x={geo.oX + geo.DW / 2}
          y={geo.oY + geo.DH / 2 + 14}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize={11}
          fill={palette.centerSub}
        >
          {eave}&apos; EAVE · PLAN VIEW
        </text>

        {/* wall labels */}
        <WallLabel x={geo.oX + geo.DW / 2} y={geo.oY - 84}        text={`LEFT · ${ft(length)}`}   fill={palette.wall} />
        <WallLabel x={geo.oX + geo.DW / 2} y={geo.oY + geo.DH + 94} text={`RIGHT · ${ft(length)}`}  fill={palette.wall} />
        <WallLabel x={geo.oX - 94}         y={geo.oY + geo.DH / 2} text={`FRONT · ${ft(width)}`}   fill={palette.wall} rot={-90} />
        <WallLabel x={geo.oX + geo.DW + 94} y={geo.oY + geo.DH / 2} text={`BACK · ${ft(width)}`}   fill={palette.wall} rot={90} />

        {/* dimensions */}
        {showDims && (
          <>
            <DimHoriz wall="left"  edgeY={geo.oY}          dir={-1} geo={geo} openings={openings} palette={palette} dirMode={dir} width={width} length={length} />
            <DimHoriz wall="right" edgeY={geo.oY + geo.DH} dir={+1} geo={geo} openings={openings} palette={palette} dirMode={dir} width={width} length={length} />
            <DimVert  wall="front" edgeX={geo.oX}          dir={-1} geo={geo} openings={openings} palette={palette} dirMode={dir} width={width} length={length} />
            <DimVert  wall="back"  edgeX={geo.oX + geo.DW} dir={+1} geo={geo} openings={openings} palette={palette} dirMode={dir} width={width} length={length} />
          </>
        )}

        {/* openings */}
        <AnimatePresence initial={false}>
          {openings.map((op, i) => (
            <Tile
              key={op.id}
              op={op}
              i={i}
              geo={geo}
              palette={palette}
              selected={op.id === selId}
              color={typeColors[op.type]}
              reduceMotion={!!reduceMotion}
              onPointerDown={(e) => {
                select(op.id);
                setDrag({ id: op.id, moved: false });
                e.preventDefault();
              }}
              dragging={drag?.id === op.id}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  );
}

function WallLabel({
  x, y, text, fill, rot,
}: {
  x: number;
  y: number;
  text: string;
  fill: string;
  rot?: number;
}) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      fontFamily="Orbitron, sans-serif"
      fontWeight={700}
      fontSize={12}
      letterSpacing="2"
      fill={fill}
      transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
    >
      {text}
    </text>
  );
}

function Tile({
  op, i, geo, palette, selected, color, reduceMotion, onPointerDown, dragging,
}: {
  op: Opening;
  i: number;
  geo: Geo;
  palette: Palette;
  selected: boolean;
  color: string;
  reduceMotion: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  dragging: boolean;
}) {
  const t = TYPES[op.type];
  const g = barGeom(op, geo);
  const fill = t.dashed ? palette.hollow : color;
  const fo = t.dashed ? 1 : 0.92;

  return (
    <motion.g
      className={`otile ${selected ? "sel" : ""} ${dragging ? "dragging" : ""}`}
      data-id={op.id}
      onPointerDown={onPointerDown}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      transition={{
        type: "spring",
        duration: 0.45,
        bounce: 0.22,
        delay: reduceMotion ? 0 : i * 0.04,
      }}
      style={{ transformOrigin: `${g.tcx}px ${g.tcy}px`, cursor: "grab" }}
    >
      {/* invisible hit area, larger than the bar */}
      <rect
        className="ohit"
        x={g.bx - (g.horiz ? 0 : 4)}
        y={g.by - (g.horiz ? 4 : 0)}
        width={g.bw + (g.horiz ? 0 : 8)}
        height={g.bh + (g.horiz ? 8 : 0)}
        fill="transparent"
      />
      {/* selection halo — static, no infinite loop */}
      {selected && (
        <rect
          x={g.bx - 5}
          y={g.by - 5}
          width={g.bw + 10}
          height={g.bh + 10}
          rx={4}
          fill="none"
          stroke={color}
          strokeOpacity={0.45}
          strokeWidth={2}
        />
      )}
      <rect
        x={g.bx}
        y={g.by}
        width={g.bw}
        height={g.bh}
        rx={2}
        fill={fill}
        fillOpacity={fo}
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeDasharray={t.dashed ? "5 3" : undefined}
      />
      <circle
        cx={g.tcx}
        cy={g.tcy}
        r={10}
        fill={palette.tagFill}
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={g.tcx}
        y={g.tcy + 4}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight={800}
        fontSize={11.5}
        fill={color}
      >
        {i + 1}
      </text>
    </motion.g>
  );
}

/* ── dimension chain renderers ── */

function tickHoriz(x: number, y: number, mode: "engineering" | "architectural", dir: number, color: string) {
  if (mode === "architectural") {
    const d = 5;
    return (
      <line
        x1={x - d} y1={y + (dir > 0 ? -d : d)}
        x2={x + d} y2={y + (dir > 0 ? d : -d)}
        stroke={color} strokeWidth={1.3}
      />
    );
  }
  const d = 4;
  return <line x1={x} y1={y - d} x2={x} y2={y + d} stroke={color} strokeWidth={1.3} />;
}

function tickVert(x: number, y: number, mode: "engineering" | "architectural", dir: number, color: string) {
  if (mode === "architectural") {
    const d = 5;
    return (
      <line
        x1={x + (dir > 0 ? -d : d)} y1={y - d}
        x2={x + (dir > 0 ? d : -d)} y2={y + d}
        stroke={color} strokeWidth={1.3}
      />
    );
  }
  const d = 4;
  return <line x1={x - d} y1={y} x2={x + d} y2={y} stroke={color} strokeWidth={1.3} />;
}

interface DimProps {
  geo: Geo;
  openings: Opening[];
  palette: Palette;
  dirMode: "engineering" | "architectural";
  width: number;
  length: number;
}

function DimHoriz({
  wall, edgeY, dir, geo, openings, palette, dirMode, width, length,
}: DimProps & { wall: WallKey; edgeY: number; dir: number }) {
  const DIM = 62;
  const dimY = edgeY + dir * DIM;
  const segs = dimChain(wall, openings, width, length);
  if (!segs.length) return null;
  const xOf = (f: number) => geo.oX + f * geo.scale;
  const bset = new Set([0]);
  segs.forEach((g) => { bset.add(g.a); bset.add(g.b); });

  return (
    <g className="dims">
      {[...bset].map((f) => {
        const x = xOf(f);
        return (
          <line
            key={`ext-${f}`}
            x1={x} y1={edgeY + dir * (BARH / 2 + 3)}
            x2={x} y2={dimY}
            stroke={palette.dimExt} strokeWidth={1}
          />
        );
      })}
      <line
        x1={xOf(segs[0].a)} y1={dimY}
        x2={xOf(segs[segs.length - 1].b)} y2={dimY}
        stroke={palette.dimLine} strokeWidth={1.1}
      />
      {segs.map((g, i) => (
        <g key={i}>
          {tickHoriz(xOf(g.a), dimY, dirMode, dir, palette.dimLine)}
          {tickHoriz(xOf(g.b), dimY, dirMode, dir, palette.dimLine)}
          <text
            x={xOf((g.a + g.b) / 2)}
            y={dimY - (dir > 0 ? -13 : 5)}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize={10.5}
            fontWeight={g.op ? 700 : 500}
            fill={g.op ? palette.dimTextOp : palette.dimText}
          >
            {ft(g.b - g.a)}
          </text>
        </g>
      ))}
    </g>
  );
}

function DimVert({
  wall, edgeX, dir, geo, openings, palette, dirMode, width, length,
}: DimProps & { wall: WallKey; edgeX: number; dir: number }) {
  const DIM = 62;
  const dimX = edgeX + dir * DIM;
  const segs = dimChain(wall, openings, width, length);
  if (!segs.length) return null;
  const yOf = (f: number) => geo.oY + f * geo.scale;
  const bset = new Set([0]);
  segs.forEach((g) => { bset.add(g.a); bset.add(g.b); });

  return (
    <g className="dims">
      {[...bset].map((f) => {
        const y = yOf(f);
        return (
          <line
            key={`ext-${f}`}
            x1={edgeX + dir * (BARH / 2 + 3)} y1={y}
            x2={dimX} y2={y}
            stroke={palette.dimExt} strokeWidth={1}
          />
        );
      })}
      <line
        x1={dimX} y1={yOf(segs[0].a)}
        x2={dimX} y2={yOf(segs[segs.length - 1].b)}
        stroke={palette.dimLine} strokeWidth={1.1}
      />
      {segs.map((g, i) => {
        const my = yOf((g.a + g.b) / 2);
        const tx = dimX + (dir > 0 ? 13 : -13);
        return (
          <g key={i}>
            {tickVert(dimX, yOf(g.a), dirMode, dir, palette.dimLine)}
            {tickVert(dimX, yOf(g.b), dirMode, dir, palette.dimLine)}
            <text
              x={tx}
              y={my + 3}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize={10.5}
              fontWeight={g.op ? 700 : 500}
              fill={g.op ? palette.dimTextOp : palette.dimText}
              transform={`rotate(${dir > 0 ? 90 : -90} ${tx} ${my})`}
            >
              {ft(g.b - g.a)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
