"use client";

import { AlertTriangle } from "lucide-react";
import type { ConflictData } from "@/lib/tools";

export default function ConflictCard({
  claimA,
  sourceA,
  claimB,
  sourceB,
  explanation,
}: ConflictData) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">
          Contradiction Detected
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
            {sourceA}
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            &ldquo;{claimA}&rdquo;
          </p>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-medium">vs</span>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
            {sourceB}
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            &ldquo;{claimB}&rdquo;
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed border-t pt-2">
        {explanation}
      </p>
    </div>
  );
}
