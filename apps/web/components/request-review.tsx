"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BouncingSquares } from "@/components/data-state";

export type RequestReview = { id: string; rating: number; comment?: string | null; approved: boolean; createdAt: string };

export function ReviewSubmission({ requestId, review }: { requestId: string; review?: RequestReview | null }) {
  const client = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const submit = useMutation({
    mutationFn: () => apiFetch<RequestReview>(`/requests/${requestId}/review`, { method: "POST", body: JSON.stringify({ rating, comment }) }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["request", requestId] }),
    onError: (reason) => setError(reason instanceof Error ? reason.message : "Unable to submit your review"),
  });

  if (review) {
    return (
      <Card className="xl:col-span-2">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-normal text-navy">Thank you for your feedback</p>
            <div aria-label={`${review.rating} out of 5 stars`} className="mt-2 flex gap-1 text-brand">
              {Array.from({ length: 5 }).map((_, index) => <Star fill={index < review.rating ? "currentColor" : "none"} key={index} size={17} />)}
            </div>
            {review.comment && <p className="mt-3 text-sm leading-6 text-muted">“{review.comment}”</p>}
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-normal text-emerald-700"><Check size={14} />Review submitted</span>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!rating) {
      setError("Choose a star rating before submitting.");
      return;
    }
    submit.mutate();
  };

  const shownRating = hoveredRating || rating;
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <h2 className="text-[15px] font-normal text-navy">How was your QueueMate experience?</h2>
        <p className="mt-1 text-sm font-normal text-muted">Your feedback helps us improve the service.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend className="field-label">Rating</legend>
            <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button aria-label={`${value} star${value === 1 ? "" : "s"}`} className="rounded-lg p-1 text-brand hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-brand/30" key={value} onClick={() => setRating(value)} onMouseEnter={() => setHoveredRating(value)} type="button">
                    <Star fill={value <= shownRating ? "currentColor" : "none"} size={25} />
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-5">
            <label className="field-label" htmlFor="review-comment">Comment (optional)</label>
            <textarea className="field h-28 resize-none py-3" id="review-comment" maxLength={1000} placeholder="Tell us what went well or what we could improve" value={comment} onChange={(event) => setComment(event.target.value)} />
            <p className="mt-1 text-right text-[11px] text-muted">{comment.length}/1000</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm text-red-700">{error}</p>
            <Button className="min-w-[140px] text-xs font-normal" disabled={submit.isPending} type="submit">
              {submit.isPending && <BouncingSquares compact inverse />}
              Submit review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
