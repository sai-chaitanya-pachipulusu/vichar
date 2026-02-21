"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Brain, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingStreamProps {
  messages: string[];
  isActive: boolean;
}

export default function ThinkingStream({
  messages,
  isActive,
}: ThinkingStreamProps) {
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-expand when Claude starts thinking
  useEffect(() => {
    if (isActive && messages.length > 0) {
      setExpanded(true);
    }
  }, [isActive, messages.length]);

  // Auto-collapse when done
  useEffect(() => {
    if (!isActive && messages.length > 0) {
      const timer = setTimeout(() => setExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && expanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, expanded]);

  if (messages.length === 0 && !isActive) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Header bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-card/95 backdrop-blur-md border-t border-border/60 hover:bg-accent/60 transition-colors"
        id="thinking-stream-toggle"
      >
        <div className="flex items-center gap-2.5">
          {isActive ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </motion.div>
          ) : (
            <Brain className="w-3.5 h-3.5 text-primary/60" />
          )}
          <span className="text-xs font-medium text-foreground">
            {isActive ? (
              <span className="text-primary">Vichar is thinking...</span>
            ) : (
              <span className="text-muted-foreground">
                Analysis complete · {messages.length} insight
                {messages.length !== 1 ? "s" : ""}
              </span>
            )}
          </span>
          {isActive && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 220 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-card/95 backdrop-blur-md border-t border-border/40"
          >
            <div
              ref={scrollRef}
              className="h-[220px] overflow-y-auto p-4 space-y-1.5 font-mono text-[11px] scrollbar-thin"
            >
              {messages.map((msg, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground leading-relaxed flex gap-2"
                >
                  <span className="text-primary/40 shrink-0 mt-0.5">▸</span>
                  <span>{msg}</span>
                </motion.p>
              ))}
              {isActive && (
                <span className="inline-block w-1.5 h-3.5 bg-primary/50 animate-pulse ml-4 rounded-sm" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
