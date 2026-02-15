"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export function useParallax() {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return scrollY;
}

export function parallaxStyle(scrollY: number, speed: number, offset = 0) {
  return {
    transform: `translateY(${(scrollY - offset) * speed}px)`,
    willChange: "transform" as const,
  };
}
