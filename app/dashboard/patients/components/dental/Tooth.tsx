"use client";
import React, { useState } from "react";

// --- Types ---
export interface SurfaceData {
  id: string;
  abbr?: string;
  note?: string;
}

export interface ToothSurfaces {
  [surfaceName: string]: SurfaceData | undefined;
}

export interface SelectionState {
  tooth: number;
  surface: string;
  displayLabel: string;
}

interface ToothProps {
  toothNumber: number;
  surfaces: ToothSurfaces;
  onSurfaceClick: (tooth: number, surface: string) => void;
  selectedSurface: SelectionState | null;
}

const Tooth: React.FC<ToothProps> = ({
  toothNumber,
  surfaces = {},
  onSurfaceClick,
  selectedSurface,
}) => {
  const [hoveredSurface, setHoveredSurface] = useState<string | null>(null);

  const getSurfaceColor = (partName: string): string => {
    const data = surfaces[partName];
    if (!data) return "white";
    const id = data.id;

    // Red: Pathologies & Defects
    if (
      [
        "caries",
        "recurrent_caries",
        "fractured",
        "root_stump",
        "attrition",
        "abrasion",
        "erosion",
      ].includes(id)
    )
      return "#ef4444";

    // Blue: Restorations
    if (["amalgam", "composite", "gic", "temporary"].includes(id))
      return "#3b82f6";

    // Purple: Endodontic & Prosthesis
    if (["rct", "crown", "bridge", "veneer", "implant"].includes(id))
      return "#a855f7";

    // Gray: Missing
    if (["missing"].includes(id)) return "#52525b";

    // Orange: Eruption issues
    if (["impacted", "unerupted"].includes(id)) return "#fb923c";

    // Green: Healthy/Present
    if (["present"].includes(id)) return "#10b981";

    return "#f4f4f5";
  };

  // Determine if the whole tooth has a special status overlay
  const toothStatus = Object.values(surfaces).find((s) =>
    ["missing", "root_stump", "impacted", "unerupted"].includes(s?.id || ""),
  )?.id;

  const isSelected = (surface: string): boolean =>
    selectedSurface?.tooth === toothNumber &&
    selectedSurface?.surface === surface;

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      {/* TOOLTIP */}
      {hoveredSurface && surfaces[hoveredSurface] && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-100 bg-zinc-900 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl border border-zinc-700 pointer-events-none whitespace-nowrap">
          <span className="font-black text-emerald-400 mr-1">
            {hoveredSurface.toUpperCase()}:
          </span>
          {surfaces[hoveredSurface]?.abbr || "N/A"}
          {surfaces[hoveredSurface]?.note &&
            ` - ${surfaces[hoveredSurface]?.note}`}
        </div>
      )}

      {/* TOOTH NUMBER LABEL */}
      <div
        className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-all ${
          selectedSurface?.tooth === toothNumber
            ? "bg-emerald-500 text-white shadow-lg scale-110"
            : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {toothNumber}
      </div>

      {/* SVG INTERACTIVE CHART */}
      <div className="relative w-14 h-14 lg:w-16 lg:h-16 transition-transform hover:scale-105">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          <defs>
            <clipPath id={`clip-${toothNumber}`}>
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath={`url(#clip-${toothNumber})`}>
            {(["top", "right", "bottom", "left"] as const).map((part) => (
              <path
                key={part}
                d={
                  part === "top"
                    ? "M 0 0 L 100 0 L 50 50 Z"
                    : part === "right"
                      ? "M 100 0 L 100 100 L 50 50 Z"
                      : part === "bottom"
                        ? "M 0 100 L 100 100 L 50 50 Z"
                        : "M 0 0 L 0 100 L 50 50 Z"
                }
                fill={getSurfaceColor(part)}
                stroke="#d4d4d8"
                strokeWidth={isSelected(part) ? "6" : "0.5"}
                className={`cursor-pointer transition-all ${
                  isSelected(part)
                    ? "stroke-emerald-500"
                    : "hover:brightness-90"
                }`}
                onClick={() => onSurfaceClick(toothNumber, part)}
                onMouseEnter={() => setHoveredSurface(part)}
                onMouseLeave={() => setHoveredSurface(null)}
              />
            ))}
          </g>

          {/* Center (Occlusal/Incisal) Surface */}
          <circle
            cx="50"
            cy="50"
            r="22"
            fill={getSurfaceColor("center")}
            stroke="#d4d4d8"
            strokeWidth={isSelected("center") ? "6" : "0.5"}
            className={`cursor-pointer transition-all ${
              isSelected("center")
                ? "stroke-emerald-500"
                : "hover:brightness-90"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(toothNumber, "center");
            }}
            onMouseEnter={() => setHoveredSurface("center")}
            onMouseLeave={() => setHoveredSurface(null)}
          />

          {/* INDICATORS */}
          {toothStatus === "missing" && (
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fontSize="45"
              fontWeight="900"
              fill="#52525b"
              className="pointer-events-none select-none opacity-80"
            >
              M
            </text>
          )}

          {(toothStatus === "impacted" || toothStatus === "unerupted") && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#fb923c"
              strokeWidth="4"
              strokeDasharray="8,4"
              className="pointer-events-none"
            />
          )}

          {toothStatus === "root_stump" && (
            <g className="pointer-events-none opacity-60">
              <line
                x1="20"
                y1="20"
                x2="80"
                y2="80"
                stroke="#ef4444"
                strokeWidth="8"
              />
              <line
                x1="80"
                y1="20"
                x2="20"
                y2="80"
                stroke="#ef4444"
                strokeWidth="8"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default Tooth;
