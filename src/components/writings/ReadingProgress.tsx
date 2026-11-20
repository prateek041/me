"use client";

import { useEffect, useRef } from "react";

/** Thin bar under the top of the window that fills as you read. Hidden in the paper theme. */
export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      if (bar.current) bar.current.style.width = `${max > 0 ? Math.min(100, (d.scrollTop / max) * 100) : 0}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] bg-border/60 paper:hidden">
      <div ref={bar} className="h-full w-0 bg-brand" />
    </div>
  );
}
