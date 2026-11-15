"use client";

import AOS from "aos";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function AosProvider() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      AOS.init({
        duration: 650,
        easing: "ease-out-cubic",
        offset: 70,
        once: true,
        disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      initialized.current = true;
    }

    const frame = window.requestAnimationFrame(() => AOS.refreshHard());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
