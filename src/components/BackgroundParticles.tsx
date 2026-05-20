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
  type: "petal";
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
      "rgba(255, 182, 193, 0.4)",  // Blush Pink
      "rgba(244, 114, 182, 0.35)", // Soft Rose
      "rgba(225, 29, 72, 0.15)",   // Deep Rose (low opacity)
      "rgba(255, 240, 243, 0.5)",  // Pastel background tone
    ];

    const createParticle = (initTop = false): Particle => {
      const type = "petal" as const;
      const size = Math.random() * 16 + 6;
      
      // If initTop is true, place them at the top of the screen (for falling petals)
      // Otherwise, distribute them randomly across the screen initially
      const y = initTop 
        ? -size * 2 
        : Math.random() * canvas.height;
        
      const x = Math.random() * canvas.width;
      
      // Petals drift downwards and side-to-side
      const speedY = Math.random() * 0.7 + 0.4;  // falling
      const speedX = (Math.random() - 0.5) * 1.2;
      
      const opacity = Math.random() * 0.5 + 0.2;  // standard for petals
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];

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
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        color,
      };
    };

    // Initialize particles
    const particleCount = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(false));
    }

    // Helper to draw a rose petal (ellipse with pointed ends)
    const drawPetal = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.globalAlpha = p.opacity;
      c.fillStyle = p.color;
      
      // Draw stylized rose petal
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

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Update positions
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Apply wind sway for petals
        p.speedX += Math.sin(p.y * 0.01 + p.size) * 0.01;

        // Draw particle
        drawPetal(ctx, p);

        // Boundary checks - recycle particles when they go off screen (past bottom)
        const isOffScreen = p.y > canvas.height + p.size * 2 || p.x < -p.size || p.x > canvas.width + p.size;

        if (isOffScreen) {
          // Recycle
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
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
