import React, { useMemo, useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { X, Undo2, Eraser, Check, Plus } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

export type MeasureUnit = "m" | "ft";

interface MeasureToolProps {
  onClose: () => void;
  onAddItem: (description: string, quantity: number) => void;
}

const VIEW_W = 800;
const VIEW_H = 600;
const GRID = 40; // px per grid square
const CLOSE_RADIUS = GRID / 2; // tap this close to the first point to close the shape

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function MeasureTool({ onClose, onAddItem }: MeasureToolProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [closed, setClosed] = useState(false);
  const [scale, setScale] = useState(1); // real-world units per grid square
  const [unit, setUnit] = useState<MeasureUnit>("m");
  const [snap, setSnap] = useState(true);

  const pxToReal = (px: number) => (px / GRID) * scale;

  const segments = useMemo(() => {
    const segs: { from: Point; to: Point }[] = [];
    for (let i = 1; i < points.length; i++) {
      segs.push({ from: points[i - 1], to: points[i] });
    }
    if (closed && points.length >= 3) {
      segs.push({ from: points[points.length - 1], to: points[0] });
    }
    return segs;
  }, [points, closed]);

  const perimeter = segments.reduce((acc, s) => acc + pxToReal(dist(s.from, s.to)), 0);

  // Shoelace formula, converted from px² to real units²
  const area = useMemo(() => {
    if (!closed || points.length < 3) return null;
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      sum += a.x * b.y - b.x * a.y;
    }
    const pxArea = Math.abs(sum) / 2;
    return (pxArea / (GRID * GRID)) * scale * scale;
  }, [points, closed, scale]);

  const centroid = useMemo(() => {
    if (points.length === 0) return { x: 0, y: 0 };
    return {
      x: points.reduce((a, p) => a + p.x, 0) / points.length,
      y: points.reduce((a, p) => a + p.y, 0) / points.length,
    };
  }, [points]);

  const toViewBox = (e: React.PointerEvent): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (closed) return;
    let p = toViewBox(e);
    if (points.length >= 3 && dist(p, points[0]) < CLOSE_RADIUS) {
      setClosed(true);
      return;
    }
    if (snap) {
      const step = GRID / 2;
      p = { x: Math.round(p.x / step) * step, y: Math.round(p.y / step) * step };
    }
    setPoints([...points, p]);
  };

  const handleUndo = () => {
    if (closed) {
      setClosed(false);
    } else {
      setPoints(points.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPoints([]);
    setClosed(false);
  };

  const fmt = (n: number) => (Math.round(n * 100) / 100).toLocaleString();

  const handleAddArea = () => {
    if (area === null) return;
    onAddItem(`Measured area (${unit}²)`, Math.round(area * 100) / 100);
    onClose();
  };

  const handleAddLength = () => {
    if (perimeter <= 0) return;
    onAddItem(`Measured length (${unit})`, Math.round(perimeter * 100) / 100);
    onClose();
  };

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + (closed ? " Z" : "");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
        <h2 className="text-lg font-bold tracking-tight text-gray-900">Measure</h2>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Close measure tool">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scale & drawing controls */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 bg-gray-50 px-4 py-2 sm:px-6 text-sm">
        <label className="flex items-center gap-2 font-medium text-gray-700">
          1 square =
          <input
            type="number"
            min="0.01"
            step="0.5"
            value={scale}
            onChange={(e) => setScale(Math.max(0.01, Number(e.target.value) || 0.01))}
            className="w-20 h-9 rounded-lg border border-gray-300 bg-white px-2 text-center"
            aria-label="Scale: real-world size of one grid square"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as MeasureUnit)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-2 cursor-pointer"
            aria-label="Measurement unit"
          >
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} />
          Snap to grid
        </label>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={points.length === 0}>
            <Undo2 className="h-4 w-4 mr-1" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={points.length === 0}>
            <Eraser className="h-4 w-4 mr-1" /> Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setClosed(true)} disabled={closed || points.length < 3}>
            <Check className="h-4 w-4 mr-1" /> Close Shape
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden bg-white flex items-center justify-center p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="max-h-full w-full cursor-crosshair touch-none select-none border border-gray-200 rounded-xl"
          onPointerDown={handlePointerDown}
          data-testid="measure-canvas"
        >
          <defs>
            <pattern id="measure-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={VIEW_W} height={VIEW_H} fill="url(#measure-grid)" />

          {points.length > 0 && (
            <path
              d={pathD}
              fill={closed ? "rgba(59,130,246,0.12)" : "none"}
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          )}

          {/* Edge length labels */}
          {segments.map((s, i) => {
            const mx = (s.from.x + s.to.x) / 2;
            const my = (s.from.y + s.to.y) / 2;
            return (
              <text
                key={i}
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="#1d4ed8"
                stroke="#ffffff"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {fmt(pxToReal(dist(s.from, s.to)))} {unit}
              </text>
            );
          })}

          {/* Vertices; the first one doubles as the close target */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === 0 && !closed && points.length >= 3 ? 9 : 5}
              fill={i === 0 && !closed && points.length >= 3 ? "#22c55e" : "#3b82f6"}
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          {closed && area !== null && (
            <text
              x={centroid.x}
              y={centroid.y}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#111827"
              stroke="#ffffff"
              strokeWidth="4"
              paintOrder="stroke"
            >
              {fmt(area)} {unit}²
            </text>
          )}
        </svg>
      </div>

      {/* Summary & actions */}
      <div className="border-t border-gray-100 px-4 py-3 sm:px-6 space-y-3">
        <p className="text-sm text-gray-500">
          {points.length === 0
            ? "Tap the grid to draw the outline of the area you're measuring. Adjust the scale above to match reality."
            : closed
              ? "Shape closed. Change the scale any time — measurements update instantly."
              : points.length < 3
                ? "Keep tapping to add corners."
                : "Tap the green starting point (or Close Shape) to finish."}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="text-sm">
            <span className="text-gray-500 font-medium">{closed ? "Perimeter:" : "Length:"} </span>
            <span className="font-bold text-gray-900" data-testid="measure-perimeter">{fmt(perimeter)} {unit}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 font-medium">Area: </span>
            <span className="font-bold text-gray-900" data-testid="measure-area">{area !== null ? `${fmt(area)} ${unit}²` : "—"}</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddLength} disabled={perimeter <= 0}>
              <Plus className="h-4 w-4 mr-1" /> Add length as item
            </Button>
            <Button size="sm" onClick={handleAddArea} disabled={area === null}>
              <Plus className="h-4 w-4 mr-1" /> Add area as item
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
