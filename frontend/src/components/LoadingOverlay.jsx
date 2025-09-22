import React from "react";
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
      <div className="text-center">
        <div className="inline-block h-10 w-10 rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-white animate-spin mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium">{message}</p>
      </div>
    </div>
  );
}
