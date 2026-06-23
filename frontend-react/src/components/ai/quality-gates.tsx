"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AiQualityGate } from "@/services/api";

interface QualityGatesProps {
  gates?: AiQualityGate[];
  compact?: boolean;
}

export function QualityGates({ gates, compact = false }: QualityGatesProps) {
  if (!gates?.length) return null;

  const failed = gates.filter((gate) => !gate.passed);
  const visibleGates = failed.length > 0 ? failed : gates;

  return (
    <div className={compact ? "mt-2 flex flex-wrap gap-1.5" : "mt-3 space-y-1.5"}>
      {visibleGates.map((gate) => {
        const isPassed = gate.passed;
        const Icon = isPassed ? CheckCircle2 : AlertTriangle;
        return (
          <div
            key={gate.name}
            className={[
              "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
              isPassed
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/25 bg-amber-500/10 text-amber-300",
            ].join(" ")}
            title={gate.message || gate.name}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate font-medium">{formatGateName(gate.name)}</span>
            {gate.score != null && <span className="shrink-0 opacity-80">{Math.round(gate.score * 100)}%</span>}
            {gate.message && !isPassed && <span className="truncate opacity-90">{gate.message}</span>}
          </div>
        );
      })}
    </div>
  );
}

function formatGateName(name: string): string {
  return name.replace(/_/g, " ");
}
