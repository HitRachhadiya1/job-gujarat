"use client";;
import { Moon, Sun } from "lucide-react";
import { useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

export const AnimatedThemeToggler = ({ className }) => {
  const buttonRef = useRef(null);
  const { isDark, toggleTheme: toggleThemeContext } = useTheme();

  const onToggle = useCallback(async () => {
    if (!buttonRef.current || typeof document.startViewTransition !== "function") {
      // Fallback without fancy transition
      toggleThemeContext();
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        toggleThemeContext();
      });
    }).ready;

    const { top, left, width } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + width / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [toggleThemeContext]);

  return (
    <button ref={buttonRef} onClick={onToggle} className={cn(className)}>
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
};
