"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  projectId: string;
  onFileIngested: (result: {
    sourceId: string;
    fileName: string;
    chunkCount: number;
  }) => void;
  hasContent: boolean;
}

export default function DropZone({
  projectId,
  onFileIngested,
  hasContent,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setIsUploading(true);

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} exceeds 5MB limit`);
          continue;
        }

        setUploadProgress(`Processing ${file.name}...`);

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);

          const res = await fetch("/api/ingest", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Upload failed");
          }

          const result = await res.json();
          onFileIngested({
            sourceId: result.sourceId,
            fileName: result.fileName,
            chunkCount: result.chunkCount,
          });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to upload file"
          );
        }
      }

      setIsUploading(false);
      setUploadProgress(null);
    },
    [projectId, onFileIngested]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Full empty state
  if (!hasContent) {
    return (
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          flex flex-col items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border/50 hover:border-border hover:bg-accent/30"
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md,.csv"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{uploadProgress}</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Drop your research here
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, text, or markdown files — up to 5MB each
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Vichar will analyze your content and build a visual workspace
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 mt-4 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Compact overlay when content exists
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.md,.csv"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-primary/5 backdrop-blur-sm flex items-center justify-center"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="bg-card border-2 border-dashed border-primary rounded-2xl p-12 text-center">
              <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">
                Drop to add source
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible drop target covering the whole page */}
      <div
        className="fixed inset-0 z-30 pointer-events-none"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        style={{ pointerEvents: isDragging ? "auto" : "none" }}
      />

      {/* Upload status */}
      <AnimatePresence>
        {(isUploading || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-card border rounded-lg px-4 py-2 shadow-lg flex items-center gap-3"
          >
            {isUploading && (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-foreground">{uploadProgress}</span>
              </>
            )}
            {error && (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
