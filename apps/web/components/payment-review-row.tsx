"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@queuemate/shared";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
type Payment = {
  id: string;
  amountExpected: string;
  amountSubmitted?: string;
  currency: string;
  paymentReference?: string;
  status: string;
  createdAt: string;
  request: {
    reference: string;
    customer: { fullName: string; email: string };
    institution: { name: string };
  };
  proofs: { id: string; originalName: string; uploadedAt: string }[];
};
export function PaymentReviewRow({ payment }: { payment: Payment }) {
  const client = useQueryClient();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const decision = useMutation({
    mutationFn: (type: "verify" | "reject") =>
      apiFetch(`/admin/payments/${payment.id}/${type}`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }),
    onSuccess: () => {
      setNotes("");
      setError("");
      void client.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (error) =>
      setError(error instanceof Error ? error.message : "Action failed"),
  });
  return (
    <div className="relative isolate grid gap-5 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#f4fbff] via-white to-white p-5 last:border-0 lg:grid-cols-[1fr_.7fr_.8fr]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#009de7]/15 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-200/25 blur-3xl"
      />
      <div className="relative z-10 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-navy">{payment.request.reference}</p>
          <Badge status={payment.status} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {payment.request.customer.fullName} ·{" "}
          {payment.request.institution.name}
        </p>
        <p className="mt-3 text-sm">
          <span className="text-muted">Expected:</span>{" "}
          <strong>
            {formatCurrency(payment.amountExpected, payment.currency)}
          </strong>{" "}
          · <span className="text-muted">Submitted:</span>{" "}
          <strong>
            {payment.amountSubmitted
              ? formatCurrency(payment.amountSubmitted, payment.currency)
              : "—"}
          </strong>
        </p>
        <p className="mt-1 text-xs text-muted">
          Bank reference: {payment.paymentReference ?? "Not supplied"}
        </p>
      </div>
      <div className="relative z-10 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_12px_30px_rgba(0,157,231,0.08)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Private proof
        </p>
        {payment.proofs.length ? (
          payment.proofs.map((proof) => (
            <a
              className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand"
              href={`/api/v1/payments/proofs/${proof.id}/file`}
              target="_blank"
              rel="noreferrer"
              key={proof.id}
            >
              {proof.originalName}
              <ExternalLink size={14} />
            </a>
          ))
        ) : (
          <p className="mt-2 text-sm text-muted">No proof uploaded.</p>
        )}
      </div>
      <div className="relative z-10 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_12px_30px_rgba(0,157,231,0.08)] backdrop-blur-md">
        <textarea
          className="field h-20 bg-white/90 py-2"
          placeholder="Verification notes (required)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        {error && (
          <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
        )}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            disabled={
              notes.length < 3 ||
              decision.isPending ||
              payment.status === "VERIFIED"
            }
            onClick={() => decision.mutate("verify")}
          >
            Verify
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={
              notes.length < 3 ||
              decision.isPending ||
              payment.status === "VERIFIED"
            }
            onClick={() => decision.mutate("reject")}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
