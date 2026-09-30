import React, { useState, useEffect } from "react";

/**
 * ScrollProgressBar - Sleek glowing telemetry progress bar along the top of the viewport
 * Reacts smoothly to page scroll position.
 */
export const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Check window/document scroll first
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      let currentProgress = 0;
      if (docHeight > 0 && window.scrollY > 0) {
        currentProgress = (window.scrollY / docHeight) * 100;
      } else {
        // Check dashboard main scroll container
        const main = document.querySelector("main");
        if (main && main.scrollHeight > main.clientHeight) {
          currentProgress = (main.scrollTop / (main.scrollHeight - main.clientHeight)) * 100;
        }
      }
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  if (scrollProgress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-[#FDE047] to-primary transition-all duration-150 ease-out shadow-[0_0_12px_rgba(245,158,11,0.6)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};
