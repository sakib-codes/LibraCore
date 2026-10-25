"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps = {}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  const executeThemeToggle = useCallback(
    (clickX?: number, clickY?: number, explicitNext?: "light" | "dark") => {
      if (isTransitioningRef.current) return;

      const currentTheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      const nextTheme = explicitNext ?? (currentTheme === "light" ? "dark" : "light");

      const applyThemeToDOM = () => {
        setTheme(nextTheme);
        try {
          localStorage.setItem("libris-theme", nextTheme);
        } catch {
          // Ignore localStorage quota or private browsing exceptions
        }

        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };

      // Check for View Transitions API support and user motion preference
      const supportsViewTransitions =
        typeof document !== "undefined" &&
        "startViewTransition" in document &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Progressive Fallback: CSS Transition
      if (!supportsViewTransitions) {
        isTransitioningRef.current = true;
        document.documentElement.classList.add("theme-transitioning");
        applyThemeToDOM();
        window.setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
          isTransitioningRef.current = false;
        }, 400);
        return;
      }

      // Determine the origin coordinate for the expanding circular reveal
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (clickX !== undefined && clickY !== undefined) {
        x = clickX;
        y = clickY;
      } else if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      // Calculate radius to the farthest corner of the viewport
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      isTransitioningRef.current = true;

      try {
        const transition = (document as Document & {
          startViewTransition: (callback: () => void) => {
            ready: Promise<void>;
            finished: Promise<void>;
          };
        }).startViewTransition(() => {
          applyThemeToDOM();
        });

        transition.ready
          .then(() => {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ];

            const animation = document.documentElement.animate(
              {
                clipPath,
              },
              {
                duration: 480,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );

            animation.onfinish = () => {
              isTransitioningRef.current = false;
            };
          })
          .catch(() => {
            isTransitioningRef.current = false;
          });

        transition.finished
          ?.then(() => {
            isTransitioningRef.current = false;
          })
          .catch(() => {
            isTransitioningRef.current = false;
          });
      } catch {
        // Fallback if startViewTransition throws
        document.documentElement.classList.add("theme-transitioning");
        applyThemeToDOM();
        window.setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
          isTransitioningRef.current = false;
        }, 400);
      }
    },
    []
  );

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Listen for custom trigger (e.g. from command palette or header buttons)
    const handleCustomToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ clientX?: number; clientY?: number }>;
      executeThemeToggle(customEvent.detail?.clientX, customEvent.detail?.clientY);
    };

    // Keyboard shortcut: ⌘D or Ctrl+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        // Do not trigger if user is typing inside an input or textarea
        const target = e.target as HTMLElement | null;
        const isInput =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          executeThemeToggle();
        }
      }
    };

    // Listen to system theme changes if user hasn't explicitly set preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("libris-theme");
      if (!stored) {
        executeThemeToggle(undefined, undefined, e.matches ? "dark" : "light");
      }
    };

    window.addEventListener("toggle-libris-theme", handleCustomToggle);
    window.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      window.removeEventListener("toggle-libris-theme", handleCustomToggle);
      window.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [executeThemeToggle]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    executeThemeToggle(e.clientX, e.clientY);
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90 transition-all duration-300",
        className
      )}
      title={theme === "light" ? "Switch to Dark Mode (⌘D)" : "Switch to Light Mode (⌘D)"}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100 text-indigo-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
