"use client";

import { useRef, useEffect } from "react";

export default function AnalyticsParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isTouchingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Return whether canvas has valid dimensions
      return rect.width > 0 && rect.height > 0;
    };

    // Don't proceed if canvas has invalid dimensions
    if (!updateCanvasSize()) return;

    let particles: {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      color: string;
      life: number;
    }[] = [];

    let textImageData: ImageData | null = null;

    function createBarsImage() {
      if (!ctx || !canvas || canvas.width <= 0 || canvas.height <= 0) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bar configuration - fixed sizes for desktop
      const barWidth = 60;
      const barSpacing = 40;
      const maxBarHeight = Math.min(200, canvas.height * 0.4);

      // Bar heights (growing effect)
      const bar1Height = maxBarHeight * 0.5;
      const bar2Height = maxBarHeight * 0.75;
      const bar3Height = maxBarHeight;

      // Center position
      const totalWidth = barWidth * 3 + barSpacing * 2;
      const startX = (canvas.width - totalWidth) / 2;
      const baseY = canvas.height / 2 + maxBarHeight / 2;

      // Draw the 3 bars
      ctx.fillStyle = "white";

      // Bar 1 (smallest)
      ctx.fillRect(startX, baseY - bar1Height, barWidth, bar1Height);

      // Bar 2 (medium)
      ctx.fillRect(
        startX + barWidth + barSpacing,
        baseY - bar2Height,
        barWidth,
        bar2Height,
      );

      // Bar 3 (largest)
      ctx.fillRect(
        startX + (barWidth + barSpacing) * 2,
        baseY - bar3Height,
        barWidth,
        bar3Height,
      );

      // Capture image data
      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    function createParticle() {
      if (!ctx || !canvas || !textImageData) return null;

      const data = textImageData.data;

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);

        const index = (y * canvas.width + x) * 4;

        // Check if pixel is part of bars (has alpha > 128)
        if (data && index >= 0 && index + 3 < data.length) {
          const alpha = data[index + 3];
          if (alpha && alpha > 128) {
            return {
              x: x,
              y: y,
              baseX: x,
              baseY: y,
              size: Math.random() * 1.5 + 0.5,
              color: "white",
              life: Math.random() * 100 + 50,
            };
          }
        }
      }

      return null;
    }

    function createInitialParticles() {
      if (!canvas) return;

      const baseParticleCount = 2000;
      const particleCount = Math.floor(
        baseParticleCount *
          Math.sqrt((canvas.width * canvas.height) / (960 * 1080)),
      );

      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle();
        if (particle) particles.push(particle);
      }
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas || canvas.width <= 0 || canvas.height <= 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      const maxDistance = 150;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance < maxDistance &&
          (isTouchingRef.current || !("ontouchstart" in window))
        ) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * force * 40;
          const moveY = Math.sin(angle) * force * 40;
          p.x = p.baseX - moveX;
          p.y = p.baseY - moveY;

          // Glow effect when scattered
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + force * 0.2})`;
        } else {
          p.x += (p.baseX - p.x) * 0.08;
          p.y += (p.baseY - p.y) * 0.08;
          ctx.fillStyle = p.color;
        }

        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.life--;
        if (p.life <= 0) {
          const newParticle = createParticle();
          if (newParticle) {
            particles[i] = newParticle;
          } else {
            particles.splice(i, 1);
            i--;
          }
        }
      }

      // Maintain particle count
      const baseParticleCount = 2000;
      const targetParticleCount = Math.floor(
        baseParticleCount *
          Math.sqrt((canvas.width * canvas.height) / (960 * 1080)),
      );
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle();
        if (newParticle) particles.push(newParticle);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    createBarsImage();
    createInitialParticles();
    animate();

    const handleResize = () => {
      if (updateCanvasSize()) {
        createBarsImage();
        particles = [];
        createInitialParticles();
      }
    };

    const handleMove = (x: number, y: number) => {
      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = {
        x: x - rect.left,
        y: y - rect.top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
          handleMove(touch.clientX, touch.clientY);
        }
      }
    };

    const handleTouchStart = () => {
      isTouchingRef.current = true;
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
      mousePositionRef.current = { x: 0, y: 0 };
    };

    const handleMouseLeave = () => {
      if (!("ontouchstart" in window)) {
        mousePositionRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 touch-none"
        aria-label="Interactive particle effect with analytics bars"
      />
    </div>
  );
}
