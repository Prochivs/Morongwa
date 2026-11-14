"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@queuemate/shared";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
type Detail = {
  id: string;
  reference: string;
  quotedAmount: string;
  currency: string;
  requestStatus: string;
  paymentStatus: string;
  scheduledStartAt: string;
  estimatedDurationMinutes: number;
  customer: { fullName: string; email: string; mobile: string };
  institution: {
    name: string;
    active: boolean;
    restrictions?: string;
    actualCustomerRequired: boolean;
  };
  serviceType: { name: string };
  payments: { id: string; status: string }[];
  assignments: {
    id: string;
    status: string;
    agent: { user: { fullName: string } };
  }[];
  notes: {
    id: string;
    content: string;
    createdAt: string;
    author: { fullName: string };
  }[];
};
type Agent = {
  id: string;
  agentReference: string;
  available: boolean;
  user: { fullName: string; status: string };
};
export default function Page() {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const [reason, setReason] = useState("");
  const [agentId, setAgentId] = useState("");
  const [message, setMessage] = useState("");
  const requestQuery = useQuery({
    queryKey: ["admin-request", params.id],
    queryFn: () => apiFetch<Detail>(`/admin/requests/${params.id}`),
  });
  const agents = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => apiFetch<Agent[]>("/admin/agents"),
  });
  const action = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: unknown }) =>
      apiFetch(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
    onSuccess: () => {
      setMessage("Action completed successfully.");
      setReason("");
      void client.invalidateQueries({ queryKey: ["admin-request", params.id] });
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Action failed"),
  });
  const assign = useMutation({
    mutationFn: () =>
      apiFetch("/admin/assignments", {
        method: "POST",
        body: JSON.stringify({
          requestId: params.id,
          agentId,
          travelBufferMinutes: 30,
          overrideConflict: false,
        }),
      }),
    onSuccess: () => {
      setMessage("Agent assigned.");
      void client.invalidateQueries({ queryKey: ["admin-request", params.id] });
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Assignment failed"),
  });
  if (requestQuery.isLoading || !requestQuery.data) return <LoadingState />;
  const item = requestQuery.data;
  return (
    <>
      <PageHeader
        eyebrow="Request review"
        title={item.reference}
        description={`${item.customer.fullName} · ${item.institution.name} · ${formatDate(item.scheduledStartAt)}`}
        action={
          <div className="flex gap-2">
            <Badge status={item.paymentStatus} />
            <Badge status={item.requestStatus} />
          </div>
        }
      />
      {message && (
        <p
          className={`mb-5 rounded-lg p-3 text-sm font-medium ${message.includes("success") || message.includes("assigned") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
        >
          {message}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Operational review</h2>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                {[
                  [
                    "Customer",
                    `${item.customer.fullName} · ${item.customer.mobile}`,
                  ],
                  ["Service", item.serviceType.name],
                  ["Institution", item.institution.name],
                  [
                    "Service fee",
                    formatCurrency(item.quotedAmount, item.currency),
                  ],
                  [
                    "Estimated duration",
                    `${item.estimatedDurationMinutes} minutes`,
                  ],
                  [
                    "Customer required",
                    item.institution.actualCustomerRequired ? "Yes" : "No",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-navy">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              {item.institution.restrictions && (
                <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  {item.institution.restrictions}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">
                Decision and assignment
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  loading={action.isPending && action.variables?.path.endsWith("/approve")}
                  disabled={
                    item.requestStatus !== "PENDING_APPROVAL" ||
                    item.paymentStatus !== "VERIFIED" ||
                    action.isPending
                  }
                  onClick={() =>
                    action.mutate({
                      path: `/admin/requests/${item.id}/approve`,
                    })
                  }
                >
                  Approve request
                </Button>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-6">
                <label className="field-label">Decision reason</label>
                <textarea
                  className="field h-24 py-3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Required for rejection or cancellation"
                />
                <div className="mt-3 flex gap-3">
                  <Button
                    variant="danger"
                    disabled={reason.length < 5 || action.isPending}
                    loading={action.isPending && action.variables?.path.endsWith("/reject")}
                    onClick={() =>
                      action.mutate({
                        path: `/admin/requests/${item.id}/reject`,
                        body: { reason },
                      })
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    disabled={reason.length < 5 || action.isPending}
                    loading={action.isPending && action.variables?.path.endsWith("/cancel")}
                    onClick={() =>
                      action.mutate({
                        path: `/admin/requests/${item.id}/cancel`,
                        body: { reason },
                      })
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              {item.requestStatus === "APPROVED" && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <label className="field-label">
                    Assign an available agent
                  </label>
                  <div className="flex gap-3">
                    <select
                      className="field"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                    >
                      <option value="">Choose agent</option>
                      {agents.data
                        ?.filter(
                          (agent) =>
                            agent.available && agent.user.status === "ACTIVE",
                        )
                        .map((agent) => (
                          <option value={agent.id} key={agent.id}>
                            {agent.agentReference} · {agent.user.fullName}
                          </option>
                        ))}
                    </select>
                    <Button
                      disabled={!agentId}
                      loading={assign.isPending}
                      onClick={() => assign.mutate()}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              )}
              {item.assignments[0] && (
                <p className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  Assigned to{" "}
                  <strong>{item.assignments[0].agent.user.fullName}</strong> ·{" "}
                  {item.assignments[0].status.replaceAll("_", " ")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Payment state</h2>
            </CardHeader>
            <CardContent>
              <Badge status={item.paymentStatus} />
              <p className="mt-4 text-sm leading-6 text-muted">
                Payment approval is managed separately. Open Payments to inspect
                private proof and verify the real bank transaction.
              </p>
              <a
                className="mt-4 inline-block text-sm font-semibold text-brand"
                href="/admin/payments"
              >
                Open payment review →
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Internal notes</h2>
            </CardHeader>
            <CardContent>
              {item.notes.length ? (
                item.notes.map((note) => (
                  <article
                    className="border-b border-slate-100 py-3 last:border-0"
                    key={note.id}
                  >
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="mt-1 text-xs text-muted">
                      {note.author.fullName} · {formatDate(note.createdAt)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No internal notes.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
