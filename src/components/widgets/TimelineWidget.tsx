"use client";

import type { TimelineData } from "@/lib/tools";

export default function TimelineWidget({ events }: TimelineData) {
  return (
    <div className="flex flex-col gap-0 p-4">
      {events.map((event, i) => (
        <div key={i} className="flex gap-4 relative">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20 z-10" />
            {i < events.length - 1 && (
              <div className="w-px flex-1 bg-border min-h-[40px]" />
            )}
          </div>
          {/* Content */}
          <div className="pb-6 -mt-0.5">
            <span className="text-xs font-mono text-muted-foreground">
              {event.date}
            </span>
            <h4 className="text-sm font-semibold text-foreground mt-0.5">
              {event.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
