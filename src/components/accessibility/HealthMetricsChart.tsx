"use client";

/**
 * HealthMetricsChart — Accessible demo bar chart with "View as table" toggle.
 *
 * Demonstrates:
 * - Chart with aria-label
 * - Each bar has an aria-label (not colour-only)
 * - "View as table" button provides a text alternative
 * - Table has th scope="col", a <caption>, and numeric values
 * - Colour, bar height, AND text value all encode data (WCAG 1.4.1)
 *
 * STATUS: Prototype — demo data, clearly labelled.
 * No real health data is used or implied.
 */

import { useState } from "react";
import { Table2, BarChart2 } from "lucide-react";

type Metric = {
  week: number;
  weightKg: number;
  bpSystolic: number;
};

/** Synthetic demo data — clearly labelled as demonstration. */
const DEMO_DATA: Metric[] = [
  { week: 20, weightKg: 58.2, bpSystolic: 112 },
  { week: 24, weightKg: 60.1, bpSystolic: 118 },
  { week: 28, weightKg: 62.5, bpSystolic: 115 },
  { week: 32, weightKg: 65.0, bpSystolic: 120 },
  { week: 36, weightKg: 67.3, bpSystolic: 116 },
];

const CHART_H = 120;
const BAR_W = 36;
const BAR_GAP = 12;
const MAX_WEIGHT = 70;

export function HealthMetricsChart() {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="space-y-3">
      {/* Demo data notice */}
      <p className="text-xs font-semibold text-pro-warning bg-pro-warning-soft inline-flex items-center gap-1 rounded-pill px-2 py-0.5">
        Demo data — not real health records
        <span lang="bn" className="font-normal">ডেমো তথ্য</span>
      </p>

      {/* Toggle button */}
      <div>
        <button
          type="button"
          onClick={() => setView(view === "chart" ? "table" : "chart")}
          className="inline-flex items-center gap-2 rounded-control border border-pro-border bg-pro-surface px-3 py-2 text-sm font-medium text-pro-text
            hover:bg-pro-elevated focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus min-h-[44px]"
          aria-pressed={view === "table"}
        >
          {view === "chart" ? (
            <>
              <Table2 size={16} aria-hidden="true" />
              View as table
              <span className="sr-only"> — currently showing chart</span>
            </>
          ) : (
            <>
              <BarChart2 size={16} aria-hidden="true" />
              View as chart
              <span className="sr-only"> — currently showing table</span>
            </>
          )}
        </button>
      </div>

      {view === "chart" ? (
        /* ---- Bar chart ---- */
        <div
          role="img"
          aria-label="Demo bar chart: maternal weight by pregnancy week. Weights range from 58.2 kg at week 20 to 67.3 kg at week 36. Use 'View as table' for full data."
        >
          <svg
            width={(BAR_W + BAR_GAP) * DEMO_DATA.length + BAR_GAP}
            height={CHART_H + 36}
            aria-hidden="true"
            className="overflow-visible"
          >
            {DEMO_DATA.map((m, i) => {
              const barH = Math.round((m.weightKg / MAX_WEIGHT) * CHART_H);
              const x = BAR_GAP + i * (BAR_W + BAR_GAP);
              const y = CHART_H - barH;

              return (
                <g key={m.week} aria-label={`Week ${m.week}: ${m.weightKg} kg`}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={BAR_W}
                    height={barH}
                    rx={4}
                    className="fill-pro-primary opacity-80"
                  />
                  {/* Value label */}
                  <text
                    x={x + BAR_W / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className="fill-pro-text text-[10px]"
                    fontSize={10}
                  >
                    {m.weightKg}
                  </text>
                  {/* Week label */}
                  <text
                    x={x + BAR_W / 2}
                    y={CHART_H + 16}
                    textAnchor="middle"
                    className="fill-pro-muted text-[10px]"
                    fontSize={10}
                  >
                    W{m.week}
                  </text>
                </g>
              );
            })}
            {/* Y-axis label */}
            <text
              x={4}
              y={CHART_H / 2}
              transform={`rotate(-90, 4, ${CHART_H / 2})`}
              textAnchor="middle"
              className="fill-pro-muted text-[9px]"
              fontSize={9}
            >
              kg
            </text>
          </svg>
        </div>
      ) : (
        /* ---- Accessible table ---- */
        <div className="overflow-x-auto rounded-card border border-pro-border">
          <table
            className="w-full text-sm"
            aria-label="Maternal weight by pregnancy week — demo data"
          >
            <caption className="sr-only">
              Demo maternal weight measurements at selected pregnancy weeks.
              All values are synthetic and for demonstration only.
            </caption>
            <thead className="bg-pro-surface">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">
                  Pregnancy week
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">
                  Weight (kg)
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">
                  Blood pressure — systolic (mmHg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-border bg-pro-elevated">
              {DEMO_DATA.map((m) => (
                <tr key={m.week}>
                  <td className="px-4 py-3 text-pro-text">Week {m.week}</td>
                  <td className="px-4 py-3 text-pro-text">{m.weightKg} kg</td>
                  <td className="px-4 py-3 text-pro-text">{m.bpSystolic} mmHg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
