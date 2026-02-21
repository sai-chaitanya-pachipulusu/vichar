"use client";

import { Quote } from "lucide-react";
import type { QuoteData } from "@/lib/tools";

export default function QuoteCard({ quote, page, context }: QuoteData) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Quote className="w-5 h-5 text-primary/40 shrink-0 mt-0.5" />
        <blockquote className="text-sm text-foreground leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      {page && (
        <span className="text-[10px] text-muted-foreground ml-8">
          Page {page}
        </span>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed border-t pt-2">
        {context}
      </p>
    </div>
  );
}
