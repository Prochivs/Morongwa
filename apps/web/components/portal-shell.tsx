"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, Bell, Building2, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, LogOut, Menu, Plus, Settings, Users, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";

type Me = { id: string; fullName: string; email: string; role: "CUSTOMER" | "ADMIN" | "AGENT" };
const navigation = {
  CUSTOMER: [[LayoutDashboard,"Overview","/customer"],[Plus,"New request","/customer/requests/new"],[ClipboardList,"My requests","/customer/requests"],[Bell,"Notifications","/customer/notifications"]],
  ADMIN: [[LayoutDashboard,"Overview","/admin"],[ClipboardList,"Requests","/admin/requests"],[CreditCard,"Payments","/admin/payments"],[Users,"Agents","/admin/agents"],[CalendarDays,"Schedule","/admin/schedule"],[Building2,"Institutions","/admin/institutions"],[BarChart3,"Reports","/admin/reports"],[Settings,"Settings","/admin/settings"]],
  AGENT: [[LayoutDashboard,"Overview","/agent"],[ClipboardList,"Assignments","/agent/assignments"],[CalendarDays,"Availability","/agent/availability"],[CreditCard,"Earnings","/agent/earnings"]],
} as const;

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiFetch<Me>("/auth/me"), retry: false });
  const logout = useMutation({ mutationFn: () => apiFetch("/auth/logout", { method: "POST" }), onSuccess: () => { router.push("/login"); router.refresh(); } });
  useEffect(() => { if (me.isError) router.replace("/login"); }, [me.isError, router]);
  useEffect(() => { if (!me.data) return; const base = pathname.split("/")[1]; const expected = me.data.role.toLowerCase(); if (base && base !== expected) router.replace(`/${expected}`); }, [me.data, pathname, router]);
  if (me.isLoading || !me.data) return <div className="grid min-h-screen place-items-center bg-canvas"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-brand" /></div>;
  const links = navigation[me.data.role];
  return <div className="min-h-screen bg-canvas"><aside className={cn("fixed inset-y-0 left-0 z-50 w-72 border-r border-white/15 bg-black p-5 text-white transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}><div className="flex items-center justify-between"><Brand light /><button className="p-2 text-white lg:hidden" onClick={() => setOpen(false)}><X /></button></div><div className="mt-8 border border-white/15 p-4"><p className="truncate text-sm font-semibold text-white">{me.data.fullName}</p><p className="mt-1 truncate text-xs text-white/45">{me.data.email}</p><span className="mt-3 inline-block bg-brand px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-white">{me.data.role.toLowerCase()}</span></div><nav className="mt-6 space-y-1">{links.map(([Icon,label,href]) => { const active = href === `/${pathname.split("/")[1]}` ? pathname === href : pathname.startsWith(href); return <Link onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm font-medium", active ? "bg-brand text-white" : "text-white/60 hover:bg-white/10 hover:text-white")} href={href} key={href}><Icon size={18} />{label}</Link>; })}</nav><button className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white" onClick={() => logout.mutate()}><LogOut size={18} />Sign out</button></aside>{open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}<div className="lg:pl-72"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/15 bg-white/95 px-5 backdrop-blur sm:px-8"><button className="p-2 lg:hidden" onClick={() => setOpen(true)}><Menu /></button><p className="hidden text-[10px] font-semibold uppercase tracking-[.16em] text-muted sm:block">QueueMate Operations Platform</p><Link className="relative p-2 text-slate-500 hover:bg-slate-100" href={me.data.role === "CUSTOMER" ? "/customer/notifications" : `/${me.data.role.toLowerCase()}`}><Bell size={20} /></Link></header><main className="p-5 sm:p-8 lg:p-10">{children}</main></div></div>;
}
