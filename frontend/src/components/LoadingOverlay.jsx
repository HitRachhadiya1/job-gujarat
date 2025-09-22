import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoadingOverlay({
  message = "Loading...",
  fullscreen = true,
  className = "",
}) {
  return (
    <div
      className={cn(
        fullscreen ? "min-h-screen" : "h-full",
        "flex items-center justify-center bg-stone-300/40 dark:bg-stone-950/40 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-2 border-blue-400 opacity-20" />
        </div>
        <p className="text-slate-700 dark:text-slate-300 font-medium">{message}</p>
      </motion.div>
    </div>
  );
}
