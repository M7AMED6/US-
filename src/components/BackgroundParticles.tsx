"use client";

import React, { useEffect, useRef } from "react";

// Design decision: We use a canvas-based particle system rather than DOM elements
// because canvas is significantly more performant, rendering hundreds of particles
// at 60 FPS without layout thrashing (which would cause mobile lag).

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  type: "petal" | "heart" | "butterfly";
  rotation: number;
  rotationSpeed: number;
  color: string;
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    
    // Set exact dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const petalColors = [
      "rgba(255, 255, 255, 0.55)",  // Pure white translucent
      "rgba(255, 192, 203, 0.5)",   // Light blush pink
      "rgba(255, 218, 224, 0.55)",  // Very soft rose white
      "rgba(255, 240, 245, 0.6)",   // Lavender blush
    ];

    const createParticle = (initTop = false): Particle => {
      const rand = Math.random();
      const type = rand < 0.4 ? ("petal" as const) : rand < 0.75 ? ("heart" as const) : ("butterfly" as const);
      
      const size = type === "butterfly" 
        ? Math.random() * 10 + 6 
        : type === "heart"
          ? Math.random() * 12 + 6
          : Math.random() * 14 + 6;
      
      const y = initTop 
        ? -size * 2 
        : Math.random() * canvas.height;
        
      const x = Math.random() * canvas.width;
      
      const speedY = type === "butterfly"
        ? Math.random() * 0.4 + 0.25  // butterflies flutter slower
        : Math.random() * 0.6 + 0.35; // petals/hearts fall gently
      const speedX = (Math.random() - 0.5) * 0.9;
      
      const opacity = type === "butterfly" 
        ? Math.random() * 0.45 + 0.45 // high opacity for white butterflies
        : type === "heart"
          ? Math.random() * 0.4 + 0.35
          : Math.random() * 0.4 + 0.25;
        
      let color = "";
      if (type === "butterfly") {
        color = `rgba(255, 255, 255, ${opacity})`;
      } else if (type === "heart") {
        const isWhite = Math.random() > 0.4;
        color = isWhite 
          ? `rgba(255, 255, 255, ${opacity})`
          : `rgba(255, 225, 235, ${opacity})`;
      } else {
        color = petalColors[Math.floor(Math.random() * petalColors.length)];
      }

      return {
        x,
        y,
        size,
        speedY,
        speedX,
        opacity,
        fadeSpeed: Math.random() * 0.002 + 0.0005,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: type === "butterfly" 
          ? (Math.random() - 0.5) * 0.03 // butterflies rotate/flutter slightly more
          : (Math.random() - 0.5) * 0.015,
        color,
      };
    };

    // Initialize particles (high count to fill large empty spaces)
    const particleCount = Math.min(130, Math.floor((window.innerWidth * window.innerHeight) / 9000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(false));
    }

    // Helper to draw a rose petal
    const drawPetal = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.globalAlpha = p.opacity;
      c.fillStyle = p.color;
      
      c.beginPath();
      c.ellipse(0, 0, p.size / 2, p.size / 3, 0, 0, Math.PI * 2);
      c.closePath();
      c.fill();
      
      // Draw center fold line for realism
      c.beginPath();
      c.strokeStyle = "rgba(255, 255, 255, 0.25)";
      c.lineWidth = 1;
      c.moveTo(-p.size / 2.5, 0);
      c.lineTo(p.size / 2.5, 0);
      c.stroke();
      
      c.restore();
    };

    // Helper to draw a glowing heart
    const drawHeart = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.globalAlpha = p.opacity;
      c.fillStyle = p.color;
      
      c.beginPath();
      c.moveTo(0, -p.size / 4);
      c.bezierCurveTo(-p.size / 2, -p.size / 1.5, -p.size, -p.size / 3, 0, p.size / 2);
      c.bezierCurveTo(p.size, -p.size / 3, p.size / 2, -p.size / 1.5, 0, -p.size / 4);
      c.closePath();
      c.fill();
      
      c.restore();
    };

    // Helper to draw a tiny butterfly
    const drawButterfly = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.globalAlpha = p.opacity;
      c.fillStyle = p.color;
      
      // Left wings
      c.beginPath();
      c.ellipse(-p.size / 3, -p.size / 4, p.size / 3, p.size / 4, Math.PI / 6, 0, Math.PI * 2);
      c.ellipse(-p.size / 4, p.size / 8, p.size / 4, p.size / 6, -Math.PI / 6, 0, Math.PI * 2);
      c.closePath();
      c.fill();
      
      // Right wings
      c.beginPath();
      c.ellipse(p.size / 3, -p.size / 4, p.size / 3, p.size / 4, -Math.PI / 6, 0, Math.PI * 2);
      c.ellipse(p.size / 4, p.size / 8, p.size / 4, p.size / 6, Math.PI / 6, 0, Math.PI * 2);
      c.closePath();
      c.fill();
      
      // Body
      c.beginPath();
      c.fillStyle = "rgba(255, 255, 255, 0.9)";
      c.ellipse(0, 0, p.size / 12, p.size / 3, 0, 0, Math.PI * 2);
      c.closePath();
      c.fill();
      
      c.restore();
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Update positions
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Apply wind sway for nice organic floating motion
        p.speedX += Math.sin(p.y * 0.01 + p.size) * 0.012;

        // Draw particle based on its type
        if (p.type === "heart") {
          drawHeart(ctx, p);
        } else if (p.type === "butterfly") {
          drawButterfly(ctx, p);
        } else {
          drawPetal(ctx, p);
        }

        // Boundary checks - recycle particles when they go off screen
        const isOffScreen = p.y > canvas.height + p.size * 2 || p.x < -p.size || p.x > canvas.width + p.size;

        if (isOffScreen) {
          particles[idx] = createParticle(true);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
