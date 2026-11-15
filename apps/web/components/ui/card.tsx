"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { usePortalMotion } from "@/components/portal-motion";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const animateFromBottom = usePortalMotion();
  return <div className={cn("panel", className)} data-aos={animateFromBottom ? "fade-up" : undefined} {...props} />;
}
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("border-b border-slate-100 p-5 sm:p-6", className)} {...props} />; }
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-5 sm:p-6", className)} {...props} />; }
