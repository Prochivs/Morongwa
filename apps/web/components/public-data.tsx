"use client";
import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, Star } from "lucide-react";
import { formatCurrency } from "@queuemate/shared";
import { apiFetch } from "@/lib/api";
import { Card, CardContent } from "./ui/card";

type Institution = { id: string; name: string; address: string; city: string; actualCustomerRequired: boolean };
type Price = { id: string; name: string; amount: string | null; currency: string; type: string };
type Review = { rating: number; comment: string | null; createdAt: string };

export function InstitutionPreview() {
  const query = useQuery({ queryKey: ["institutions"], queryFn: () => apiFetch<Institution[]>("/public/institutions") });
  if (query.isLoading) return <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map((item) => <div className="h-36 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div>;
  if (!query.data?.length) return <Card><CardContent className="flex gap-4"><Building2 className="shrink-0 text-brand" /><div><h3 className="font-semibold">Institution approvals are being configured</h3><p className="mt-1 text-sm leading-6 text-muted">QueueMate only lists institutions after the permitted activity has been reviewed. Contact us to discuss your location.</p></div></CardContent></Card>;
  return <div className="grid gap-4 md:grid-cols-3">{query.data.slice(0, 3).map((item) => <Card key={item.id}><CardContent><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-brand"><Building2 size={20} /></div><h3 className="mt-5 font-semibold text-navy">{item.name}</h3><p className="mt-2 text-sm text-muted">{item.address}, {item.city}</p>{item.actualCustomerRequired && <p className="mt-3 text-xs font-semibold text-amber-700">Customer presence required</p>}</CardContent></Card>)}</div>;
}

export function PricingPreview() {
  const query = useQuery({ queryKey: ["pricing"], queryFn: () => apiFetch<Price[]>("/public/pricing") });
  if (query.isLoading) return <div className="h-40 animate-pulse rounded-xl bg-slate-100" />;
  return <div className="grid gap-4 md:grid-cols-3">{query.data?.slice(0, 3).map((item) => <Card key={item.id}><CardContent><CheckCircle2 className="text-teal" size={22} /><h3 className="mt-5 font-semibold text-navy">{item.name}</h3><p className="mt-3 text-3xl font-bold text-navy">{item.type === "CUSTOM_QUOTE" || !item.amount ? "Custom" : formatCurrency(item.amount, item.currency)}</p><p className="mt-2 text-sm text-muted">Final price is fixed on your request before payment.</p></CardContent></Card>)}</div>;
}

export function ReviewPreview() {
  const query = useQuery({ queryKey: ["reviews"], queryFn: () => apiFetch<Review[]>("/public/reviews") });
  if (query.isLoading) return <div className="h-32 animate-pulse rounded-xl bg-slate-100" />;
  if (!query.data?.length) return <Card><CardContent><h3 className="font-semibold text-navy">Genuine reviews only</h3><p className="mt-2 text-sm leading-6 text-muted">Customer reviews will appear here after completed requests and administrative moderation. QueueMate does not publish invented testimonials.</p></CardContent></Card>;
  return <div className="grid gap-4 md:grid-cols-3">{query.data.map((review, index) => <Card key={index}><CardContent><div className="flex text-amber-500">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div><p className="mt-4 text-sm leading-6 text-slate-700">“{review.comment}”</p><p className="mt-4 text-xs font-semibold text-muted">Verified QueueMate customer</p></CardContent></Card>)}</div>;
}
