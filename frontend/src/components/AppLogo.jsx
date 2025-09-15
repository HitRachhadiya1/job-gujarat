import React from "react";
import { Briefcase } from "lucide-react";
import { useLogo } from "../context/LogoContext";

/**
 * AppLogo - A reusable, responsive logo renderer.
 * - Auto-adjusts to its container using object-contain (no cropping).
 * - No backgrounds or side spaces added; respects transparent logos.
 * - Falls back to Briefcase icon when no logo is set.
 *
 * Props:
 * - size: Tailwind size classes for width/height (e.g., "w-10 h-10")
 * - rounded: Tailwind rounded classes (e.g., "rounded-lg", "rounded-3xl")
 * - mode: "contain" | "cover" (default: "contain")
 * - className: additional classes for the wrapper div
 */
export default function AppLogo({
  size = "w-10 h-10",
  rounded = "rounded-lg",
  mode = "contain",
  className = "",
}) {
  const { appLogo } = useLogo();

  return (
    <div className={`${size} ${rounded} overflow-hidden ${className}`}>
      {appLogo ? (
        <img
          src={appLogo}
          alt="Job Gujarat Logo"
          className={`w-full h-full object-${mode} object-center select-none`}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Briefcase className="w-1/2 h-1/2 text-stone-900 dark:text-stone-100" />
        </div>
      )}
    </div>
  );
}
