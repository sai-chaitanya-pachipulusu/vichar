"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Network, GitBranch } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    label: "AI Analysis",
    desc: "Claude reads your files and instantly surfaces insights as visual widgets",
  },
  {
    icon: GitBranch,
    label: "Mind Maps",
    desc: "Per-source concept maps generated automatically from your content",
  },
  {
    icon: Network,
    label: "Knowledge Graph",
    desc: "Entity relationships across all your sources, unified in one view",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;
    setIsCreating(true);
    const id = uuid();
    router.push(`/workspace/${id}?title=${encodeURIComponent(title.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
          style={{
            background:
              "conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full text-center space-y-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          Powered by Claude · Now in Alpha
        </motion.div>

        {/* Wordmark */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60">
            Vichar
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Drop your research. Watch AI think.
            <br />
            <span className="text-foreground/70">
              Visual understanding, manifested live on a living canvas.
            </span>
          </p>
        </div>

        {/* Input + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="What are you researching today?"
              className="w-full px-5 py-4 bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-center text-lg shadow-sm"
              autoFocus
              id="research-topic-input"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || isCreating}
            size="lg"
            className="w-full rounded-xl text-base h-12 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            id="start-research-btn"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating your workspace...
              </>
            ) : (
              <>
                Start Researching
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 pt-2"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.1, duration: 0.5 }}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card/40 border border-border/40 hover:border-primary/30 hover:bg-card/60 transition-all cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground/90">
                {f.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug text-center">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground/40">
          Supports PDF, TXT, and Markdown · Up to 5MB per file
        </p>
      </motion.div>
    </div>
  );
}
