"use client";

import { Badge } from "@/components/ui/badge";
import type { SummaryCardData } from "@/lib/tools";

export default function SummaryCard({ title, bullets }: SummaryCardData) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {title}
        </h3>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          Summary
        </Badge>
      </div>
      <ul className="space-y-2">
        {bullets.map((bullet, i) => (
          <li
            key={i}
            className="text-xs text-muted-foreground leading-relaxed flex gap-2"
          >
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
