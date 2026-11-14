"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, Bell, Building2, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, LogOut, Menu, Plus, Settings, UserRound, Users, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";

type Me = { id: string; fullName: string; email: string; role: "CUSTOMER" | "ADMIN" | "AGENT" };
const navigation = {
  CUSTOMER: [[LayoutDashboard,"Home","/customer"],[Plus,"Request help","/customer/requests/new"],[ClipboardList,"Requests","/customer/requests"],[UserRound,"Profile","/customer/profile"]],
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
  return (
    <div className={cn("min-h-screen bg-canvas", me.data.role === "ADMIN" && "portal-admin")}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-5 text-navy shadow-[4px_0_24px_rgba(15,23,42,.04)] transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="-mx-5 -mt-5 flex h-16 items-center justify-between border-b border-black/10 px-5">
          <Brand />
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-navy lg:hidden" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {me.data.role !== "CUSTOMER" && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="truncate text-sm font-normal text-navy">{me.data.fullName}</p>
            <p className="mt-1 truncate text-xs text-muted">{me.data.email}</p>
            <span className="mt-3 inline-block rounded-lg bg-brand px-2.5 py-1 text-[9px] font-normal uppercase tracking-[.12em] text-white">
              {me.data.role.toLowerCase()}
            </span>
          </div>
        )}

        <nav className={`${me.data.role === "CUSTOMER" ? "mt-10" : "mt-6"} space-y-1.5`}>
          {links.map(([Icon, label, href]) => {
            const active = pathname === href || (href === "/customer" ? false : href === "/customer/requests" ? pathname.startsWith(`${href}/`) && pathname !== "/customer/requests/new" : href !== "/customer/requests/new" && pathname.startsWith(`${href}/`));
            return (
              <Link
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-normal",
                  active ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-navy",
                )}
                href={href}
                key={href}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-normal text-slate-500 hover:bg-slate-100 hover:text-navy"
          onClick={() => logout.mutate()}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/90 px-5 backdrop-blur sm:px-8">
          <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <p className="hidden text-xs font-normal text-muted sm:block">{me.data.role === "CUSTOMER" ? "QueueMate" : "QueueMate Operations Platform"}</p>
          <Link aria-label={me.data.role === "CUSTOMER" ? "Notifications" : "Account overview"} className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100" href={me.data.role === "CUSTOMER" ? "/customer/notifications" : `/${me.data.role.toLowerCase()}`}><Bell size={20} /></Link>
        </header>
        <main className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
