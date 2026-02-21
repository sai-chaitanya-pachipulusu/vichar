"use client";

import { useState } from "react";
import type { ConceptTreeData, TreeNode } from "@/lib/tools";
import { ChevronRight, ChevronDown, Circle } from "lucide-react";

function TreeNodeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className="flex items-center gap-1.5 w-full text-left py-1 px-1 rounded hover:bg-accent/50 transition-colors"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )
        ) : (
          <Circle className="w-2 h-2 text-muted-foreground/50 shrink-0 ml-0.5 mr-0.5" />
        )}
        <span className="text-sm text-foreground truncate">{node.name}</span>
      </button>
      {open && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConceptTreeWidget({ root }: ConceptTreeData) {
  return (
    <div className="p-3 overflow-auto max-h-[400px]">
      <TreeNodeItem node={root} />
    </div>
  );
}
