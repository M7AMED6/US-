"use client";

import React from "react";

interface ButterflyConfig {
  id: number;
  side: "left" | "right";
  offset: string; // e.g. "4vw"
  top: string;    // e.g. "15vh"
  size: string;   // e.g. "32px"
  floatAnim: string;
  floatDuration: string;
  floatDelay: string;
  flapSpeed: string;
  opacity: number;
}

const butterflyList: ButterflyConfig[] = [
  // Left side butterflies
  { id: 1, side: "left", offset: "3vw", top: "12vh", size: "36px", floatAnim: "float-b-1", floatDuration: "7.8s", floatDelay: "0s", flapSpeed: "0.65s", opacity: 0.72 },
  { id: 2, side: "left", offset: "6vw", top: "32vh", size: "25px", floatAnim: "float-b-2", floatDuration: "9.5s", floatDelay: "1.2s", flapSpeed: "0.58s", opacity: 0.65 },
  { id: 11, side: "left", offset: "2vw", top: "25vh", size: "28px", floatAnim: "float-b-4", floatDuration: "8.7s", floatDelay: "3.1s", flapSpeed: "0.71s", opacity: 0.69 },
  { id: 3, side: "left", offset: "2vw", top: "52vh", size: "40px", floatAnim: "float-b-3", floatDuration: "11.2s", floatDelay: "0.5s", flapSpeed: "0.80s", opacity: 0.78 },
  { id: 12, side: "left", offset: "8vw", top: "62vh", size: "32px", floatAnim: "float-b-2", floatDuration: "10.5s", floatDelay: "1.7s", flapSpeed: "0.64s", opacity: 0.71 },
  { id: 4, side: "left", offset: "7vw", top: "70vh", size: "30px", floatAnim: "float-b-4", floatDuration: "8.4s", floatDelay: "2.3s", flapSpeed: "0.72s", opacity: 0.68 },
  { id: 5, side: "left", offset: "4vw", top: "86vh", size: "27px", floatAnim: "float-b-1", floatDuration: "10.1s", floatDelay: "0.8s", flapSpeed: "0.62s", opacity: 0.75 },

  // Right side butterflies
  { id: 6, side: "right", offset: "3vw", top: "18vh", size: "38px", floatAnim: "float-b-3", floatDuration: "8.2s", floatDelay: "1.5s", flapSpeed: "0.75s", opacity: 0.76 },
  { id: 7, side: "right", offset: "6vw", top: "38vh", size: "26px", floatAnim: "float-b-4", floatDuration: "10.4s", floatDelay: "0.3s", flapSpeed: "0.60s", opacity: 0.62 },
  { id: 13, side: "right", offset: "4vw", top: "45vh", size: "30px", floatAnim: "float-b-1", floatDuration: "9.8s", floatDelay: "2.2s", flapSpeed: "0.68s", opacity: 0.73 },
  { id: 8, side: "right", offset: "2vw", top: "58vh", size: "34px", floatAnim: "float-b-1", floatDuration: "9.1s", floatDelay: "2.7s", flapSpeed: "0.70s", opacity: 0.80 },
  { id: 9, side: "right", offset: "7vw", top: "76vh", size: "28px", floatAnim: "float-b-2", floatDuration: "11.8s", floatDelay: "1.9s", flapSpeed: "0.66s", opacity: 0.67 },
  { id: 14, side: "right", offset: "5vw", top: "82vh", size: "32px", floatAnim: "float-b-4", floatDuration: "10.2s", floatDelay: "0.6s", flapSpeed: "0.74s", opacity: 0.70 },
  { id: 10, side: "right", offset: "4vw", top: "90vh", size: "40px", floatAnim: "float-b-3", floatDuration: "8.7s", floatDelay: "0.9s", flapSpeed: "0.82s", opacity: 0.74 },
];

export default function Butterflies() {
  return (
    <>
      <style>{`
        @keyframes flap-left {
          0%, 100% { transform: scaleX(1) rotate(0deg); }
          50% { transform: scaleX(0.15) rotate(-5deg); }
        }
        @keyframes flap-right {
          0%, 100% { transform: scaleX(1) rotate(0deg); }
          50% { transform: scaleX(0.15) rotate(5deg); }
        }
        @keyframes float-b-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(5deg); }
          50% { transform: translateY(-30px) translateX(10px) rotate(-5deg); }
        }
        @keyframes float-b-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(-5deg); }
          50% { transform: translateY(-40px) translateX(-8px) rotate(5deg); }
        }
        @keyframes float-b-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(4deg); }
          50% { transform: translateY(-35px) translateX(-12px) rotate(-4deg); }
        }
        @keyframes float-b-4 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(-4deg); }
          50% { transform: translateY(-28px) translateX(12px) rotate(4deg); }
        }
      `}</style>

      {butterflyList.map((b) => (
        <div 
          key={b.id}
          className="fixed z-30 pointer-events-none"
          style={{
            left: b.side === "left" ? b.offset : "auto",
            right: b.side === "right" ? b.offset : "auto",
            top: b.top,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            animation: `${b.floatAnim} ${b.floatDuration} ease-in-out ${b.floatDelay} infinite`,
          }}
        >
          <ButterflySVG flapSpeed={b.flapSpeed} />
        </div>
      ))}
    </>
  );
}

function ButterflySVG({ flapSpeed }: { flapSpeed: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: "visible" }}>
      <g style={{ transformOrigin: "50px 50px", animation: `flap-left ${flapSpeed} ease-in-out infinite` }}>
        <path 
          d="M50 50 C30 20, 5 25, 10 45 C15 60, 35 55, 50 55 C40 65, 20 80, 25 88 C30 95, 45 85, 50 70" 
          fill="#F9A8C9" 
          stroke="#F472B6" 
          strokeWidth="2" 
        />
      </g>
      <g style={{ transformOrigin: "50px 50px", animation: `flap-right ${flapSpeed} ease-in-out infinite` }}>
        <path 
          d="M50 50 C70 20, 95 25, 90 45 C85 60, 65 55, 50 55 C60 65, 80 80, 75 88 C70 95, 55 85, 50 70" 
          fill="#F9A8C9" 
          stroke="#F472B6" 
          strokeWidth="2" 
        />
      </g>
      {/* Body & Antennae */}
      <path d="M49 35 Q50 32 51 35 L50.5 75 Q50 77 49.5 75 Z" fill="#F472B6" />
      <path d="M49.5 35 Q45 28 40 30" fill="none" stroke="#F472B6" strokeWidth="1.5" />
      <path d="M50.5 35 Q55 28 60 30" fill="none" stroke="#F472B6" strokeWidth="1.5" />
    </svg>
  );
}
