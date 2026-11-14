import * as React from "react";
import { cn } from "@/lib/utils";
import { BouncingSquares } from "../data-state";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; size?: "sm" | "md" | "lg"; loading?: boolean };
export const Button = React.forwardRef<HTMLButtonElement, Props>(({ children, className, disabled, loading = false, variant = "primary", size = "md", ...props }, ref) => (
  <button ref={ref} aria-busy={loading || undefined} data-variant={variant} disabled={disabled || loading} className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-normal transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50", { "bg-brand text-white shadow-sm hover:bg-[#1a1c27] hover:text-white hover:shadow-md": variant === "primary", "bg-black text-white shadow-sm hover:bg-slate-700 hover:shadow-md": variant === "secondary", "border border-black/15 bg-white text-ink hover:border-black/30 hover:bg-slate-50": variant === "outline", "bg-red-700 text-white hover:bg-red-800": variant === "danger", "text-slate-600 hover:bg-slate-100": variant === "ghost", "h-9 px-3 text-xs": size === "sm", "h-11 px-4 text-xs": size === "md", "h-12 px-5 text-sm": size === "lg" }, className)} {...props}>
    {loading ? <BouncingSquares compact inverse={variant === "primary" || variant === "secondary" || variant === "danger"} /> : children}
  </button>
));
Button.displayName = "Button";
