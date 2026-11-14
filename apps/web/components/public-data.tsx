"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Star } from "lucide-react";
import { formatCurrency } from "@queuemate/shared";
import { apiFetch } from "@/lib/api";
import { Card, CardContent } from "./ui/card";

type Institution = { id: string; name: string; address: string; city: string; actualCustomerRequired: boolean };
type Price = { id: string; name: string; amount: string | null; currency: string; type: string };
type Review = { rating: number; comment: string | null; createdAt: string };
type DisplayReview = Review & { id: string; sample?: boolean };

const sampleReviews: DisplayReview[] = [
  {
    id: "sample-1",
    rating: 5,
    comment: "The process felt simple from the start, and I always knew what was happening with my request.",
    createdAt: "",
    sample: true,
  },
  {
    id: "sample-2",
    rating: 5,
    comment: "I could carry on with my day while checking each update from my phone.",
    createdAt: "",
    sample: true,
  },
  {
    id: "sample-3",
    rating: 5,
    comment: "The fee was clear before I confirmed, and the request steps were easy to follow.",
    createdAt: "",
    sample: true,
  },
  {
    id: "sample-4",
    rating: 5,
    comment: "The updates were helpful and made it easy to know when I needed to be available.",
    createdAt: "",
    sample: true,
  },
  {
    id: "sample-5",
    rating: 5,
    comment: "Submitting a request took only a few minutes, and everything stayed clear afterward.",
    createdAt: "",
    sample: true,
  },
];

