import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; size?: "sm" | "md" | "lg" };
export const Button = React.forwardRef<HTMLButtonElement, Props>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex items-center justify-center gap-2 rounded-[3px] font-semibold uppercase tracking-[.08em] transition disabled:pointer-events-none disabled:opacity-50", { "bg-brand text-white hover:bg-blue-700": variant === "primary", "bg-black text-white hover:bg-slate-700": variant === "secondary", "border border-black/20 bg-white text-ink hover:border-black hover:bg-slate-50": variant === "outline", "bg-red-700 text-white hover:bg-red-800": variant === "danger", "text-slate-600 hover:bg-slate-100": variant === "ghost", "h-9 px-3 text-[10px]": size === "sm", "h-11 px-4 text-[10px]": size === "md", "h-12 px-5 text-[11px]": size === "lg" }, className)} {...props} />
));
Button.displayName = "Button";
