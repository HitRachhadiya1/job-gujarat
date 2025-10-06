import React, { useEffect, useRef } from "react";

// Interactive background grid with spotlight and click ripple
// Designed for use behind hero/CTA sections without interfering with UI interactions.
export function BackgroundRippleEffect({
  gridSize = 60,
  intensity = 0.16,
  enableSpotlight = true,
  enableRipple = true,
}) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const el = ref.current;
          if (!el) return;
          el.style.setProperty("--x", `${mouseRef.current.x}px`);
          el.style.setProperty("--y", `${mouseRef.current.y}px`);
        });
      }
    };

    const handleClick = (e) => {
      const el = ref.current;
      if (!el) return;
      const ripple = document.createElement("span");
      ripple.className =
        "pointer-events-none absolute rounded-full bg-sky-400/20 dark:bg-sky-300/10 animate-ping";
      const size = 44;
      ripple.style.left = `${e.clientX - size / 2}px`;
      ripple.style.top = `${e.clientY - size / 2}px`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.zIndex = "1";
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1200);
    };

    if (enableSpotlight) window.addEventListener("mousemove", handleMove);
    if (enableRipple) window.addEventListener("click", handleClick);
    return () => {
      if (enableSpotlight) window.removeEventListener("mousemove", handleMove);
      if (enableRipple) window.removeEventListener("click", handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableSpotlight, enableRipple]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(2,132,199,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,132,199,0.18) 1px, transparent 1px)",
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: "center center",
        }}
      />

      {/* Spotlight following the cursor (optional) */}
      {enableSpotlight && (
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background: `radial-gradient(600px circle at var(--x) var(--y), rgba(59,130,246,${intensity}), transparent 55%)`,
          }}
        />
      )}

      {/* Soft vignette to focus center content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#EAF6F9]/40 dark:to-[#0B1F3B]/40" />
    </div>
  );
}