export function InstitutionPreview() {
  const query = useQuery({ queryKey: ["institutions"], queryFn: () => apiFetch<Institution[]>("/public/institutions") });
  if (query.isLoading) return <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map((item) => <div className="h-36 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div>;
  if (!query.data?.length) return <Card><CardContent className="flex gap-4"><Building2 className="shrink-0 text-brand" /><div><h3 className="font-semibold">Institution approvals are being configured</h3><p className="mt-1 text-sm leading-6 text-muted">QueueMate only lists institutions after the permitted activity has been reviewed. Contact us to discuss your location.</p></div></CardContent></Card>;
  return <div className="grid gap-4 md:grid-cols-3">{query.data.slice(0, 3).map((item) => <Card key={item.id}><CardContent><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-brand"><Building2 size={20} /></div><h3 className="mt-5 font-semibold text-navy">{item.name}</h3><p className="mt-2 text-sm text-muted">{item.address}, {item.city}</p>{item.actualCustomerRequired && <p className="mt-3 text-xs font-semibold text-amber-700">Customer presence required</p>}</CardContent></Card>)}</div>;
}

export function PricingPreview({ layout = "cards" }: { layout?: "cards" | "list" | "plans" }) {
  const query = useQuery({ queryKey: ["pricing"], queryFn: () => apiFetch<Price[]>("/public/pricing") });
  if (query.isLoading) {
    if (layout === "list") return <div className="divide-y divide-navy/10 border-y border-navy/10">{[1,2,3].map((item) => <div className="h-24 animate-pulse bg-white/45" key={item} />)}</div>;
    if (layout === "plans") return <div className="grid gap-6 md:grid-cols-3 lg:gap-8">{[1,2,3].map((item) => <div className="h-[300px] animate-pulse rounded-[18px] bg-slate-100" key={item} />)}</div>;
    return <div className="grid gap-3 sm:grid-cols-3">{[1,2,3].map((item) => <div className="h-48 animate-pulse rounded-[18px] bg-slate-100" key={item} />)}</div>;
  }
  if (query.isError || !query.data?.length) {
    if (layout === "list") return <div className="border-y border-navy/15 py-7"><h3 className="font-medium text-navy">Live pricing is temporarily unavailable</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">We could not load the current fees. Please try again shortly; your final price will always be shown before you submit a request.</p></div>;
    if (layout === "plans") return <div className="rounded-[18px] border border-navy/10 bg-white p-6 text-navy"><h3 className="font-medium">Live pricing is temporarily unavailable</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">We could not load the current fees. Please try again shortly; your final price will always be shown before you submit a request.</p></div>;
    return <Card className="shadow-none"><CardContent><h3 className="font-medium text-navy">Live pricing is temporarily unavailable</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">We could not load the current fees. Please try again shortly; your final price will always be shown before you submit a request.</p></CardContent></Card>;
  }
  if (layout === "list") return <div className="divide-y divide-navy/10 border-y border-navy/15">{query.data.slice(0, 3).map((item) => <div className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8" key={item.id}><div><h3 className="font-medium text-navy">{item.name}</h3><p className="mt-1 text-sm leading-6 text-muted">Confirmed before you submit and fixed to your request.</p></div><p className="text-2xl font-medium tracking-[-.03em] text-navy">{item.type === "CUSTOM_QUOTE" || !item.amount ? "Custom quote" : formatCurrency(item.amount, item.currency)}</p></div>)}</div>;
  if (layout === "plans") return <div className="grid gap-6 md:grid-cols-3 lg:gap-8">{query.data.slice(0, 3).map((item, index) => <article className={`flex min-h-[300px] flex-col rounded-[18px] border p-6 ${index === 1 ? "border-brand bg-blue-50/60 shadow-card" : "border-navy/10 bg-white shadow-sm"}`} key={item.id}>
    <p className="text-sm font-medium text-navy/70">{item.name}</p>
    <p className="mt-3 text-3xl font-medium tracking-[-.04em] text-navy">{item.type === "CUSTOM_QUOTE" || !item.amount ? "Custom quote" : formatCurrency(item.amount, item.currency)}</p>
    <ul className="mt-7 list-disc space-y-3 pl-4 text-xs leading-5 text-muted marker:text-brand">
      <li>Verified queue agent</li>
      <li>Live request updates</li>
      <li>Price fixed before payment</li>
    </ul>
    <Link className={`mt-auto inline-flex h-11 items-center justify-center rounded-lg border px-4 text-xs font-semibold ${index === 1 ? "border-brand bg-brand text-white hover:border-[#1a1c27] hover:bg-[#1a1c27] hover:text-white" : "border-navy/20 text-navy hover:border-brand hover:text-brand"}`} href="/register">Choose this service</Link>
  </article>)}</div>;
  return <div className="grid gap-3 sm:grid-cols-3">{query.data?.slice(0, 3).map((item) => <Card className="h-full shadow-none" key={item.id}><CardContent className="flex h-full min-h-[200px] flex-col"><h3 className="text-sm font-medium leading-6 text-navy">{item.name}</h3><p className="mt-5 text-3xl font-medium tracking-[-.035em] text-navy">{item.type === "CUSTOM_QUOTE" || !item.amount ? "Custom quote" : formatCurrency(item.amount, item.currency)}</p><p className="mt-auto border-t border-navy/10 pt-4 text-xs leading-5 text-muted">Confirmed before you submit and fixed to your request.</p></CardContent></Card>)}</div>;
}

export function ReviewPreview() {
  const [page, setPage] = useState(0);
  const query = useQuery({ queryKey: ["reviews"], queryFn: () => apiFetch<Review[]>("/public/reviews") });
  const approvedReviews: DisplayReview[] = (query.data ?? []).slice(0, 5).map((review, index) => ({
    ...review,
    id: `approved-${review.createdAt}-${index}`,
  }));
  const reviews = approvedReviews.length
    ? [...approvedReviews, ...sampleReviews.slice(0, Math.max(0, 5 - approvedReviews.length))]
    : sampleReviews;
  const currentPage = page % reviews.length;
  const visibleReviews = [
    reviews[(currentPage - 1 + reviews.length) % reviews.length],
    reviews[currentPage],
    reviews[(currentPage + 1) % reviews.length],
  ];

  useEffect(() => {
    if (reviews.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setPage((value) => (value + 1) % reviews.length), 5000);
    return () => window.clearInterval(interval);
  }, [reviews.length]);

  return <div className="rounded-[24px] bg-slate-100 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
    <div aria-live="off" className="grid gap-6 md:grid-cols-3">{visibleReviews.map((review, index) => <article className={`${index === 1 ? "flex border-brand/60 shadow-card" : "hidden border-navy/5 shadow-sm md:flex"} min-h-[260px] flex-col rounded-[18px] border bg-white p-7 transition-all duration-500`} key={review.id}>
      <div aria-label={`${review.rating} out of 5 stars`} className="flex gap-1 text-brand">{Array.from({ length: review.rating }).map((_, i) => <Star aria-hidden="true" fill="currentColor" key={i} size={16} />)}</div>
      <p className="mt-6 text-sm leading-7 text-slate-700">“{review.comment || "Rating submitted after a completed QueueMate request."}”</p>
      <div className="mt-auto border-t border-navy/10 pt-5">
        <p className="text-sm font-normal text-navy">{review.sample ? "Sample customer story" : "Verified QueueMate customer"}</p>
        <p className="mt-1 text-xs text-muted">{review.sample ? "Preview content" : `Completed request · ${new Date(review.createdAt).toLocaleDateString("en-BW", { month: "short", year: "numeric" })}`}</p>
      </div>
    </article>)}</div>
    <div className="mt-8 flex items-center justify-center">
      <div className="flex gap-1.5" role="tablist" aria-label="Choose a customer review">
        {reviews.map((review, index) => <button aria-label={`Show review ${index + 1}`} aria-selected={currentPage === index} className={`h-1.5 rounded-full transition-all ${currentPage === index ? "w-5 bg-brand" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`} key={review.id} onClick={() => setPage(index)} role="tab" type="button" />)}
      </div>
    </div>
  </div>;
}
