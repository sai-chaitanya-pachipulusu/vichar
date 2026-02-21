"use client";

import { useEffect, useRef } from "react";
import type { MindElixirData } from "mind-elixir";
import type { MindMapData, MindElixirNode } from "@/lib/tools";

// Transform our node data to mind-elixir format
function toMindElixirData(nodeData: MindMapData["nodeData"]): MindElixirData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (node: MindElixirNode): any => ({
    id: node.id,
    topic: node.topic,
    children: node.children?.map(transform) ?? [],
  });
  return { nodeData: transform(nodeData) } as MindElixirData;
}

export default function MindMapWidget({ title, nodeData }: MindMapData) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || instanceRef.current) return;

    let cancelled = false;

    (async () => {
      const MindElixir = (await import("mind-elixir")).default;
      if (cancelled || !containerRef.current) return;

      const me = new MindElixir({
        el: containerRef.current,
        direction: MindElixir.SIDE,
        editable: false,
        contextMenu: false,
        toolBar: false,
        keypress: false,
      });

      const data = toMindElixirData(nodeData);
      me.init(data);
      instanceRef.current = me;
    })();

    return () => {
      cancelled = true;
    };
  }, [nodeData]);

  return (
    <div className="flex flex-col h-full">
      {title && (
        <h3 className="text-sm font-semibold text-foreground/80 px-2 pt-2 pb-1 truncate">
          {title}
        </h3>
      )}
      <div ref={containerRef} className="flex-1 min-h-[280px] w-full" />
    </div>
  );
}
