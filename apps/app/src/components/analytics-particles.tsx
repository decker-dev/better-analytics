"use client";

import { useRef, useEffect, useState } from "react";

export default function AnalyticsParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isTouchingRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setIsMobile(window.innerWidth < 768);
    };

    updateCanvasSize();

    let particles: {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      color: string;
      scatteredColor: string;
      life: number;
    }[] = [];

    let textImageData: ImageData | null = null;

    function createBarsImage() {
      if (!ctx || !canvas) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Configuración de las barras
      const barWidth = isMobile ? 40 : 60;
      const barSpacing = isMobile ? 20 : 30;
      const maxBarHeight = isMobile ? 120 : 200;

      // Alturas de las barras (efecto creciente)
      const bar1Height = maxBarHeight * 0.4; // 40% de altura
      const bar2Height = maxBarHeight * 0.7; // 70% de altura
      const bar3Height = maxBarHeight; // 100% de altura

      // Posición central
      const totalWidth = barWidth * 3 + barSpacing * 2;
      const startX = (canvas.width - totalWidth) / 2;
      const baseY = canvas.height / 2 + maxBarHeight / 2;

      // Dibujar las 3 barras
      ctx.fillStyle = "white";

      // Barra 1 (más pequeña)
      ctx.fillRect(startX, baseY - bar1Height, barWidth, bar1Height);

      // Barra 2 (mediana)
      ctx.fillRect(
        startX + barWidth + barSpacing,
        baseY - bar2Height,
        barWidth,
        bar2Height,
      );

      // Barra 3 (más grande)
      ctx.fillRect(
        startX + (barWidth + barSpacing) * 2,
        baseY - bar3Height,
        barWidth,
        bar3Height,
      );

      // Capturar los datos de imagen
      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function createParticle() {
      if (!ctx || !canvas || !textImageData) return null;

      const data = textImageData.data;

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);

        const index = (y * canvas.width + x) * 4;

        // Verificar si el pixel es parte de las barras (tiene alpha > 128)
        if (data[index + 3] > 128) {
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 1.5 + 0.5,
            color: "white",
            scatteredColor: "#FFFFFF",
            life: Math.random() * 100 + 50,
          };
        }
      }

      return null;
    }

    function createInitialParticles() {
      const baseParticleCount = 5000;
      const particleCount = Math.floor(
        baseParticleCount *
          Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      );
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle();
        if (particle) particles.push(particle);
      }
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      const maxDistance = 200;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance < maxDistance &&
          (isTouchingRef.current || !("ontouchstart" in window))
        ) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * force * 50;
          const moveY = Math.sin(angle) * force * 50;
          p.x = p.baseX - moveX;
          p.y = p.baseY - moveY;

          // Efecto de brillo cuando se dispersan
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

      // Mantener el número de partículas
      const baseParticleCount = 5000;
      const targetParticleCount = Math.floor(
        baseParticleCount *
          Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
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
      updateCanvasSize();
      createBarsImage();
      particles = [];
      createInitialParticles();
    };

    const handleMove = (x: number, y: number) => {
      mousePositionRef.current = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 touch-none"
        aria-label="Interactive particle effect with analytics bars"
      />
      <div className="absolute bottom-[100px] text-center z-10">
        <p className="font-mono text-gray-400 text-xs sm:text-base md:text-sm">
          <span className="text-white">Analytics</span>{" "}
          <span className="text-gray-300 hover:text-white transition-colors duration-300">
            Interactive Experience
          </span>
        </p>
      </div>
    </div>
  );
}
