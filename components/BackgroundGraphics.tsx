"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * BackgroundGraphics renders dynamic Kerala vibes (coconut trees, vaazha banana leaves,
 * countryside silhouettes, tea-shop warm ambient glow, and floating bokeh/steam particles).
 */
export const BackgroundGraphics: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Floating ambient bokeh tea-shop spark particles
  const particles = [
    { id: 1, left: "12%", size: "w-2 h-2", duration: 7, delay: 0 },
    { id: 2, left: "28%", size: "w-3 h-3", duration: 9, delay: 2 },
    { id: 3, left: "72%", size: "w-2.5 h-2.5", duration: 8, delay: 1 },
    { id: 4, left: "85%", size: "w-2 h-2", duration: 10, delay: 3 },
    { id: 5, left: "48%", size: "w-3 h-3", duration: 11, delay: 0.5 },
  ];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* 1. Warm Tea-Shop Radial Ambiance Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient from-amber-500/10 via-chai-600/5 to-transparent blur-3xl rounded-full opacity-70" />

      {/* 2. Floating Chai Shop Steam / Bokeh Sparks */}
      {!shouldReduceMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: "100vh", opacity: 0 }}
            animate={{
              y: ["80vh", "-10vh"],
              opacity: [0, 0.6, 0.4, 0],
              scale: [0.8, 1.2, 0.9],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ left: p.left }}
            className={`absolute rounded-full bg-amber-400/30 blur-[1px] shadow-lg shadow-amber-500/20 ${p.size}`}
          />
        ))}

      {/* 3. Left Swaying Coconut Tree & Vaazha Leaf Silhouette */}
      <motion.div
        animate={
          shouldReduceMotion
            ? { rotate: 0 }
            : {
                rotate: [-1.2, 1.5, -1.2],
                transition: {
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
        className="absolute -bottom-10 -left-12 sm:-left-6 w-48 sm:w-72 md:w-80 opacity-20 sm:opacity-25 mix-blend-screen text-emerald-900"
      >
        <svg
          viewBox="0 0 300 400"
          fill="currentColor"
          className="w-full h-full text-amber-950/80 drop-shadow-[0_0_15px_rgba(245,158,11,0.05)]"
        >
          {/* Trunk */}
          <path d="M 50,400 Q 90,250 140,100 C 145,90 150,85 155,80 C 145,85 140,92 135,100 Q 82,250 40,400 Z" />

          {/* Fronds / Coconut Leaves */}
          <path d="M 150,80 Q 90,50 20,70 Q 80,90 150,80 Z" />
          <path d="M 150,80 Q 110,20 50,10 Q 110,40 150,80 Z" />
          <path d="M 150,80 Q 180,20 250,30 Q 190,50 150,80 Z" />
          <path d="M 150,80 Q 220,60 280,100 Q 200,100 150,80 Z" />
          <path d="M 150,80 Q 190,120 240,170 Q 170,130 150,80 Z" />

          {/* Vaazha (Banana) Leaf at base */}
          <path d="M 30,400 Q 90,320 150,350 Q 80,380 30,400 Z" className="opacity-70" />
        </svg>
      </motion.div>

      {/* 4. Right Swaying Coconut Tree Silhouette */}
      <motion.div
        animate={
          shouldReduceMotion
            ? { rotate: 0 }
            : {
                rotate: [1.5, -1.2, 1.5],
                transition: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
        className="absolute -bottom-10 -right-12 sm:-right-6 w-48 sm:w-72 md:w-80 opacity-20 sm:opacity-25 mix-blend-screen text-amber-900"
      >
        <svg
          viewBox="0 0 300 400"
          fill="currentColor"
          className="w-full h-full text-amber-950/80 drop-shadow-[0_0_15px_rgba(245,158,11,0.05)]"
        >
          {/* Trunk */}
          <path d="M 250,400 Q 210,250 160,100 C 155,90 150,85 145,80 C 155,85 160,92 165,100 Q 218,250 260,400 Z" />

          {/* Fronds */}
          <path d="M 150,80 Q 210,50 280,70 Q 220,90 150,80 Z" />
          <path d="M 150,80 Q 190,20 250,10 Q 190,40 150,80 Z" />
          <path d="M 150,80 Q 120,20 50,30 Q 110,50 150,80 Z" />
          <path d="M 150,80 Q 80,60 20,100 Q 100,100 150,80 Z" />
          <path d="M 150,80 Q 110,120 60,170 Q 130,130 150,80 Z" />

          {/* Vaazha Leaf at right base */}
          <path d="M 270,400 Q 210,320 150,350 Q 220,380 270,400 Z" className="opacity-70" />
        </svg>
      </motion.div>

      {/* 5. Subtle Vignette Border */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/80 pointer-events-none" />
    </div>
  );
};
