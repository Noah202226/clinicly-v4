"use client";
import React, { useState } from "react";
import Tooth from "./Tooth";
import ToothModal from "./ToothModal";

export default function DentalChart() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // FDI World Dental Federation notation
  const upperLeft = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperRight = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeft = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerRight = [31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="w-full space-y-8 select-none">
      {/* 1. COMPACT LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 p-3 bg-white rounded-2xl border shadow-sm text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-100" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-100" />
          <span>Caries</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-100" />
          <span>Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-100" />
          <span>Note</span>
        </div>
      </div>

      {/* 2. SCROLLABLE CHART AREA */}
      <div className="overflow-x-auto pb-6 no-scrollbar touch-pan-x">
        {/* We set a min-width to ensure teeth don't shrink too much on mobile */}
        <div className="min-w-[850px] space-y-12 px-4">
          {/* UPPER ARCH */}
          <section className="relative">
            <h3 className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
              Upper Maxillary (Top)
            </h3>

            <div className="grid grid-cols-16 gap-1 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm relative">
              {/* Midline Indicator */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-100 -translate-x-1/2 z-0" />

              {[...upperLeft, ...upperRight].map((num) => (
                <div key={num} className="z-10 flex justify-center">
                  {/* <Tooth number={num} onSelect={() => setSelectedTooth(num)} /> */}
                </div>
              ))}
            </div>
          </section>

          {/* LOWER ARCH */}
          <section className="relative">
            <div className="grid grid-cols-16 gap-1 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm relative">
              {/* Midline Indicator */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-100 -translate-x-1/2 z-0" />

              {[...lowerLeft, ...lowerRight].map((num) => (
                <div key={num} className="z-10 flex justify-center">
                  {/* <Tooth number={num} onSelect={() => setSelectedTooth(num)} /> */}
                </div>
              ))}
            </div>

            <h3 className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">
              Lower Mandibular (Bottom)
            </h3>
          </section>
        </div>
      </div>

      {/* 3. CHART HINT (Visible only on mobile) */}
      <p className="text-center text-[10px] text-slate-400 md:hidden animate-pulse">
        ← Swipe to view all teeth →
      </p>

      <ToothModal
        tooth={selectedTooth}
        open={!!selectedTooth}
        onClose={() => setSelectedTooth(null)}
      />
    </div>
  );
}
