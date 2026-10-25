"use client";

import React, { useEffect, useRef } from "react";

interface WaveDotMatrixProps {
  className?: string;
  dotColorDark?: string;
  dotColorLight?: string;
}

/**
 * WaveDotMatrix — Rectangular-Aligned 3D Sinusoidal Particle Wave Canvas.
 * - Perfectly aligned to the container's rectangular boundaries (edge-to-edge).
 * - Gentle, serene wave velocity ("slow not too fast").
 * - Interactive cursor reaction: dynamic 3D elevation, radial displacement, and proximity glow on mouse hover.
 * - Dynamic theme adaptation (Indigo-400 Dark Mode / Indigo-600 Light Mode).
 */
export function WaveDotMatrix({
  className = "absolute inset-0 pointer-events-none z-0",
  dotColorDark = "129, 140, 248", // rgb for indigo-400
  dotColorLight = "79, 70, 229", // rgb for indigo-600
}: WaveDotMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates (canvas space)
    let isHovering = false;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;
    let hoverIntensity = 0; // 0 (inactive) to 1 (active)

    // Check dark mode
    let isDark = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Default mouse to center if not hovered
      if (!isHovering) {
        targetMouseX = width * 0.5;
        targetMouseY = height * 0.5;
        smoothMouseX = targetMouseX;
        smoothMouseY = targetMouseY;
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Pointer event listeners on parent container for interactive mouse hover reaction
    const parent = canvas.parentElement;
    const handlePointerMove = (e: PointerEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handlePointerEnter = (e: PointerEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      smoothMouseX = targetMouseX;
      smoothMouseY = targetMouseY;
      isHovering = true;
    };

    const handlePointerLeave = () => {
      isHovering = false;
    };

    if (parent) {
      parent.addEventListener("pointermove", handlePointerMove, { passive: true });
      parent.addEventListener("pointerenter", handlePointerEnter, { passive: true });
      parent.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    }

    // Grid spacing: uniform ~24px spacing filling the full rectangle
    const DOT_SPACING = 24;
    let time = 0;

    const render = () => {
      // Gentle, serene wave speed ("slow not too fast")
      time += 0.006;

      // Smooth mouse interpolation with spring-damping
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.08;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.08;

      // Smoothly blend hover intensity in/out
      const targetIntensity = isHovering ? 1 : 0;
      hoverIntensity += (targetIntensity - hoverIntensity) * 0.06;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const rgb = isDark ? dotColorDark : dotColorLight;
      const baseAlpha = isDark ? 0.36 : 0.24;

      // Calculate grid dimensions to ensure complete edge-to-edge coverage aligned to the rectangle
      const cols = Math.ceil(width / DOT_SPACING) + 2;
      const rows = Math.ceil(height / DOT_SPACING) + 2;
      const startX = (width - (cols - 1) * DOT_SPACING) / 2;
      const startY = (height - (rows - 1) * DOT_SPACING) / 2;

      // Parallax 3D tilt based on smoothed cursor position
      const normTiltX = (smoothMouseX / (width || 1) - 0.5) * 2;
      const normTiltY = (smoothMouseY / (height || 1) - 0.5) * 2;
      const tiltAngleX = normTiltX * 0.08 * hoverIntensity;
      const tiltAngleY = normTiltY * 0.08 * hoverIntensity;

      // Mouse influence radius
      const MOUSE_RADIUS = 160;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Base resting position aligned strictly to the rectangular panel
          const x0 = startX + i * DOT_SPACING;
          const y0 = startY + j * DOT_SPACING;

          // 1. Ambient 3D Sinusoidal Undulating Waves (Slow, soothing velocity)
          // Long wavelengths provide sweeping, elegant swells
          const w1 = Math.sin(x0 * 0.010 + y0 * 0.008 + time * 1.3) * 14;
          const w2 = Math.cos(x0 * 0.008 - y0 * 0.011 + time * 0.9) * 11;
          const w3 = Math.sin((x0 + y0) * 0.006 + time * 0.7) * 7;
          const zAmbient = w1 + w2 + w3;

          // 2. Interactive Mouse Reaction (Hover Disturbance & Ripple)
          let zMouse = 0;
          let pushX = 0;
          let pushY = 0;
          let proximityGlow = 0;

          if (hoverIntensity > 0.01) {
            const dx = x0 - smoothMouseX;
            const dy = y0 - smoothMouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
              const norm = dist / MOUSE_RADIUS; // 0 at center, 1 at boundary
              // Smooth cubic bell curve
              const bell = (1 - norm) * (1 - norm) * hoverIntensity;

              // 3D elevation: dots physically lift toward the user around the cursor
              // with a gentle trailing ripple
              const ripple = Math.sin(dist * 0.08 - time * 3.5) * 12;
              zMouse = bell * 26 + bell * ripple;

              // Subtle organic radial push away from the cursor
              const repelForce = bell * 7;
              pushX = (dx / (dist + 0.1)) * repelForce;
              pushY = (dy / (dist + 0.1)) * repelForce;

              // Proximity illumination glow
              proximityGlow = bell * 0.42;
            }
          }

          const zTotal = zAmbient + zMouse;

          // 3. 3D Perspective Projection (Aligned to the rectangular plane)
          // Z displacement translates into vertical lift and subtle perspective divergence
          const screenX = x0 + pushX + zTotal * (0.05 + tiltAngleX);
          const screenY = y0 + pushY - zTotal * 0.38 + zTotal * tiltAngleY;

          // Culling if outside visible canvas viewport
          if (screenX < -10 || screenX > width + 10 || screenY < -10 || screenY > height + 10) {
            continue;
          }

          // 4. Dot Styling: Radius & Opacity modulated by 3D height + cursor reaction
          // Normalized height (-35 to +35)
          const zNorm = Math.max(0, Math.min(1, (zTotal + 35) / 70));
          const baseRadius = 1.45;
          const radius = Math.max(
            0.9,
            baseRadius * (0.75 + zNorm * 0.65) + proximityGlow * 1.2
          );

          // Alpha modulation: crests & hover areas are brighter, troughs are softer
          const alpha = Math.max(
            0.08,
            Math.min(0.85, baseAlpha * (0.55 + zNorm * 0.85) + proximityGlow)
          );

          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      resizeObserver.disconnect();
      if (parent) {
        parent.removeEventListener("pointermove", handlePointerMove);
        parent.removeEventListener("pointerenter", handlePointerEnter);
        parent.removeEventListener("pointerleave", handlePointerLeave);
      }
    };
  }, [dotColorDark, dotColorLight]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
