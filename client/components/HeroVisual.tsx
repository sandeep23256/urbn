"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// A real product photo, styled with ambient color glows and a subtle
// mouse-tilt effect — reads as premium and "designed" rather than an
// approximated 3D shape built from boxes, which never quite reads as a shoe.
export default function HeroVisual() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="relative flex h-[320px] items-center justify-center sm:h-[420px] md:h-[560px]">
      {/* ambient color glows behind the card */}
      <div className="absolute left-[8%] top-[8%] h-40 w-40 rounded-full bg-electric/40 blur-3xl sm:h-56 sm:w-56" />
      <div className="absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full bg-coral/35 blur-3xl sm:h-56 sm:w-56" />
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid/15 blur-3xl" />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        className="relative h-[78%] w-[82%] max-w-md transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=900&q=80"
          alt="URBN Lab sneaker"
          fill
          sizes="(max-width: 768px) 80vw, 400px"
          className="rounded-3xl object-cover shadow-2xl shadow-coral/20"
          priority
        />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-electric/10 via-transparent to-coral/10" />

        {/* floating badge for a bit of designed detail */}
        <div className="absolute -bottom-4 -left-4 rounded-xl border border-black/10 bg-ink/90 px-3 py-2 text-xs text-bone shadow-lg backdrop-blur">
          <span className="text-amber">●</span> Current drop live
        </div>
      </div>
    </div>
  );
}
