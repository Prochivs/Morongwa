import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; size?: "sm" | "md" | "lg" };
export const Button = React.forwardRef<HTMLButtonElement, Props>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:pointer-events-none disabled:opacity-50", { "bg-brand text-white hover:bg-blue-700": variant === "primary", "bg-teal text-navy hover:bg-teal/80": variant === "secondary", "border border-slate-300 bg-white text-ink hover:bg-slate-50": variant === "outline", "bg-red-600 text-white hover:bg-red-700": variant === "danger", "text-slate-600 hover:bg-slate-100": variant === "ghost", "h-9 px-3 text-xs": size === "sm", "h-11 px-4 text-sm": size === "md", "h-12 px-5 text-base": size === "lg" }, className)} {...props} />
));
Button.displayName = "Button";
